const axios = require("axios");
const dayjs = require("dayjs");
const config = require("../configs/app");
require("dayjs/locale/th");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("th");
const tz = "Asia/Bangkok";

const methods = {
  /**
   * ส่งแจ้งเตือน Discord เมื่อพนักงาน check-in
   */
  async sendTimestampNotify(data) {
    const webhookUrl = config.discordWebhookTimestamp;
    if (!webhookUrl) {
      console.log("Discord Webhook URL not configured, skipping notification");
      return;
    }

    try {
      const checkInDate = dayjs(data.checkIn).format("DD/MM/YYYY");
      const checkInTime = dayjs(data.checkIn).format("HH:mm:ss");
      const employeeName =
        `${data.employee_firstname || ""} ${data.employee_lastname || ""}`.trim() ||
        data.employeekey ||
        "ไม่ระบุ";

      const projectNumber = data.project_in?.project_number || "";
      const projectName = data.project_in?.name || "-";
      const projectDisplay = projectNumber ? `${projectNumber} | ${projectName}` : projectName;

      // Build location string
      let locationStr = "-";
      if (data.locationCheckIn?.currentLocation) {
        const { lat, lon } = data.locationCheckIn.currentLocation;
        if (lat && lon) {
          locationStr = `[${lat.toFixed(5)}, ${lon.toFixed(5)}](https://www.google.com/maps?q=${lat},${lon})`;
        }
      }

      const embed = {
        title: "🕐 Check-In แจ้งเตือน",
        color: 0x00c853, // green
        fields: [
          {
            name: "📅 วันที่ / เวลา",
            value: `${checkInDate}  ⏰ ${checkInTime}`,
            inline: false,
          },
          {
            name: "👤 พนักงาน",
            value: employeeName,
            inline: false,
          },
          {
            name: "🏗️ โปรเจค",
            value: projectDisplay,
            inline: false,
          },
          {
            name: "📍 พิกัด",
            value: locationStr,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "CorePlan ERP • Timestamp System",
        },
      };

      await axios.post(webhookUrl, {
        embeds: [embed],
      });

      console.log("Discord timestamp notification sent successfully");
    } catch (error) {
      // Non-blocking: log error but don't throw
      console.error("Discord notification failed:", error.message);
    }
  },

  /**
   * ส่งรายงานค่าแรงประจำวันไป Discord (ข้อมูลเดียวกับ LINE lineMessageApi)
   * @param {Object} checkinResult - ผลลัพธ์จาก timestampService.findNotify
   */
  async sendDailyReport(checkinResult) {
    const webhookUrl = config.discordWebhookDailyReport;
    if (!webhookUrl) {
      console.log("Discord Daily Report Webhook not configured, skipping");
      return;
    }

    try {
      const projects = checkinResult?.rows || [];
      const todayStr = dayjs().tz(tz).format("DD/MM/YYYY");
      const timeStr = dayjs().tz(tz).format("HH:mm");

      const fmt = (num) =>
        (num || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      // --- สร้าง embeds สำหรับแต่ละโครงการ ---
      const projectEmbeds = [];
      let grandTotalLabor = 0;
      let grandTotalPeople = 0;

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const employees = project.employees || [];
        let projectDayTotal = 0;

        // สร้าง employee list
        const empLines = employees.map((emp, idx) => {
          const salary = emp.salary_per_day || 0;
          projectDayTotal += salary;
          const checkInTime = emp.checkInTime || "-";
          return `${idx + 1}. ${emp.name} | เข้า: ${checkInTime} | ฿${fmt(salary)}`;
        });

        grandTotalLabor += projectDayTotal;
        grandTotalPeople += employees.length;

        // Budget info
        const budgetInfo = [
          `งบค่าแรง: ฿${fmt(project.labor_cost)}`,
          `ใช้ไปแล้ว: ฿${fmt(project.total_spent)} (${project.percentage_used || 0}%)`,
          `คงเหลือ: ฿${fmt(project.remaining_budget)}`,
          `OT สะสม: ฿${fmt(project.total_ot_all)}`,
        ].join("\n");

        const embed = {
          title: `🏗️ ${i + 1}. ${project.project_customer || ""} | ${project.project_location || ""}`,
          description: `**${project.project_name || "-"}**\nรหัส: ${project.project_number || "-"}`,
          color: (project.percentage_used || 0) > 80 ? 0xe74c3c : 0x1e6dff,
          fields: [
            {
              name: "💰 งบประมาณ",
              value: budgetInfo,
              inline: false,
            },
            {
              name: `👷 พนักงาน (${employees.length} คน)`,
              value: empLines.length > 0 ? empLines.join("\n") : "ไม่มีข้อมูล",
              inline: false,
            },
            {
              name: "📊 รวมวันนี้",
              value: `**฿${fmt(projectDayTotal)}**`,
              inline: false,
            },
          ],
        };

        projectEmbeds.push(embed);
      }

      // --- สรุปรวมทั้งหมดวันนี้ ---
      const todayTotals = checkinResult?.totals || {};
      const grandTotalOt = todayTotals.totalOt || 0;
      const finalGrandTotal = grandTotalLabor + grandTotalOt;

      let summaryDesc = [
        `👥 จำนวนคนเข้างาน: **${grandTotalPeople} คน**`,
        `💵 ค่าแรง (ไม่รวม OT): **฿${fmt(grandTotalLabor)}**`,
        `⏰ ค่า OT: **฿${fmt(grandTotalOt)}**`,
        `━━━━━━━━━━━━━━━`,
        `🏦 **ยอดรวมทั้งหมด: ฿${fmt(finalGrandTotal)}**`,
      ];

      // สรุปเมื่อวาน
      const prevTotals = checkinResult?.previous?.totals || null;
      if (
        prevTotals &&
        (prevTotals.totalLabor || prevTotals.totalOt || prevTotals.totalSpent || prevTotals.totalPeople)
      ) {
        summaryDesc.push(
          "",
          "📋 **สรุปเมื่อวาน**",
          `👥 จำนวนคน: ${prevTotals.totalPeople || 0} คน`,
          `💵 ค่าแรง: ฿${fmt(prevTotals.totalLabor)}`,
          `⏰ OT: ฿${fmt(prevTotals.totalOt)}`,
          `🏦 รวม: ฿${fmt(prevTotals.totalSpent)}`
        );
      }

      // สรุปตามงวด
      const payPeriod = checkinResult?.payPeriod || null;
      if (
        payPeriod &&
        (payPeriod.total_cost || payPeriod.total_ot || payPeriod.total_spent)
      ) {
        summaryDesc.push(
          "",
          `🟠 **ค่าแรงสะสม ${payPeriod.label || ""}**`,
          `💵 ค่าแรงสะสม (ไม่รวม OT): ฿${fmt(payPeriod.total_cost)}`,
          `⏰ OT สะสม: ฿${fmt(payPeriod.total_ot)}`,
          `🏦 รวมค่าแรงสะสมงวดนี้: ฿${fmt(payPeriod.total_spent)}`
        );
      }

      const summaryEmbed = {
        title: `📊 สรุปยอดรวมทั้งหมดวันนี้`,
        description: summaryDesc.join("\n"),
        color: 0x27ae60,
        footer: {
          text: `CorePlan ERP • วันที่ ${todayStr} • ${timeStr}`,
        },
        timestamp: new Date().toISOString(),
      };

      // --- ส่งไปยัง Discord (max 10 embeds per request) ---
      const allEmbeds = [...projectEmbeds, summaryEmbed];
      const MAX_EMBEDS = 10;

      for (let i = 0; i < allEmbeds.length; i += MAX_EMBEDS) {
        const chunk = allEmbeds.slice(i, i + MAX_EMBEDS);
        const partNum = Math.floor(i / MAX_EMBEDS) + 1;
        const totalParts = Math.ceil(allEmbeds.length / MAX_EMBEDS);

        const content =
          totalParts > 1
            ? `📋 รายงานค่าแรงประจำวัน (${partNum}/${totalParts})`
            : `📋 รายงานค่าแรงประจำวัน — ${todayStr}`;

        await axios.post(webhookUrl, {
          content,
          embeds: chunk,
        });

        // หน่วงเวลาระหว่าง chunk
        if (i + MAX_EMBEDS < allEmbeds.length) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      console.log("Discord daily report sent successfully");
    } catch (error) {
      console.error("Discord daily report failed:", error.message);
    }
  },
};

module.exports = { ...methods };

