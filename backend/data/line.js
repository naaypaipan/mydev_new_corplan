const functions = require("@google-cloud/functions-framework");

const axios = require("axios");
const dayjs = require("dayjs");
const dotenv = require("dotenv");
const _ = require("lodash");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
const tz = "Asia/Bangkok";
dayjs.tz.setDefault(tz);

dotenv.config();

const notify = async () => {
  const url = "https://engineering.sotus.online/api/v1";
  try {
    const information = await axios.get(`${url}/information/`);
    const response = await axios.get(
      `${url}/timestamp/checkin/notify?dash=true&dateStart=${dayjs()
        .tz(tz)
        .startOf("day")
        .toISOString()}&dateEnd=${dayjs().endOf("day").toISOString()}`
    );

    const checkinResult = response.data;
    const info = information?.data;

    if (
      !info?.line_notify_checkin?.token ||
      !info?.line_notify_checkin?.group
    ) {
      throw new Error("Missing Line configuration data");
    }

    // console.log("checkinResult", info?);

    const createProjectMessage = (
      projects,
      startIndex,
      endIndex,
      partNumber,
      totalParts
    ) => {
      const messageContents = [];
      let grandTotal = 0;
      let grandTotalAllCost = 0;
      let grandTotalAllOT = 0;

      if (_.isArray(projects) && projects.length > 0) {
        projects
          .slice(startIndex, endIndex)
          .forEach((project, projectIndex) => {
            const actualIndex = startIndex + projectIndex;
            const projectDetails = {
              name: project.project_name,
              project_number: project.project_number,
              project_customer: project.project_customer,
              project_location: project.project_location,
              labor_cost: project.labor_cost || 0,
              total_cost_all: project.total_cost_all || 0,
              total_ot_all: project.total_ot_all || 0,
              total_spent: project.total_spent || 0,
              percentage_used: project.percentage_used || 0,
              remaining_budget: project.remaining_budget || 0,
            };
            const employees = project.employees;
            let projectTotal = 0;

            // เพิ่มหัวข้อชื่อโครงการ
            messageContents.push({
              type: "box",
              layout: "vertical",
              margin: "sm",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: `รหัส: ${projectDetails.project_number}`,
                  size: "xs",
                  color: "#464646FF",
                  margin: "sm",
                },
                {
                  type: "text",
                  text: `${actualIndex + 1}. ${
                    projectDetails?.project_customer
                  } | ${projectDetails?.project_location}`,
                  weight: "bold",
                  color: "#1e6dff",
                  wrap: true,
                  size: "md",
                },
                {
                  type: "text",
                  text: `${projectDetails.name}`,
                  weight: "bold",
                  size: "xs",
                  color: "#464646FF",
                  margin: "sm",
                  wrap: true,
                },
              ],
            });

            // แสดงงบประมาณและการใช้จ่าย
            messageContents.push({
              type: "box",
              layout: "vertical",
              margin: "sm",
              spacing: "xs",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "งบค่าแรง:",
                      size: "xs",
                      color: "#555555",
                      flex: 3,
                    },
                    {
                      type: "text",
                      text: `${projectDetails.labor_cost.toLocaleString()} บาท`,
                      size: "xs",
                      color: "#1e6dff",
                      flex: 4,
                      align: "end",
                      weight: "bold",
                      wrap: true,
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "ใช้ไปแล้วถึงปัจจุบัน:",
                      size: "xs",
                      color: "#555555",
                      flex: 3,
                    },
                    {
                      type: "text",
                      text: `${projectDetails.total_spent.toLocaleString()} บาท `,
                      size: "xs",
                      wrap: true,
                      color:
                        projectDetails.percentage_used > 80
                          ? "#e74c3c"
                          : "#00C410FF",
                      flex: 4,
                      align: "end",
                      weight: "bold",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "\tเปอร์เซ็นต์:",
                      size: "xs",
                      color: "#555555",
                      flex: 3,
                    },
                    {
                      type: "text",
                      text: `${projectDetails.percentage_used}%`,
                      size: "xs",
                      color:
                        projectDetails.percentage_used > 80
                          ? "#e74c3c"
                          : "#00C410FF",
                      flex: 4,
                      align: "end",
                      weight: "bold",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "คงเหลือถึงปัจจุบัน:",
                      size: "xs",
                      color: "#555555",
                      flex: 3,
                    },
                    {
                      type: "text",
                      text: `${projectDetails.remaining_budget.toLocaleString()} บาท`,
                      size: "xs",
                      wrap: true,
                      color:
                        projectDetails.remaining_budget < 0
                          ? "#e74c3c"
                          : "#27ae60",
                      flex: 4,
                      align: "end",
                      weight: "bold",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "ค่า OT ถึงปัจจุบัน:",
                      size: "xs",
                      color: "#555555",
                      flex: 3,
                    },
                    {
                      type: "text",
                      text: `${projectDetails.total_ot_all.toLocaleString()} บาท`,
                      size: "xs",
                      color: "#555555",
                      wrap: true,
                      flex: 4,
                      align: "end",
                      weight: "bold",
                    },
                  ],
                },
              ],
            });

            messageContents.push({
              type: "separator",
              margin: "sm",
              color: "#DDDDDD",
            });

            // สร้างส่วนหัวของตาราง
            messageContents.push({
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                {
                  type: "text",
                  text: "ชื่อ-นามสกุล",
                  size: "xs",
                  color: "#555555",
                  weight: "bold",
                  flex: 6,
                },
                {
                  type: "text",
                  text: "เวลา",
                  size: "xs",
                  color: "#555555",
                  weight: "bold",
                  flex: 2,
                  align: "center",
                },
                {
                  type: "text",
                  text: "ค่าแรง",
                  size: "xs",
                  color: "#555555",
                  weight: "bold",
                  flex: 3,
                  align: "end",
                },
              ],
            });

            messageContents.push({
              type: "separator",
              margin: "sm",
              color: "#DDDDDD",
            });

            // เพิ่มรายการพนักงานในโครงการ
            employees.forEach((item, index) => {
              const price = item.salary_per_day || 0;
              projectTotal += price;

              messageContents.push({
                type: "box",
                layout: "horizontal",
                margin: "sm",
                contents: [
                  {
                    type: "text",
                    text: `${index + 1}.${item.name}`,
                    size: "xs",
                    color: "#555555",
                    flex: 6,
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: item?.checkInTime || "-",
                    size: "xs",
                    color: "#1e6dff",
                    flex: 2,
                    align: "center",
                  },
                  {
                    type: "text",
                    text: `${price.toLocaleString()}`,
                    size: "xs",
                    color: "#27ae60",
                    flex: 3,
                    align: "end",
                  },
                ],
              });
            });

            messageContents.push({
              type: "separator",
              margin: "sm",
              color: "#DDDDDD",
            });

            // เพิ่มรวมค่าแรงโครงการ
            messageContents.push({
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                {
                  type: "text",
                  text: "รวมวันนี้",
                  size: "sm",
                  color: "#555555",
                  weight: "bold",
                  flex: 7,
                },
                {
                  type: "text",
                  text: `${projectTotal.toLocaleString()} บาท`,
                  size: "sm",
                  color: "#27ae60",
                  weight: "bold",
                  flex: 4,
                  align: "end",
                },
              ],
            });

            grandTotal += projectTotal;
            grandTotalAllCost += projectDetails.total_cost_all;
            grandTotalAllOT += projectDetails.total_ot_all;

            if (projectIndex < endIndex - startIndex - 1) {
              messageContents.push({
                type: "separator",
                margin: "lg",
              });
            }
          });

        // เพิ่มสรุปทุกโครงการ
        messageContents.push({
          type: "separator",
          margin: "lg",
        });

        messageContents.push({
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "สรุปค่าแรงส่วนนี้",
                  size: "md",
                  color: "#1e6dff",
                  weight: "bold",
                  flex: 5,
                },
                {
                  type: "text",
                  text: `${grandTotal.toLocaleString()} บาท`,
                  size: "md",
                  color: "#27ae60",
                  weight: "bold",
                  flex: 5,
                  align: "end",
                },
              ],
            },
          ],
        });
      } else {
        messageContents.push({
          type: "box",
          layout: "vertical",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "ไม่พบข้อมูลการลงเวลาวันนี้",
              size: "md",
              color: "#555555",
              align: "center",
            },
          ],
        });
      }

      return {
        type: "flex",
        altText: `รายงานค่าแรงประจำวัน (ส่วนที่ ${partNumber}/${totalParts})`,
        contents: {
          type: "bubble",
          size: "giga",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#1e6dff",
            paddingTop: "12px",
            paddingBottom: "12px",
            contents: [
              {
                type: "text",
                text: `รายงานค่าแรง (${partNumber}/${totalParts})`,
                size: "lg",
                color: "#ffffff",
                weight: "bold",
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "xs",
                contents: [
                  {
                    type: "text",
                    text: `วันที่ ${dayjs().tz(tz).format("DD/MM/YYYY")}`,
                    color: "#ffffff",
                    size: "md",
                    weight: "bold",
                    flex: 5,
                  },
                  {
                    type: "text",
                    text: `notify at ${dayjs().tz(tz).format("HH:mm")} `,
                    size: "md",
                    color: "#ffffff",
                    weight: "bold",
                    flex: 5,
                    align: "end",
                  },
                ],
              },
            ],
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: messageContents,
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: `โครงการ ${startIndex + 1}-${endIndex} จาก ${
                  projects?.length || 0
                } โครงการ`,
                size: "sm",
                color: "#555555",
                align: "center",
              },
              {
                type: "text",
                text: "COREPLAN ERP",
                size: "xs",
                color: "#aaaaaa",
                align: "center",
                margin: "md",
              },
            ],
          },
          styles: {
            header: {
              backgroundColor: "#1e6dff",
            },
          },
        },
      };
    };

    // ฟังก์ชันส่งข้อความ Line (รองรับการส่งได้สูงสุด 5 ข้อความต่อครั้ง)
    const sendLineMessages = async (messages, token, groupId) => {
      const MAX_MESSAGES_PER_REQUEST = 5;
      const chunks = [];

      // แบ่งข้อความออกเป็นกลุ่มๆ ละไม่เกิน 5 ข้อความ
      for (let i = 0; i < messages.length; i += MAX_MESSAGES_PER_REQUEST) {
        chunks.push(messages.slice(i, i + MAX_MESSAGES_PER_REQUEST));
      }

      console.log(`Total chunks to send: ${chunks.length}`);

      // ส่งแต่ละกลุ่มทีละกลุ่ม
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const dataLine = {
          method: "post",
          url: "https://api.line.me/v2/bot/message/push",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: {
            to: groupId,
            messages: chunk,
          },
        };

        try {
          const chunkSize =
            Buffer.byteLength(JSON.stringify(dataLine), "utf8") / 1024;
          console.log(
            `Sending chunk ${i + 1}/${chunks.length} (${
              chunk.length
            } messages, ${chunkSize.toFixed(2)} KB)`
          );

          const lineApiClient = axios.create();
          await lineApiClient(dataLine);

          console.log(`Chunk ${i + 1}/${chunks.length} sent successfully`);

          // หน่วงเวลาเล็กน้อยระหว่างการส่งแต่ละกลุ่ม
          if (i < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(
            `Error sending chunk ${i + 1}/${chunks.length}:`,
            error.response?.status,
            error.response?.data || error.message
          );
          throw error;
        }
      }
    };

    // สร้างข้อความทั้งหมด
    const messages = [];
    const maxSizeKB = 28; // ลดขนาดให้ต่ำกว่า 30 KB (ใช้ 28 KB เพื่อความปลอดภัย)
    const projects = checkinResult?.rows || [];

    if (projects.length === 0) {
      // กรณีไม่มีข้อมูล
      messages.push(createProjectMessage([], 0, 0, 1, 1));
    } else {
      // แบ่งโครงการออกเป็นกลุ่ม
      let currentStart = 0;
      const allMessageGroups = [];

      while (currentStart < projects.length) {
        let currentEnd = currentStart;
        let lastValidEnd = currentStart;

        // ทดลองเพิ่มโครงการทีละตัวจนกว่าจะเกินขนาด
        while (currentEnd < projects.length) {
          lastValidEnd = currentEnd;
          currentEnd++;

          const testMessage = createProjectMessage(
            projects,
            currentStart,
            currentEnd,
            1,
            1
          );

          // คำนวณขนาดของ bubble content เท่านั้น (ไม่รวม wrapper)
          const bubbleSize =
            Buffer.byteLength(JSON.stringify(testMessage.contents), "utf8") /
            1024;

          if (bubbleSize > maxSizeKB) {
            // ถ้าขนาดเกิน ให้ใช้ช่วงก่อนหน้า (lastValidEnd)
            break;
          }
        }

        // ถ้าวนลูปแล้วยังไม่มีโครงการที่ใช้ได้ (กรณีโครงการแรกก็ใหญ่เกิน)
        // ให้ใช้แค่โครงการเดียวไปเลย
        if (lastValidEnd === currentStart && currentStart < projects.length) {
          lastValidEnd = currentStart + 1;
        }

        // บันทึกช่วงที่ผ่านการตรวจสอบ
        allMessageGroups.push({
          start: currentStart,
          end: lastValidEnd,
        });

        currentStart = lastValidEnd;
      }

      // สร้างข้อความจริงจากช่วงที่บันทึกไว้
      const totalParts = allMessageGroups.length;
      allMessageGroups.forEach((group, index) => {
        if (group.start === group.end) return; // ข้ามกลุ่มที่ว่าง

        const message = createProjectMessage(
          projects,
          group.start,
          group.end,
          index + 1,
          totalParts
        );
        messages.push(message);

        const bubbleSize =
          Buffer.byteLength(JSON.stringify(message.contents), "utf8") / 1024;
        console.log(
          `Message ${index + 1}/${totalParts}: Projects ${group.start + 1}-${
            group.end
          }, Bubble Size: ${bubbleSize.toFixed(2)} KB`
        );
      });

      // --- START: เพิ่มข้อความสรุปสุดท้าย (ย้ายสรุปไปไว้ใต้ข้อความสุดท้าย ถ้าพอดี) ---
      let grandTotalLaborCost = 0;
      let grandTotalOtCost = 0;
      let totalPeopleCount = 0;

      projects.forEach((project) => {
        totalPeopleCount += project.employees?.length || 0;
        // grandTotalOtCost += project.total_ot_all || 0;
        project.employees?.forEach((employee) => {
          grandTotalLaborCost += employee.salary_per_day || 0;
        });
      });

      const finalGrandTotal = grandTotalLaborCost;

      // เนื้อหาสรุป (fragment สำหรับต่อท้าย body.contents) - สรุปของวันนี้
      const summaryContent = [
        {
          type: "separator",
          margin: "xxl",
          color: "#1E6DFFFF",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "สรุปยอดรวมทั้งหมดวันนี้",
              weight: "bold",
              size: "xl",
              color: "#1e6dff",
              align: "center",
              margin: "md",
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "จำนวนคนเข้างานทั้งหมด:",
                  size: "md",
                  color: "#555555",
                  flex: 6,
                },
                {
                  type: "text",
                  text: `${totalPeopleCount} คน`,
                  size: "md",
                  color: "#111111",
                  align: "end",
                  weight: "bold",
                  flex: 4,
                },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "ค่าแรง (ไม่รวม OT):",
                  size: "md",
                  color: "#555555",
                  flex: 6,
                },
                {
                  type: "text",
                  text: `${grandTotalLaborCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} บาท`,
                  size: "md",
                  color: "#111111",
                  align: "end",
                  weight: "bold",
                  flex: 4,
                },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "ค่า OT:",
                  size: "md",
                  color: "#555555",
                  flex: 6,
                },
                {
                  type: "text",
                  text: `${grandTotalOtCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} บาท`,
                  size: "md",
                  color: "#111111",
                  align: "end",
                  weight: "bold",
                  flex: 4,
                },
              ],
            },
            {
              type: "separator",
              margin: "md",
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "ยอดรวมทั้งหมด:",
                  size: "lg",
                  color: "#1e6dff",
                  weight: "bold",
                  flex: 6,
                },
                {
                  type: "text",
                  text: `${finalGrandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} บาท`,
                  size: "lg",
                  color: "#27ae60",
                  align: "end",
                  weight: "bold",
                  flex: 4,
                },
              ],
            },
          ],
        },
      ];

      // เตรียมสรุปของวันก่อนหน้า (ถ้ามี) — แสดงเฉพาะ totals: labor, OT, total
      const prevTotals = checkinResult?.previous?.totals || null;
      let prevContent = [];
      if (
        prevTotals &&
        (prevTotals.totalLabor ||
          prevTotals.totalOt ||
          prevTotals.totalSpent ||
          prevTotals.totalPeople)
      ) {
        prevContent = [
          {
            type: "separator",
            margin: "md",
            color: "#AAAAAA",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "สรุปเมื่อวาน (รวม)",
                weight: "bold",
                size: "md",
                color: "#1e6dff",
                align: "center",
                margin: "sm",
              },
              // จำนวนคนเมื่อวาน
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "จำนวนคนเข้างาน:",
                    size: "sm",
                    color: "#555555",
                    flex: 6,
                  },
                  {
                    type: "text",
                    text: `${prevTotals.totalPeople || 0} คน`,
                    size: "sm",
                    color: "#111111",
                    align: "end",
                    weight: "bold",
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ค่าแรง (ไม่รวม OT):",
                    size: "sm",
                    color: "#555555",
                    flex: 6,
                  },
                  {
                    type: "text",
                    text: `${(prevTotals.totalLabor || 0).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )} บาท`,
                    size: "sm",
                    color: "#111111",
                    align: "end",
                    weight: "bold",
                    flex: 4,
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ค่า OT:",
                    size: "sm",
                    color: "#555555",
                    flex: 6,
                  },
                  {
                    type: "text",
                    text: `${(prevTotals.totalOt || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} บาท`,
                    size: "sm",
                    color: "#111111",
                    align: "end",
                    weight: "bold",
                    flex: 4,
                  },
                ],
              },
              {
                type: "separator",
                margin: "md",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "รวมทั้งหมด:",
                    size: "sm",
                    color: "#1e6dff",
                    weight: "bold",
                    flex: 6,
                  },
                  {
                    type: "text",
                    text: `${(prevTotals.totalSpent || 0).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )} บาท`,
                    size: "sm",
                    color: "#27ae60",
                    align: "end",
                    weight: "bold",
                    flex: 4,
                  },
                ],
              },
            ],
          },
        ];
      }

      // พยายามต่อ summary (วันนี้ + เมื่อวาน) ลงในข้อความสุดท้าย (ถ้าไม่เกินขนาด bubble)
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const lastContents = lastMessage.contents || {};
        const lastBody = lastContents.body || { contents: [] };

        // try: today + yesterday
        const combinedWithPrev = {
          ...lastContents,
          body: {
            ...lastBody,
            contents: [
              ...(lastBody.contents || []),
              ...summaryContent,
              ...prevContent,
            ],
          },
        };
        const sizeWithPrev =
          Buffer.byteLength(JSON.stringify(combinedWithPrev), "utf8") / 1024;

        if (sizeWithPrev <= maxSizeKB) {
          lastMessage.contents = combinedWithPrev;
          lastMessage.altText = "รายงานค่าแรงประจำวัน (รวมสรุป)";
          console.log(
            `Combined today+prev summary into last message. Size: ${sizeWithPrev.toFixed(
              2
            )} KB`
          );
        } else {
          // try: today only (existing behavior)
          const combinedTodayOnly = {
            ...lastContents,
            body: {
              ...lastBody,
              contents: [...(lastBody.contents || []), ...summaryContent],
            },
          };
          const sizeTodayOnly =
            Buffer.byteLength(JSON.stringify(combinedTodayOnly), "utf8") / 1024;

          if (sizeTodayOnly <= maxSizeKB) {
            lastMessage.contents = combinedTodayOnly;
            lastMessage.altText = "รายงานค่าแรงประจำวัน (รวมสรุป)";
            console.log(
              `Combined today summary into last message. Size: ${sizeTodayOnly.toFixed(
                2
              )} KB`
            );
          } else {
            // fallback: ส่ง summary (วันนี้) เป็นข้อความแยก และ ถ้ามี prevContent ส่งแยกอีกอัน
            console.log(
              `Cannot combine summaries into last message. Sizes: withPrev=${sizeWithPrev.toFixed(
                2
              )} KB, todayOnly=${sizeTodayOnly.toFixed(2)} KB`
            );

            const summaryMessage = {
              type: "flex",
              altText: "สรุปรายงานค่าแรงรวมทั้งหมด",
              contents: {
                type: "bubble",
                size: "giga",
                body: {
                  type: "box",
                  layout: "vertical",
                  spacing: "md",
                  contents: summaryContent.slice(1),
                },
              },
            };
            messages.push(summaryMessage);

            if (prevContent.length > 0) {
              const prevMessage = {
                type: "flex",
                altText: "สรุปเมื่อวาน (รวม)",
                contents: {
                  type: "bubble",
                  size: "giga",
                  body: {
                    type: "box",
                    layout: "vertical",
                    spacing: "md",
                    contents: prevContent.slice(1),
                  },
                },
              };
              messages.push(prevMessage);
            }
          }
        }
      } else {
        // หากไม่มีข้อความใดๆ ให้สร้างข้อความสรุปเดี่ยวๆ (รวม today + prev ถ้ามี)
        const contentsForMessage = {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [...summaryContent, ...prevContent].slice(1),
        };
        const summaryMessage = {
          type: "flex",
          altText: "สรุปรายงานค่าแรงรวมทั้งหมด",
          contents: {
            type: "bubble",
            size: "giga",
            body: contentsForMessage,
          },
        };
        messages.push(summaryMessage);
      }
      // --- END: เพิ่มข้อความสรุปสุดท้าย ---
    }

    // ส่งข้อความทั้งหมด
    try {
      const totalPayloadSize =
        Buffer.byteLength(JSON.stringify(messages), "utf8") / 1024;
      console.log(`Total messages: ${messages.length}`);
      console.log(`Total payload size: ${totalPayloadSize.toFixed(2)} KB`);

      await sendLineMessages(
        messages,
        info?.line_notify_checkin?.token,
        info?.line_notify_checkin?.group
      );

      console.log("All Line messages sent successfully");
      resolve(checkinResult);
    } catch (lineError) {
      console.error("Error sending Line messages:", lineError.message);
      reject(lineError);
    }
  } catch (error) {
    console.error(
      "Error in lineMessageApi:",
      error.response?.status || error.code || error.message
    );
    reject(error);
  }
};

// cron.schedule("10 * * * * *", () => {
//   console.log("running a task every minute");
//   notify();
// });

functions.http("helloHttp", (req, res) => {
  notify();
  res.send(`Hello ${req.query.name || req.body.name || "World"}!`);
});
