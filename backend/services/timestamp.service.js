const mongoose = require("mongoose");
const dayjs = require("dayjs");
const jwt = require("jsonwebtoken");
const config = require("../configs/app");

const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorUnauthorized,
} = require("../configs/errorMethods");
const Timestamp = require("../models/Timestamp");
const Project = require("../models/Project");
const Image = require("../models/Image");
const User = require("../models/User");
const Employee = require("../models/Employee");
const NotifyService = require("./notify.service");
const RoleTypeService = require("./roleType.service");
const UploadService = require("./upload.service");
const DiscordService = require("./discord.service");
const OtRequest = require("../models/OtRequest"); // เพิ่มบรรทัดนี้ด้านบน
const SsoTransection = require("../models/SsoTransection");
const informationService = require("./information.service");
const ActivityLogService = require("./activityLog.service");
const { getIO } = require("../configs/socket");
require("dayjs/locale/th");

function roundToHalf(num) {
  return Math.round((num / 8) * 2) / 2;
}

function clampNumber(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function calcSsoDeduction({
  baseSalary,
  ratePercent,
  maxAmount,
  alreadyPaid = 0,
  enabled = true,
}) {
  if (!enabled) return 0;
  const salary = clampNumber(baseSalary, 0);
  const rate = clampNumber(ratePercent, 0);
  const max = clampNumber(maxAmount, 0);
  const paid = clampNumber(alreadyPaid, 0);

  const raw = (salary * rate) / 100;
  const remain = Math.max(0, max - paid);
  const total = Math.max(0, Math.min(raw, remain));
  return Number(total.toFixed(2));
}

/**
 * คำนวณนาทีมาสายจากเวลาเช็คอินกับเวลาเข้างาน (work_start_time "HH:mm")
 * คืนค่าเป็นจำนวนนาที (ไม่ติดลบ)
 */
function getMinutesLate(checkInDate, workStartTimeStr) {
  if (!checkInDate || !workStartTimeStr) return 0;
  const [h, m] = String(workStartTimeStr).trim().split(":").map(Number);
  const day = dayjs(checkInDate);
  const workStart = day
    .hour(Number.isFinite(h) ? h : 8)
    .minute(Number.isFinite(m) ? m : 0)
    .second(0)
    .millisecond(0);
  const diffMinutes = dayjs(checkInDate).diff(workStart, "minute", true);
  return Math.max(0, Math.round(diffMinutes));
}

/**
 * หักเงินมาสาย: เงินเดือน/30/8/60 × นาทีมาสาย
 */
function calcLateDeduction(salaryPerMonth, minutesLate) {
  const salary = clampNumber(salaryPerMonth, 0);
  const minutes = clampNumber(minutesLate, 0);
  if (minutes <= 0) return 0;
  const perMinute = salary / 30 / 8 / 60;
  return Number((minutes * perMinute).toFixed(2));
}

function caltotalTime(start, end) {
  var diffInHours = dayjs(end).diff(dayjs(start), "hour", true);
  if (diffInHours > 8) {
    diffInHours = 8;
  }
  return roundToHalf(diffInHours);
}

function caltotalTimeBefore(start, end) {
  var diffInHours = dayjs(end).diff(dayjs(start), "hour", true);
  if (diffInHours > 8) {
    diffInHours = 8;
  }
  return diffInHours;
}

/** แยกช่องทางลงเวลา: ลิงก์ manpower (มี employeekey หรือส่ง check_in_source) vs หน้า profile */
function resolveTimestampCheckInSource(body) {
  if (body?.check_in_source === "manpower_link") return "manpower_link";
  if (body?.check_in_source === "profile") return "profile";
  if (body?.employeekey) return "manpower_link";
  return "profile";
}

/** โครงการเก่าที่ไม่มีฟิลด์ = เปิดลิงก์ (เทียบเท่า default true) */
function isProjectLinkTrackingEnabled(projectDoc) {
  return projectDoc?.time_tracking_link_enabled !== false;
}

const methods = {
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    // Build query
    const query = {};
    if (req.query.employeekey) {
      query.employeekey = { $regex: req.query.employeekey, $options: "i" };
    }
    if (req?.params?.id) query._id = req.params.id;
    if (req.query.ot === "true") query["ot_status.require"] = true;
    if (req.query.type) query.employeeType = req.query.type;
    if (req.query.profile) query.employee = req.query.profile;
    if (req.query.me) {
      query.employee = req.query.me;
      query.status_checkOut = false;
    }
    if (req.query.project_id) query.project_in = req.query.project_id;
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    if (req.query.checkoutem) {
      query.$or = [
        { employeekey: req.query.checkoutem },
        { employee_firstname: req.query.checkoutem },
        { employee_id: req.query.checkoutem },
      ];
      query.status_checkOut = false;
    }
    if (req.query.em) query.employee = req.query.em;
    if (req.query.role) query["employee.role"] = req.query.role;
    if (req.query.name) {
      query.$or = [
        { employee_firstname: { $regex: req.query.name } },
        { lastname: { $regex: req.query.name } },
        { phone_number: { $regex: req.query.name } },
      ];
    }

    // Populate
    let findQuery = Timestamp.find(query)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [
      rows,
      count,
      totalLabor,
      totalPriceExtra,
      allPrice,
    ] = await Promise.all([
      findQuery,
      Timestamp.countDocuments(query),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$priceLabor" } } },
      ]),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$salary_extra.day" } } },
      ]),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    // --- ดึง otRequest ที่มี id ของ timestamp ใน otRequest.timestamp ---
    const timestampIds = rows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      timestamp: { $in: timestampIds },
      status: "APPROVE",
    }).lean();

    // ผูก otRequests (array) กับแต่ละ row
    const rowsWithOt = rows.map((row) => {
      const relatedOt = otRequests.find(
        // const relatedOt = otRequests.filter(
        (o) => o.timestamp && o.timestamp.toString() === row._id.toString()
      );
      return {
        ...row,
        id: row._id,
        otRequests: relatedOt, // เป็น array เสมอ (อาจว่าง)
      };
    });

    return {
      total: count,
      lastPage: Math.ceil(count / limit),
      currPage: page,
      rows: rowsWithOt,
      totalLabor: totalLabor[0]?.total || 0,
      totalpriceExtra: totalPriceExtra[0]?.total || 0,
      allPrice: allPrice[0]?.total || 0,
    };
  },

  async findNotify(req) {
    const start = dayjs(req?.query?.dateStart).startOf("day").toDate();
    const end = dayjs(req?.query?.dateEnd).endOf("day").toDate();

    // ดึงข้อมูล check-in ของวันนั้น
    const rows = await Timestamp.find({
      checkIn: { $gte: start, $lte: end },
    })
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
      ])
      .lean();

    // --- ดึง otRequest ที่มี id ของ timestamp ใน otRequest.timestamp และผูกเข้าไปในแต่ละ row ---
    const timestampIds = rows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      timestamp: { $in: timestampIds },
      status: "APPROVE",
      date: { $gte: start, $lte: end },
    }).lean();

    const rowsWithOt = rows.map((row) => {
      const relatedOt = otRequests.filter(
        (o) => o.timestamp && o.timestamp.toString() === row._id.toString()
      );
      return {
        ...row,
        otRequests: relatedOt, // เป็น array (อาจว่าง)
      };
    });

    // สรุปข้อมูลเป็นแต่ละโครงการ (วันปัจจุบัน)
    const summary = {};

    rowsWithOt.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!summary[projectId]) {
        summary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          project_customer: item.project_in?.customer || "",
          project_location: item.project_in?.location || "",
          labor_cost: item.project_in?.labur_cost || 0,
          employees: [],
          total_cost_today: 0,
          total_cost_all: 0,
          total_ot_all: 0,
          total_ot_today: 0,
          total_spent: 0,
          total_spent_today: 0,
        };
      }

      const salary = item.employee?.salary?.day || 0;
      const rate = item.rate || 1;

      summary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
      });

      // คำนวณค่าแรงของวันนี้ (รวมตามรายการที่ลงเวลา)
      // แก้ไข: เปลี่ยนมาคำนวณจากชั่วโมงทำงานจริง
      if (item.checkIn) {
        const endTime = item.checkOut
          ? dayjs(item.checkOut)
          : dayjs(item.checkIn).hour(17).minute(0).second(0);
        const rawHours = endTime.diff(dayjs(item.checkIn), "hour", true);
        const timeEqual = rawHours > 8 ? 8 : rawHours;
        const totalTime = roundToHalf(timeEqual) * rate;
        summary[projectId].total_cost_today += salary * totalTime;
      }

      // คำนวณค่า OT ของวันนี้ (จาก otRequests ที่ผูกกับ timestamp วันนี้ และ status APPROVE, date ในช่วง)
      const otToday = item.otRequests.reduce(
        (sum, ot) => sum + (ot.total_price || 0),
        0
      );
      summary[projectId].total_ot_today += otToday;
      summary[projectId].total_spent_today =
        summary[projectId].total_cost_today + summary[projectId].total_ot_today;
    });

    // ดึงข้อมูล project IDs ที่มีการลงเวลาวันนี้
    const projectIds = Object.keys(summary).filter((id) => id !== "no_project");

    if (projectIds.length > 0) {
      // เตรียมรายการ timestamp id ของวันนี้ (ใช้ ObjectId array)
      const todayTimestampIds = rows.map((r) => r._id);

      // ดึงข้อมูลการลงเวลาทั้งหมดของโปรเจคเหล่านี้ (เพื่อคำนวณรวมทั้งโครงการ)
      const allTimestamps = await Timestamp.find({
        project_in: { $in: projectIds },
      })
        .populate("employee")
        .lean();

      // ดึงข้อมูล OT ทั้งหมดของโปรเจคเหล่านี้ (สถานะอนุมัติ) -- ทั้งโปรเจค (ไม่กรองวันที่)
      const allOtRequests = await OtRequest.find({
        project: { $in: projectIds },
        status: "APPROVE",
      }).lean();

      // ดึง OT เฉพาะที่ผูกกับ timestamp ของวันนี้ และวันที่อยู่ในช่วง start..end
      const otRequestsToday = await OtRequest.find({
        project: { $in: projectIds },
        status: "APPROVE",
        timestamp: { $in: todayTimestampIds },
        date: { $gte: start, $lte: end },
      }).lean();

      // คำนวณค่าใช้จ่ายรวมทั้งหมดของแต่ละโปรเจค
      projectIds.forEach((projectId) => {
        // คำนวณค่าแรงทั้งหมด (จาก timestamp ทั้งหมดของโปรเจค)
        const projectTimestamps = allTimestamps.filter(
          (t) => String(t.project_in) === String(projectId)
        );

        const totalSalary = projectTimestamps.reduce((sum, t) => {
          const salary = t.employee?.salary?.day || 0;

          if (!t.checkIn) return sum;
          const endTime = t.checkOut
            ? dayjs(t.checkOut)
            : dayjs(t.checkIn).hour(17).minute(0).second(0);
          const rawHours = endTime.diff(dayjs(t.checkIn), "hour", true);

          const timeEqual = rawHours > 8 ? 8 : rawHours;
          const totalTime = roundToHalf(timeEqual) * (t.rate || 1);
          return sum + totalTime * salary;
        }, 0);

        // คำนวณค่า OT ทั้งหมดของโปรเจค (รวมทุก OT ที่บันทึกกับโปรเจคนี้ และ APPROVE)
        const totalOt = allOtRequests
          .filter((ot) => ot.project?.toString() === projectId)
          .reduce((sum, ot) => sum + (ot.total_price || 0), 0);

        // คำนวณค่า OT เฉพาะของผู้ที่มีการลงชื่อวันนี้
        // (OT ที่ผูกกับ timestamp ของรายการเช็คอินวันนี้ และ date อยู่ในช่วง start..end)
        const totalOtToday = otRequestsToday
          .filter((ot) => ot.project?.toString() === projectId)
          .reduce((sum, ot) => sum + (ot.total_price || 0), 0);

        summary[projectId].total_cost_all = totalSalary;
        summary[projectId].total_ot_all = totalOt;
        summary[projectId].total_ot_today = totalOtToday;
        summary[projectId].total_spent = totalSalary + totalOt;
        summary[projectId].total_spent_today =
          summary[projectId].total_cost_today + totalOtToday;

        // คำนวณเปอร์เซ็นต์ที่ใช้ไป
        const laborCost = summary[projectId].labor_cost || 0;
        summary[projectId].percentage_used =
          laborCost > 0
            ? ((summary[projectId].total_spent / laborCost) * 100).toFixed(2)
            : 0;

        // คำนวณงบคงเหลือ
        summary[projectId].remaining_budget =
          laborCost - summary[projectId].total_spent;
      });
    }

    // --- START: เพิ่มการดึงข้อมูลและสรุปสำหรับวันก่อนหน้า ---
    const prevStart = dayjs(start).subtract(1, "day").startOf("day").toDate();
    const prevEnd = dayjs(start).subtract(1, "day").endOf("day").toDate();

    const prevRows = await Timestamp.find({
      checkIn: { $gte: prevStart, $lte: prevEnd },
    })
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
      ])
      .lean();

    const prevSummary = {};

    prevRows.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!prevSummary[projectId]) {
        prevSummary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          labor_cost: item.project_in?.labur_cost || 0,
          employees: [],
          total_cost_today: 0,
          total_ot_all: 0,
          total_spent: 0,
        };
      }

      const salary = item.employee?.salary?.day || 0;

      prevSummary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
      });

      prevSummary[projectId].total_cost_today += salary;
    });

    const prevProjectIds = Object.keys(prevSummary).filter(
      (id) => id !== "no_project"
    );

    if (prevProjectIds.length > 0) {
      // ดึง OT ของวันก่อนหน้า (approve) สำหรับโปรเจคที่เกี่ยวข้อง
      const prevOtRequests = await OtRequest.find({
        project: { $in: prevProjectIds },
        status: "APPROVE",
        date: { $gte: prevStart, $lte: prevEnd },
      }).lean();

      prevProjectIds.forEach((projectId) => {
        const totalOt = prevOtRequests
          .filter((ot) => ot.project?.toString() === projectId)
          .reduce((sum, ot) => sum + (ot.total_price || 0), 0);

        prevSummary[projectId].total_ot_all = totalOt;
        prevSummary[projectId].total_spent =
          prevSummary[projectId].total_cost_today + totalOt;
      });
    }

    // รวมตัวเลขรวมแบบ top-level (optionally)
    const currentTotals = {
      totalPeople: Object.values(summary).reduce(
        (sum, p) => sum + (p.employees?.length || 0),
        0
      ),
      totalLabor: Object.values(summary).reduce(
        (sum, p) => sum + (p.total_cost_today || 0),
        0
      ),
      totalOt: Object.values(summary).reduce(
        (sum, p) => sum + (p.total_ot_today || 0),
        0
      ),
      totalSpent: Object.values(summary).reduce(
        (sum, p) => sum + (p.total_spent_today || 0),
        0
      ),
    };

    const prevTotals = {
      totalPeople: Object.values(prevSummary).reduce(
        (sum, p) => sum + (p.employees?.length || 0),
        0
      ),
      totalLabor: Object.values(prevSummary).reduce(
        (sum, p) => sum + (p.total_cost_today || 0),
        0
      ),
      totalOt: Object.values(prevSummary).reduce(
        (sum, p) => sum + (p.total_ot_all || 0),
        0
      ),
      totalSpent: Object.values(prevSummary).reduce(
        (sum, p) => sum + (p.total_spent || 0),
        0
      ),
    };
    // --- END: เพิ่มการดึงข้อมูลและสรุปสำหรับวันก่อนหน้า ---

    // --- START: คำนวณงวดการจ่าย (period) ---
    const targetDay = req?.query?.dateStart
      ? dayjs(req.query.dateStart)
      : dayjs(start);
    const dayOfMonth = targetDay.date();

    let periodStart, periodEnd, periodLabel, periodNumber;
    if (dayOfMonth <= 15) {
      periodStart = targetDay.startOf("month").toDate();
      periodEnd = targetDay.date(15).endOf("day").toDate();
      periodNumber = 1;
      periodLabel = `งวด 1 (${dayjs(periodStart).format("D")}-${dayjs(
        periodEnd
      ).format("D")}/${dayjs(periodStart).format("MM/YYYY")})`;
    } else {
      periodStart = targetDay.date(16).startOf("day").toDate();
      periodEnd = targetDay.endOf("month").endOf("day").toDate();
      periodNumber = 2;
      periodLabel = `งวด 2 (${dayjs(periodStart).format("D")}-${dayjs(
        periodEnd
      ).format("D")}/${dayjs(periodStart).format("MM/YYYY")})`;
    }

    // --- คำนวณยอดรวมของงวดใหม่ทั้งหมด ---
    const periodTimestamps = await Timestamp.find({
      checkIn: { $gte: periodStart, $lte: periodEnd },
    })
      .populate("employee")
      .lean();

    const periodOtRequests = await OtRequest.find({
      status: "APPROVE",
      date: { $gte: periodStart, $lte: periodEnd },
    }).lean();

    const totalPeriodCostAllProjects = periodTimestamps.reduce((sum, t) => {
      const salary = t.employee?.salary?.day || 0;
      const rate = t.rate || 1;
      if (!t.checkIn) return sum;
      const endTime = t.checkOut
        ? dayjs(t.checkOut)
        : dayjs(t.checkIn).hour(17).minute(0).second(0);
      const rawHours = endTime.diff(dayjs(t.checkIn), "hour", true);
      const timeEqual = rawHours > 8 ? 8 : rawHours;
      const totalTime = roundToHalf(timeEqual) * rate;
      return sum + salary * totalTime;
    }, 0);

    const totalPeriodOtAllProjects = periodOtRequests.reduce(
      (sum, ot) => sum + (ot.total_price || 0),
      0
    );
    // --- END: คำนวณยอดรวมของงวดใหม่ทั้งหมด ---

    return {
      rows: Object.values(summary),
      previous: {
        rows: Object.values(prevSummary),
        totals: prevTotals,
      },
      totals: currentTotals,
      payPeriod: {
        number: periodNumber,
        start: periodStart,
        end: periodEnd,
        label: periodLabel,
        total_cost: totalPeriodCostAllProjects,
        total_ot: totalPeriodOtAllProjects,
        total_spent: totalPeriodCostAllProjects + totalPeriodOtAllProjects,
      },
    };
  },

  async checkInDaily(req) {
    const start = dayjs(req?.query?.dateStart).startOf("day").toDate();
    const end = dayjs(req?.query?.dateEnd).endOf("day").toDate();

    // ดึงข้อมูล check-in ของวันนั้น
    const rows = await Timestamp.find({
      checkIn: { $gte: start, $lte: end },
    })
      .populate([
        {
          path: "employee",
          match: req.query.typeSelect ? { type: req.query.typeSelect } : {},
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .lean();

    // กรองเฉพาะ row ที่ employee ไม่เป็น null (ตรง type)
    const filteredRows = rows.filter((item) => item.employee);

    // ดึง otRequest ที่เกี่ยวข้องกับเช็คอินเหล่านี้
    const timestampIds = filteredRows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      timestamp: { $in: timestampIds },
      status: "APPROVE",
    }).lean();

    // รวม otRequest เข้าไปในแต่ละ timestamp row
    const rowsWithOt = filteredRows.map((row) => {
      const relatedOt = otRequests.filter(
        (o) => o.timestamp && o.timestamp.toString() === row._id.toString()
      );
      return {
        ...row,
        otRequests: relatedOt,
      };
    });

    // สรุปข้อมูลเป็นแต่ละโครงการ
    const summary = {};
    rowsWithOt.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!summary[projectId]) {
        summary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          project_customer: item.project_in?.customer || "",
          project_location: item.project_in?.location || "",
          employees: [],
        };
      }

      // คำนวณยอด OT ของพนักงานคนนี้
      let totalOtAmount = 0;
      let totalOtHour = 0;
      if (item.otRequests && item.otRequests.length > 0) {
        item.otRequests.forEach((ot) => {
          totalOtAmount += ot.total_price || 0;
          totalOtHour += ot.total_hours || 0;
        });
      }
      summary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        timestamp_id: item._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        checkOut: item.checkOut,
        checkOutTime: item.checkOut ? dayjs(item.checkOut).format("HH:mm") : "",
        rate: item.rate || 1,
        salary_per_day: item.employee?.salary?.day || 0,
        allowance: item?.salary_extra?.day || 0,
        allowance_month: item?.salary_extra?.month || 0,
        otRequests: item.otRequests || [],
        totalOtAmount: totalOtAmount,
        totalOtHour: totalOtHour,
        out_of_location: item.out_of_location || false,
        status_payroll: item.status_payroll || false,
        note: item.note || "",
        image: item.image || null,
        image_out: item.image_out || null,
        total:
          (item.employee?.salary?.day * item.rate || 0) +
          (item?.salary_extra?.day || 0) +
          totalOtAmount,
      });
    });
    return { rows: Object.values(summary) };
  },

  async checkIPayroll(req) {
    const start = new Date(req?.query?.dateStart);
    const end = new Date(req?.query?.dateEnd);

    // ดึงข้อมูลเช็คอินในช่วงวันที่ที่เลือก และ populate employee เฉพาะ type ที่เลือก
    const rows = await Timestamp.find({
      checkIn: { $lte: end, $gte: start },
      status_payroll: false,
    })
      .populate([
        {
          path: "employee",
          match: { type: req.query.typeSelect },
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
      ])
      .lean();

    // ดึง otRequest ที่เกี่ยวข้องกับเช็คอินเหล่านี้
    const timestampIds = rows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      timestamp: { $in: timestampIds },
      status: "APPROVE",
    }).lean();

    // รวม otRequest เข้าไปในแต่ละ timestamp row
    const rowsWithOt = rows.map((row) => {
      const relatedOt = otRequests.filter(
        (o) => o.timestamp && o.timestamp.toString() === row._id.toString()
      );
      return {
        ...row,
        otRequests: relatedOt,
      };
    });

    // กรองเฉพาะ row ที่ employee ไม่เป็น null (ตรง type)
    const filteredRows = rowsWithOt.filter((item) => item.employee);

    // --- เพิ่มการ sort ตาม employee.employee_id ---
    filteredRows.sort((a, b) => {
      const idA = a.employee?.employee_id || "";
      const idB = b.employee?.employee_id || "";
      return idA.localeCompare(idB, undefined, { numeric: true });
    });

    // ดึงข้อมูล SsoTransection ของเดือนนี้ (ตาม startDate)
    const startMonth = dayjs(start).startOf("month").toDate();
    const endMonth = dayjs(start).endOf("month").toDate();

    const employeeIds = filteredRows
      .map((r) => r.employee?._id)
      .filter((id) => id);

    const ssoTransactions = await SsoTransection.find({
      employee: { $in: employeeIds },
      month_period: {
        $gte: startMonth,
        $lte: endMonth,
      },
    }).lean();

    const ssoMap = {};
    ssoTransactions.forEach((tx) => {
      const eId = tx.employee.toString();
      if (!ssoMap[eId]) ssoMap[eId] = 0;
      ssoMap[eId] += tx.price || 0;
    });

    // Company payroll settings (SSO + เวลาเข้างานสำหรับหักเงินมาสาย)
    let companySsoRatePercent = 5;
    let companySsoMaxAmount = 875;
    let workStartTime = "08:00";
    try {
      const info = await informationService.find();
      companySsoRatePercent =
        info?.setting?.payroll?.sso?.rate_percent ?? companySsoRatePercent;
      companySsoMaxAmount =
        info?.setting?.payroll?.sso?.max_amount ?? companySsoMaxAmount;
      workStartTime = info?.setting?.payroll?.work_start_time ?? workStartTime;
    } catch (e) {
      // fallback to defaults
    }

    // สรุปข้อมูลตามพนักงาน
    const summary = {};
    filteredRows.forEach((item) => {
      const empId = item.employee?._id?.toString() || "no_employee";
      if (!summary[empId]) {
        summary[empId] = {
          employee_id: item.employee?._id || null,
          name:
            (item.employee?.firstname || "") +
            " " +
            (item.employee?.lastname || ""),
          role: item.employee?.role?.name || "",
          department: item.employee?.department?.name || "",
          salary_per_day: item.employee?.salary?.day || 0,
          salary_per_month: item.employee?.salary?.month || 0,
          sso_tax: item.employee?.sso_tax || 0,
          sso_paid: ssoMap[empId] || 0,
          tax_type: item.employee?.tax || "",
          revenue: {
            salary: item.employee?.salary?.month || 0,
            overtime: 0,
            allowances: 0,
            bonus: 0,
            other: 0,
          },
          expenses: {
            tax: 0,
            sso: 0,
            late: 0,
            timestamp: 0,
            other: 0,
          },
          late_minutes: 0,
          checkins: [],
          totalCheck: 0,
          totalAmount: 0,
          otRequests: [],
          totalOtAmount: 0,
          totalWork: 0,
          totalHour: 0,
          totalOtHour: 0,
          total_extra_day: 0,
          total_extra_month: 0,
        };
      }
      const minutesLateThisCheckin = getMinutesLate(
        item.checkIn,
        workStartTime
      );
      summary[empId].late_minutes =
        (summary[empId].late_minutes || 0) + minutesLateThisCheckin;

      summary[empId].checkins.push({
        _id: item._id,
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        checkOut: item.checkOut,
        checkOutTime: item.checkOut ? dayjs(item.checkOut).format("HH:mm") : "",
        totalTime: caltotalTime(item.checkIn, item.checkOut) * (item.rate || 1),
        totalHour: caltotalTimeBefore(item.checkIn, item.checkOut),
        minutes_late: minutesLateThisCheckin,
        project_id: item.project_in?._id || null,
        project_number: item.project_in?.project_number || "",
        project_name: item.project_in?.name || "",
        salary_per_day: item.employee?.salary?.day || 0,
        salary_per_month: item.employee?.salary?.month || 0,
        extra_day: item?.salary_extra?.day || 0,
        extra_month: item?.salary_extra?.month || 0,
        otRequests: item.otRequests[0] || [],
      });
      summary[empId].totalCheck += 1;

      // แก้ไข: ถ้าไม่มี checkOut ให้ใช้ 17:00 ของวันนั้น
      const endTimeForCalc = item.checkOut
        ? dayjs(item.checkOut)
        : dayjs(item.checkIn).hour(17).minute(0).second(0);
      const rawHours = endTimeForCalc.diff(dayjs(item.checkIn), "hour", true);

      const timeEqual = rawHours > 8 ? 8 : rawHours;
      const totalTime = roundToHalf(timeEqual) * (item.rate || 1);
      const workDays = item.rate || 1; // 1 เช็คอิน = 1 วันทำงาน (คูณ rate กรณีเป็นวันหยุด)
      const timeBefore = caltotalTimeBefore(item.checkIn, endTimeForCalc);

      summary[empId].totalWork = (summary[empId].totalWork || 0) + workDays;
      summary[empId].totalHour = (summary[empId].totalHour || 0) + timeBefore;
      summary[empId].totalAmount =
        (summary[empId].totalWork || 0) * (item.employee?.salary?.day || 0);

      if (item.otRequests && item.otRequests.length > 0) {
        item.otRequests.forEach((ot) => {
          summary[empId].otRequests.push(ot);
          summary[empId].totalOtAmount += ot.total_price || 0;
          summary[empId].totalOtHour += ot.total_hours || 0;
        });
      }
      summary[empId].total_extra_day += item?.salary_extra?.day || 0;
      // เพิ่มยอดเบี้ยเลี้ยงรายเดือนด้วย
      summary[empId].total_extra_month = (summary[empId].total_extra_month || 0) + (item?.salary_extra?.month || 0);
    });

    // Compute default SSO + หักเงินมาสาย ต่อพนักงาน (ใช้ใน HrAddSalary)
    const typeSelect = req?.query?.typeSelect || "";
    Object.values(summary).forEach((row) => {
      const enabled = !!row?.sso_tax?.status;
      row.expenses = row.expenses || {};
      row.revenue = row.revenue || {};

      // ใส่ข้อมูล OT เข้าไปใน revenue เพื่อให้ frontend ดึงไปแสดงในช่องโอที
      row.revenue.overtime = row.totalOtAmount || 0;
      
      // นำเบี้ยเลี้ยงไปใส่ใน revenue.allowances (รวมทั้งรายวันและรายเดือน)
      const extraDay = row.total_extra_day || 0;
      const extraMonth = row.total_extra_month || 0;
      row.revenue.allowances = extraDay + extraMonth;

      // พนักงานรายวัน: รวมค่าแรง = ค่าแรงต่อวัน × จำนวนวันที่มาทำงาน
      if (typeSelect !== "FULLTIME") {
        const daysWorked = clampNumber(row.totalWork, 0); // ใช้ totalWork (ที่แปลงเป็นวันแล้ว)
        const dayRate = clampNumber(row.salary_per_day, 0);
        row.revenue.salary = Number((daysWorked * dayRate).toFixed(2));
      }

      // คำนวณ SSO: ใช้เงินเดือนรายเดือนสำหรับ FULLTIME และใช้รวมค่าแรง (ค่าแรง*วัน) สำหรับรายวัน
      const baseSsoSalary =
        typeSelect !== "FULLTIME" ? row.revenue.salary : row.salary_per_month;

      row.expenses.sso = calcSsoDeduction({
        baseSalary: baseSsoSalary,
        ratePercent: companySsoRatePercent,
        maxAmount: companySsoMaxAmount,
        alreadyPaid: row.sso_paid,
        enabled,
      });
      row.expenses.late = calcLateDeduction(
        row.salary_per_month,
        row.late_minutes || 0
      );
    });

    // --- สรุปข้อมูลตามโปรเจค (แบบ findDashboard ที่ถูกต้อง) ---
    const projectSummary = {};
    filteredRows.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!projectSummary[projectId]) {
        projectSummary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          labor_cost: item.project_in?.labur_cost || 0,
          deliver_status: item.project_in?.deliver_status || {},
          employees: [],
          total_salary: 0,
          total_ot: 0,
          total_allowance: 0, // เพิ่มฟิลด์นี้
        };
      }
      // คำนวณค่าแรงจากเวลาทำงานจริง และคูณด้วย rate (ถ้ามี)
      const salary = item.employee?.salary?.day || 0;
      const allowance = (item?.salary_extra?.day || 0) + (item?.salary_extra?.month || 0);

      // ถ้าไม่มี checkOut ให้ใช้ 17:00 ของวันนั้น
      const endTimeForCalc = item.checkOut
        ? dayjs(item.checkOut)
        : dayjs(item.checkIn).hour(17).minute(0).second(0);
      const rawHours =
        item.checkIn > 0
          ? endTimeForCalc.diff(dayjs(item.checkIn), "hour", true)
          : 0;

      const timeEqual = rawHours > 8 ? 8 : rawHours;
      let totalTime = roundToHalf(timeEqual) * (item.rate || 1);

      if (item.employee?.type === "FULLTIME" && item.rate == 2) {
        totalTime += 1;
      }

      const typeSelect = req?.query?.typeSelect || "";
      let amount = 0;
      if (typeSelect !== "FULLTIME") {
        // พนักงานรายวัน: 1 เช็คอิน = 1 วัน (ตรงกับ totalCheck * dayRate)
        amount = salary;
      } else {
        amount = totalTime * salary;
      }

      projectSummary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
        amount: amount,
        rate: item.rate || 1,
        allowance: allowance,
      });
      projectSummary[projectId].total_salary += amount;
      projectSummary[projectId].total_allowance += allowance; // รวมเบี้ยเลี้ยง

      // ใช้ OT จาก item.otRequests โดยตรง
      if (item.otRequests && item.otRequests.length > 0) {
        const otTotal = item.otRequests.reduce(
          (sum, ot) => sum + (ot.total_price || 0),
          0
        );
        projectSummary[projectId].total_ot += otTotal;
      }
    });

    // --- ลบส่วนที่ query OtRequest แยกต่างหากออก ---

    // คำนวณยอดรวม (Salary + OT)
    Object.values(projectSummary).forEach((p) => {
      p.total_spent = p.total_salary + p.total_ot;
    });

    // sort project summary ตาม project_id
    const sortedProjectSummary = Object.values(projectSummary).sort((a, b) => {
      if (!a.project_id || !b.project_id) return 0;
      return b.project_id.toString().localeCompare(a.project_id.toString());
    });

    return {
      rows: Object.values(summary),
      dashboard: sortedProjectSummary,
      company_setting: {
        payroll: {
          sso: {
            rate_percent: clampNumber(companySsoRatePercent, 5),
            max_amount: clampNumber(companySsoMaxAmount, 875),
          },
          work_start_time: workStartTime || "08:00",
        },
      },
    };
  },

  ///////////////////////////////////////////////
  async checkInPayrollwithDashboard(req) {
    const start = new Date(req?.query?.dateStart);
    const end = new Date(req?.query?.dateEnd);

    // ดึงข้อมูลเช็คอินในช่วงวันที่ที่เลือก และ populate employee เฉพาะ type ที่เลือก
    const rows = await Timestamp.find({
      checkIn: { $lte: end, $gte: start },
    })
      .populate([
        {
          path: "employee",
          match: req.query.typeSelect ? { type: req.query.typeSelect } : {},
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
      ])
      .lean();

    // ดึง otRequest ที่เกี่ยวข้องกับเช็คอินเหล่านี้
    const timestampIds = rows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      timestamp: { $in: timestampIds },
      status: "APPROVE",
    }).lean();

    // รวม otRequest เข้าไปในแต่ละ timestamp row
    const rowsWithOt = rows.map((row) => {
      const relatedOt = otRequests.filter(
        (o) => o.timestamp && o.timestamp.toString() === row._id.toString()
      );
      return {
        ...row,
        otRequests: relatedOt,
      };
    });

    // กรองเฉพาะ row ที่ employee ไม่เป็น null (ตรง type)
    const filteredRows = rowsWithOt.filter((item) => item.employee);

    // --- เพิ่มการ sort ตาม employee.employee_id ---
    filteredRows.sort((a, b) => {
      const idA = a.employee?.employee_id || "";
      const idB = b.employee?.employee_id || "";
      return idA.localeCompare(idB, undefined, { numeric: true });
    });

    // สรุปข้อมูลตามพนักงาน
    const summary = {};
    filteredRows.forEach((item) => {
      const empId = item.employee?._id?.toString() || "no_employee";
      if (!summary[empId]) {
        summary[empId] = {
          employee_id: item.employee?._id || null,
          name:
            (item.employee?.firstname || "") +
            " " +
            (item.employee?.lastname || ""),
          role: item.employee?.role?.name || "",
          department: item.employee?.department?.name || "",
          salary_per_day: item.employee?.salary?.day || 0,
          salary_per_month: item.employee?.salary?.month || 0,
          sso_tax: item.employee?.sso_tax || 0,
          tax_type: item.employee?.tax || "",

          checkins: [],
          totalCheck: 0,
          totalAmount: 0,
          otRequests: [],
          totalOtAmount: 0,
          totalWork: 0,
          totalHour: 0,
          totalOtHour: 0,
          total_extra_day: 0,
          total_extra_month: 0,
        };
      }
      summary[empId].checkins.push({
        _id: item._id,
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        checkOut: item.checkOut,
        checkOutTime: item.checkOut ? dayjs(item.checkOut).format("HH:mm") : "",
        totalTime: caltotalTime(item.checkIn, item.checkOut) * (item.rate || 1),
        totalHour: caltotalTimeBefore(item.checkIn, item.checkOut),
        project_id: item.project_in?._id || null,
        project_number: item.project_in?.project_number || "",
        project_name: item.project_in?.name || "",
        rate: item.rate || 1,
        salary_per_day: item.employee?.salary?.day || 0,
        salary_per_month: item.employee?.salary?.month || 0,
        extra_day: item?.salary_extra?.day || 0,
        extra_month: item?.salary_extra?.month || 0,
        otRequests: item.otRequests[0] || [],
      });
      summary[empId].totalCheck += 1;

      // แก้ไข: ถ้าไม่มี checkOut ให้ใช้ 17:00 ของวันนั้น
      const endTimeForCalc = item.checkOut
        ? dayjs(item.checkOut)
        : dayjs(item.checkIn).hour(17).minute(0).second(0);
      const rawHours = endTimeForCalc.diff(dayjs(item.checkIn), "hour", true);

      const timeEqual = rawHours > 8 ? 8 : rawHours;
      const totalTime = roundToHalf(timeEqual) * (item.rate || 1);
      const workDays = item.rate || 1; // 1 เช็คอิน = 1 วันทำงาน (คูณ rate กรณีเป็นวันหยุด)
      const timeBefore = caltotalTimeBefore(item.checkIn, endTimeForCalc);

      summary[empId].totalWork = (summary[empId].totalWork || 0) + workDays;
      summary[empId].totalHour = (summary[empId].totalHour || 0) + timeBefore;
      summary[empId].totalAmount =
        (summary[empId].totalWork || 0) * (item.employee?.salary?.day || 0);

      if (item.otRequests && item.otRequests.length > 0) {
        item.otRequests.forEach((ot) => {
          summary[empId].otRequests.push(ot);
          summary[empId].totalOtAmount += ot.total_price || 0;
          summary[empId].totalOtHour += ot.total_hours || 0;
        });
      }
      summary[empId].total_extra_day += item?.salary_extra?.day || 0;
      summary[empId].total_extra_month += item?.salary_extra?.month || 0;
    });

    // --- สรุปข้อมูลตามโปรเจค (แบบ findDashboard ที่ถูกต้อง) ---
    const projectSummary = {};
    filteredRows.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!projectSummary[projectId]) {
        projectSummary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          labor_cost: item.project_in?.labur_cost || 0,
          deliver_status: item.project_in?.deliver_status || {},
          employees: [],
          total_salary: 0,
          total_ot: 0,
          total_allowance: 0, // เพิ่มฟิลด์นี้
        };
      }
      // คำนวณค่าแรงจากเวลาทำงานจริง และคูณด้วย rate (ถ้ามี)
      const salary = item.employee?.salary?.day || 0;
      const allowance = (item?.salary_extra?.day || 0) + (item?.salary_extra?.month || 0);

      // ถ้าไม่มี checkOut ให้ใช้ 17:00 ของวันนั้น
      const endTimeForCalc = item.checkOut
        ? dayjs(item.checkOut)
        : dayjs(item.checkIn).hour(17).minute(0).second(0);
      const rawHours =
        item.checkIn > 0
          ? endTimeForCalc.diff(dayjs(item.checkIn), "hour", true)
          : 0;

      const timeEqual = rawHours > 8 ? 8 : rawHours;
      const totalTime = roundToHalf(timeEqual) * (item.rate || 1);
      const amount = totalTime * salary;

      projectSummary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
        amount: amount,
        rate: item.rate || 1,
        allowance: allowance,
      });
      projectSummary[projectId].total_salary += amount;
      projectSummary[projectId].total_allowance += allowance; // รวมเบี้ยเลี้ยง

      // ใช้ OT จาก item.otRequests โดยตรง
      if (item.otRequests && item.otRequests.length > 0) {
        const otTotal = item.otRequests.reduce(
          (sum, ot) => sum + (ot.total_price || 0),
          0
        );
        projectSummary[projectId].total_ot += otTotal;
      }
    });

    // --- ลบส่วนที่ query OtRequest แยกต่างหากออก ---

    // คำนวณยอดรวม (Salary + OT)
    Object.values(projectSummary).forEach((p) => {
      p.total_spent = p.total_salary + p.total_ot;
    });

    // sort project summary ตาม project_id
    const sortedProjectSummary = Object.values(projectSummary).sort((a, b) => {
      if (!a.project_id || !b.project_id) return 0;
      return b.project_id.toString().localeCompare(a.project_id.toString());
    });

    return { rows: Object.values(summary), dashboard: sortedProjectSummary };
  },

  async findCheckin(req) {
    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req.query.ot === "true") query["ot_status.require"] = true;
    if (req.query.type) query.employeeType = req.query.type;
    if (req.query.profile) query.employee = req.query.profile;
    if (req.query.me) {
      query.employee = req.query.me;
      query.status_checkOut = false;
    }
    if (req.query.project_id) query.project_in = req.query.project_id;
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    if (req.query.checkoutem) {
      query.$or = [
        { employeekey: req.query.checkoutem },
        { employee_firstname: req.query.checkoutem },
        { employee_id: req.query.checkoutem },
      ];
      query.status_checkOut = false;
    }
    if (req.query.em) query.employee = req.query.em;
    if (req.query.role) query["employee.role"] = req.query.role;
    if (req.query.name) {
      query.$or = [
        { firstname: { $regex: req.query.name } },
        { lastname: { $regex: req.query.name } },
        { phone_number: { $regex: req.query.name } },
      ];
    }

    const row = await Timestamp.findOne(query)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    if (!row) {
      // ถ้าไม่เจอข้อมูล ให้ return null หรือ {} หรือ throw ErrorNotFound ก็ได้
      return null;
    }

    const otRequests = await OtRequest.find({
      timestamp: row._id,
    }).lean();

    return { ...row, id: row._id, otRequest: otRequests[0] || null };
  },

  ///แสดงข้อมูลสรุปค่าแรงตามโปรเจค
  async findDashboard(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    const query = {};
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    // เพิ่ม filter ตาม project ถ้ามีใน query
    if (req.query.project) {
      query.project_in = req.query.project;
    }

    // ดึงข้อมูลเช็คอินและ populate ข้อมูลโปรเจคและพนักงาน
    const rows = await Timestamp.find(query)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
      ])
      .lean();

    // สรุปข้อมูลเป็นแต่ละโปรเจคและ sum ค่าแรง
    const summary = {};
    rows.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!summary[projectId]) {
        summary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          labor_cost: item.project_in?.labur_cost || 0,
          deliver_status: item.project_in?.deliver_status || {},
          employees: [],
          total_salary: 0,
          total_ot: 0,
        };
      }
      const salary = item.employee?.salary?.day || 0;
      summary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        timestamp_id: item._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
      });

      // คำนวณค่าแรงของวันนี้ (รวมตามรายการที่ลงเวลา)
      // แก้ไข: นำ rate มาคำนวณด้วย
      summary[projectId].total_cost_today += salary * rate;

      // คำนวณค่า OT ของวันนี้ (จาก otRequests ที่ผูกกับ timestamp วันนี้ และ status APPROVE, date ในช่วง)
      const otToday = item.otRequests.reduce(
        (sum, ot) => sum + (ot.total_price || 0),
        0
      );
      summary[projectId].total_ot_today += otToday;
      summary[projectId].total_spent_today =
        summary[projectId].total_cost_today + summary[projectId].total_ot_today;
    });

    // --- ดึง otRequest ที่เกี่ยวข้องกับโปรเจคและช่วงวันที่ ---
    const projectIds = Object.keys(summary).filter((id) => id !== "no_project");
    const otQuery = {
      project: { $in: projectIds },
    };
    if (req.query.dateStart && req.query.dateEnd) {
      otQuery.date = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    const otRequests = await OtRequest.find(otQuery).lean();

    // รวม total_price ของ otRequest ต่อโปรเจค
    otRequests.forEach((ot) => {
      const pid = ot.project?.toString?.() || ot.project;
      if (summary[pid]) {
        summary[pid].total_ot += ot.total_price || 0;
      }
    });

    // หลังจากสรุปข้อมูล summary เสร็จแล้ว ให้ sort ตาม project_id (มากไปน้อย)
    const sortedRows = Object.values(summary).sort((a, b) => {
      if (!a.project_id || !b.project_id) return 0;
      // ถ้าเป็น ObjectId ให้แปลงเป็น string แล้ว sort
      return b.project_id.toString().localeCompare(a.project_id.toString());
    });

    // --- สรุปข้อมูลตามโปรเจค (แบบ findDashboard ที่ถูกต้อง) ---
    const projectSummary = {};
    filteredRows.forEach((item) => {
      const projectId = item.project_in?._id?.toString() || "no_project";
      if (!projectSummary[projectId]) {
        projectSummary[projectId] = {
          project_id: item.project_in?._id || null,
          project_number: item.project_in?.project_number || "",
          project_name: item.project_in?.name || "",
          labor_cost: item.project_in?.labur_cost || 0,
          deliver_status: item.project_in?.deliver_status || {},
          employees: [],
          total_salary: 0,
          total_ot: 0,
          total_allowance: 0, // เพิ่มฟิลด์นี้
        };
      }
      // คำนวณค่าแรงจากเวลาทำงานจริง และคูณด้วย rate (ถ้ามี)
      const salary = item.employee?.salary?.day || 0;
      const allowance = (item?.salary_extra?.day || 0) + (item?.salary_extra?.month || 0);

      // แก้ไข: ถ้าไม่มี checkOut ให้ใช้ 17:00 ของวันนั้น
      const endTimeForCalc = item.checkOut
        ? dayjs(item.checkOut)
        : dayjs(item.checkIn).hour(17).minute(0).second(0);
      const rawHours =
        item.checkIn > 0
          ? endTimeForCalc.diff(dayjs(item.checkIn), "hour", true)
          : 0;

      const timeEqual = rawHours > 8 ? 8 : rawHours;
      // roundToHalf คืนค่าเป็นสัดส่วนของวัน (เช่น 0.5 = ครึ่งวัน)
      const totalTime = roundToHalf(timeEqual) * (item.rate || 1);
      const amount = totalTime * salary;

      projectSummary[projectId].employees.push({
        employee_id: item.employee?._id || null,
        name:
          (item.employee?.firstname || "") +
          " " +
          (item.employee?.lastname || ""),
        role: item.employee?.role?.name || "",
        checkIn: item.checkIn,
        checkInTime: item.checkIn ? dayjs(item.checkIn).format("HH:mm") : "",
        salary_per_day: salary,
        amount: amount,
        rate: item.rate || 1,
        allowance: allowance,
      });
      projectSummary[projectId].total_salary += amount;
      projectSummary[projectId].total_allowance += allowance; // รวมเบี้ยเลี้ยง

      // ใช้ OT จาก item.otRequests โดยตรง
      if (item.otRequests && item.otRequests.length > 0) {
        const otTotal = item.otRequests.reduce(
          (sum, ot) => sum + (ot.total_price || 0),
          0
        );
        projectSummary[projectId].total_ot += otTotal;
      }
    });

    // --- ลบส่วนที่ query OtRequest แยกต่างหากออก ---

    // คำนวณยอดรวม (Salary + OT)
    Object.values(projectSummary).forEach((p) => {
      p.total_spent = p.total_salary + p.total_ot;
    });

    // sort project summary ตาม project_id
    const sortedProjectSummary = Object.values(projectSummary).sort((a, b) => {
      if (!a.project_id || !b.project_id) return 0;
      return b.project_id.toString().localeCompare(a.project_id.toString());
    });

    return { rows: Object.values(summary), dashboard: sortedProjectSummary };
  },

  async findById(query) {
    const id = query?.params?.id;
    const row = await Timestamp.findById(id)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .lean();
    if (!row) throw ErrorNotFound("not found");
    return row;
  },

 

  insert(req) {
    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const data = req?.body || {};

          const today = new Date();
          const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0
          );
          const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59
          );

          const todayCheckIn = await Timestamp.findOne({
            employee: data.employee,
            status_checkOut: false,
            checkIn: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          }).session(session);

          if (todayCheckIn) {
            await session.abortTransaction();
            return resolve({ message: "Already checked in today" });
          }

          const checkInSource = resolveTimestampCheckInSource(data);
          delete data.check_in_source;

          // ไม่อนุญาตให้ลงเวลา ถ้าโครงการปิดช่องทางที่ใช้ (profile vs ลิงก์)
          const projectId =
            data.project_in?._id || data.project_in?.id || data.project_in;
          if (projectId) {
            const projectDoc = await Project.findById(projectId)
              .session(session)
              .lean();
            if (!projectDoc) {
              await session.abortTransaction();
              return reject(
                ErrorBadRequest("ไม่พบโครงการ ไม่สามารถลงเวลาได้")
              );
            }
            if (checkInSource === "manpower_link") {
              if (!isProjectLinkTrackingEnabled(projectDoc)) {
                await session.abortTransaction();
                return reject(
                  ErrorBadRequest(
                    "โครงการนี้ปิดการลงเวลาผ่านลิงก์ ไม่สามารถลงเวลาได้"
                  )
                );
              }
            } else if (projectDoc.time_tracking_enabled !== true) {
              await session.abortTransaction();
              return reject(
                ErrorBadRequest(
                  "โครงการนี้ปิดการลงเวลาผ่านหน้าโปรไฟล์ ไม่สามารถลงเวลาได้"
                )
              );
            }
          }

          if (data.image) {
            try {
              const uploadedImage = await UploadService.uploadBase64(data);
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.image = databasedImage.id;
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }
          const payload = { ...data, checkIn: new Date() };
          const obj = new Timestamp(payload);
          const inserted = await obj.save();
          await session.commitTransaction();

          if (inserted?._id) {
            ActivityLogService.recordAsync({
              req,
              module: "HR",
              resourceType: "timestamp",
              action: "CREATE",
              resourceId: inserted._id,
              summary:
                `ลงเวลาเข้า: ${data?.employee_firstname || ""} ${data?.employee_lastname || ""}`.trim() ||
                "สร้างรายการลงเวลา",
              after: inserted.toObject ? inserted.toObject() : inserted,
            });
          }

          // Discord notification (non-blocking)
          DiscordService.sendTimestampNotify({
            employee_firstname: data.employee_firstname,
            employee_lastname: data.employee_lastname,
            employeekey: data.employeekey,
            checkIn: inserted.checkIn,
            project_in: data.project_in,
            locationCheckIn: data.locationCheckIn,
          }).catch((err) =>
            console.error("Discord notify error:", err.message)
          );

          resolve(inserted);
        } catch (error) {
          await session.abortTransaction();
          if (error?.status) return reject(error);
          reject(ErrorBadRequest(error.message));
        } finally {
          session.endSession();
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then((result) => {
          const io = getIO();
          if (io && result?._id)
            io.emit("timestamp:created", { id: result._id });
          return result;
        })
    );
  },

  insertwithHr(data, req = null) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const todayCheckIn = await Timestamp.findOne({
          employee: data.employee,

          checkIn: {
            $gte: dayjs(data.checkIn).startOf("day").toDate(),
            $lte: dayjs(data.checkIn).endOf("day").toDate(),
          },
        }).session(session);

        if (todayCheckIn) {
          await session.abortTransaction();
          return resolve({ message: "Already checked in today" });
        }
        const obj = new Timestamp(data);
        const inserted = await obj.save();
        await session.commitTransaction();
        if (inserted?._id) {
          ActivityLogService.recordAsync({
            req,
            module: "HR",
            resourceType: "timestamp",
            action: "CREATE",
            resourceId: inserted._id,
            summary:
              `HR สร้าง/แก้ไขรายการลงเวลา: ${data?.employee_firstname || ""} ${data?.employee_lastname || ""}`.trim() ||
              "HR บันทึกรายการลงเวลา",
            after: inserted.toObject ? inserted.toObject() : inserted,
          });
        }
        resolve(inserted);
      } catch (error) {
        await session.abortTransaction();
        reject(ErrorBadRequest(error.message));
      } finally {
        session.endSession();
      }
    });
  },

  update(id, data, req = null) {
    console.log("data to update:", id);

    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const obj = await Timestamp.findById(id);
          if (!obj) {
            return reject(ErrorNotFound("Timestamp id: not found"));
          }
          const beforeSnap = obj.toObject();

          if (data.image_out) {
            try {
              const uploadedImage = await UploadService.uploadBase64({
                image: data.image_out,
              });
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.image_out = databasedImage.id;
              console.info("Image update success");
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }

          data.checkOut = new Date();

          await Timestamp.updateOne({ _id: id }, data);

          const afterSnap = await Timestamp.findById(id).lean();
          ActivityLogService.recordAsync({
            req,
            module: "HR",
            resourceType: "timestamp",
            action: "UPDATE",
            resourceId: id,
            summary: `เช็คเอาท์ / แก้ไขรายการลงเวลา (${data?.employee_firstname || ""} ${data?.employee_lastname || ""})`.trim(),
            before: beforeSnap,
            after: afterSnap,
          });

          NotifyService.timestampNotify({
            message: `${data.employee_firstname} ${
              data.employee_lastname
            } \nproject:${data?.project_out?.name}\n check in ${dayjs(
              data?.checkIn
            )
              .locale("th")
              .format("DD/MM/YYYY : HH.mm นาที")}\n check out ${dayjs(
              data?.checkOut
            )
              .locale("th")
              .format("DD/MM/YYYY : HH.mm นาที")} `,
          });
          await session.commitTransaction();
          resolve(Object.assign(obj, data));
        } catch (error) {
          await session.abortTransaction();
          reject(error);
        } finally {
          session.endSession();
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then((result) => {
          const io = getIO();
          if (io) io.emit("timestamp:updated", { id: result?._id || id });
          return result;
        })
    );
  },

  updateOT(id, data, req = null) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Timestamp.findById(id);
        if (!obj) {
          return reject(ErrorNotFound("Timestamp id: not found"));
        }
        const beforeSnap = obj.toObject();

        const payload = { ...data.datasubmit };

        await Timestamp.updateOne({ _id: id }, payload);

        const afterSnap = await Timestamp.findById(id).lean();
        ActivityLogService.recordAsync({
          req,
          module: "HR",
          resourceType: "timestamp",
          action: "UPDATE",
          resourceId: id,
          summary: "แก้ไขรายการลงเวลา (OT / อัตรา / หมายเหตุ)",
          before: beforeSnap,
          after: afterSnap,
        });

        await session.commitTransaction();
        resolve(Object.assign(obj, data));
      } catch (error) {
        await session.abortTransaction();
        reject(error);
      } finally {
        session.endSession();
      }
    });
  },

  updateLabour(id, data, req = null) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Timestamp.find({ employee: id });
        if (!obj || obj.length === 0) {
          return reject(ErrorNotFound("Timestamp id: not found"));
        }

        const payload = { ...data };

        console.log("Updating labour timestamps with payload:", payload);

        const resUpdate = await Timestamp.updateMany({ employee: id }, payload);
        ActivityLogService.recordAsync({
          req,
          module: "HR",
          resourceType: "timestamp",
          action: "UPDATE",
          resourceId: id,
          summary: `อัปเดตค่าแรง/เบี้ยเลี้ยงในรายการลงเวลา (${resUpdate.modifiedCount || 0} รายการ)`,
          meta: {
            employeeId: id,
            modifiedCount: resUpdate.modifiedCount,
            payload,
          },
        });

        await session.commitTransaction();
        resolve(Object.assign(obj, data));
      } catch (error) {
        await session.abortTransaction();
        reject(error);
      } finally {
        session.endSession();
      }
    });
  },

  delete(id, req = null) {
    return (
      new Promise(async (resolve, reject) => {
        try {
          const obj = await Timestamp.findById(id);
          if (!obj) {
            return reject(ErrorNotFound("id: not found"));
          }
          const beforeSnap = obj.toObject();
          const objUser = obj.uid;
          if (objUser) {
            await User.updateOne(
              { _id: objUser },
              { $pull: { timestamps: id } },
              { multi: true }
            );
          }
          await Timestamp.deleteOne({ _id: id });
          ActivityLogService.recordAsync({
            req,
            module: "HR",
            resourceType: "timestamp",
            action: "DELETE",
            resourceId: id,
            summary: `ลบรายการลงเวลา (${beforeSnap?.employee_firstname || ""} ${beforeSnap?.employee_lastname || ""})`.trim(),
            before: beforeSnap,
          });
          resolve({ id });
        } catch (error) {
          reject(error);
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then(() => {
          const io = getIO();
          if (io) io.emit("timestamp:deleted", { id });
        })
    );
  },
};

module.exports = methods;
