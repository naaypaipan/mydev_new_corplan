const axios = require("axios");
const dayjs = require("dayjs");
const dotenv = require("dotenv");
const _ = require("lodash");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const informationService = require("../services/information.service");
const timestampService = require("../services/timestamp.service");
const discordService = require("../services/discord.service");

dayjs.extend(utc);
dayjs.extend(timezone);
const tz = "Asia/Bangkok";
dayjs.tz.setDefault(tz);

dotenv.config();

const methods = {
  lineMessageApi() {
    return new Promise(async (resolve, reject) => {
      try {
        const info = await informationService.find();

        const checkinResult = await timestampService.findNotify({
          query: {
            dateStart: dayjs().startOf("day").toISOString(),
            dateEnd: dayjs().endOf("day").toISOString(),
          },
        });

        if (
          !info?.line_notify_checkin?.token ||
          !info?.line_notify_checkin?.group
        ) {
          throw new Error("Missing Line configuration data");
        }

        // console.log("checkinResult", info?);

        // ฟังก์ชันสร้างข้อความสำหรับแต่ละโครงการ
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
                      text: "เข้า",
                      size: "xs",
                      color: "#555555",
                      weight: "bold",
                      flex: 2,
                      align: "center",
                    },
                    // {
                    //   type: "text",
                    //   text: "ออก",
                    //   size: "xs",
                    //   color: "#555555",
                    //   weight: "bold",
                    //   flex: 3,
                    //   align: "end",
                    // },
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
                Buffer.byteLength(
                  JSON.stringify(testMessage.contents),
                  "utf8"
                ) / 1024;

              if (bubbleSize > maxSizeKB) {
                // ถ้าขนาดเกิน ให้ใช้ช่วงก่อนหน้า (lastValidEnd)
                break;
              }
            }

            // ถ้าวนลูปแล้วยังไม่มีโครงการที่ใช้ได้ (กรณีโครงการแรกก็ใหญ่เกิน)
            // ให้ใช้แค่โครงการเดียวไปเลย
            if (
              lastValidEnd === currentStart &&
              currentStart < projects.length
            ) {
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
              Buffer.byteLength(JSON.stringify(message.contents), "utf8") /
              1024;
            console.log(
              `Message ${index + 1}/${totalParts}: Projects ${
                group.start + 1
              }-${group.end}, Bubble Size: ${bubbleSize.toFixed(2)} KB`
            );
          });

          // --- START: เพิ่มข้อความสรุปสุดท้าย (ย้ายสรุปไปไว้ใต้ข้อความสุดท้าย ถ้าพอดี) ---
          let grandTotalLaborCost = 0;
          let grandTotalOtCost = 0;
          let totalPeopleCount = 0;

          // ดึงข้อมูล OT วันนี้จาก checkinResult.totals
          const todayTotals = checkinResult?.totals || {};
          grandTotalOtCost = todayTotals.totalOt || 0;

          projects.forEach((project) => {
            totalPeopleCount += project.employees?.length || 0;
            project.employees?.forEach((employee) => {
              grandTotalLaborCost += employee.salary_per_day || 0;
            });
          });

          const finalGrandTotal = grandTotalLaborCost + grandTotalOtCost;

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

          // --- START: เพิ่มสรุปตามงวด ---
          const payPeriod = checkinResult?.payPeriod || null;
          let payPeriodContent = [];
          if (
            payPeriod &&
            (payPeriod.total_cost ||
              payPeriod.total_ot ||
              payPeriod.total_spent)
          ) {
            payPeriodContent = [
              {
                type: "separator",
                margin: "md",
                color: "#E77000FF",
              },
              {
                type: "box",
                layout: "vertical",
                margin: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: `ค่าแรงสะสม ${payPeriod.label}`,
                    weight: "bold",
                    size: "md",
                    color: "#E77000FF",
                    align: "center",
                    margin: "sm",
                    wrap: true,
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ค่าแรงสะสมงวดนี้ (ไม่รวม OT):",
                        size: "sm",
                        color: "#555555",
                        flex: 6,
                      },
                      {
                        type: "text",
                        text: `${(payPeriod.total_cost || 0).toLocaleString(
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
                        text: "OT สะสม:",
                        size: "sm",
                        color: "#555555",
                        flex: 6,
                      },
                      {
                        type: "text",
                        text: `${(payPeriod.total_ot || 0).toLocaleString(
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
                    type: "separator",
                    margin: "md",
                    color: "#E77000FF",
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "รวมค่าแรงสะสมงวดนี้:",
                        size: "sm",
                        color: "#E77000FF",
                        weight: "bold",
                        flex: 6,
                      },
                      {
                        type: "text",
                        text: `${(payPeriod.total_spent || 0).toLocaleString(
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
          // --- END: เพิ่มสรุปตามงวด ---

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
                        text: `${(prevTotals.totalOt || 0).toLocaleString(
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

          // พยายามต่อ summary (วันนี้ + งวด + เมื่อวาน) ลงในข้อความสุดท้าย (ถ้าไม่เกินขนาด bubble)
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const lastContents = lastMessage.contents || {};
            const lastBody = lastContents.body || { contents: [] };

            // try: today + yesterday + period
            const combinedWithAll = {
              ...lastContents,
              body: {
                ...lastBody,
                contents: [
                  ...(lastBody.contents || []),
                  ...summaryContent,
                  ...prevContent,
                  ...payPeriodContent,
                ],
              },
            };
            const sizeWithAll =
              Buffer.byteLength(JSON.stringify(combinedWithAll), "utf8") / 1024;

            if (sizeWithAll <= maxSizeKB) {
              lastMessage.contents = combinedWithAll;
              lastMessage.altText = "รายงานค่าแรงประจำวัน (รวมสรุป)";
              console.log(
                `Combined all summaries into last message. Size: ${sizeWithAll.toFixed(
                  2
                )} KB`
              );
            } else {
              // fallback: ส่ง summary (วันนี้) เป็นข้อความแยก และอื่นๆ แยกตามลำดับ
              console.log(
                `Cannot combine all summaries into last message. Size: ${sizeWithAll.toFixed(
                  2
                )} KB. Sending separately.`
              );

              // ... (โค้ดส่วนที่เหลือจะจัดการส่งข้อความแยกอยู่แล้ว)
              // เพิ่มข้อความสรุปวันนี้เข้าไปก่อน
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

              // เพิ่มข้อความสรุปเมื่อวาน ถ้ามี
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

              // เพิ่มข้อความสรุปงวด ถ้ามี
              if (payPeriodContent.length > 0) {
                const periodMessage = {
                  type: "flex",
                  altText: `สรุปยอดรวม ${payPeriod.label}`,
                  contents: {
                    type: "bubble",
                    size: "giga",
                    body: {
                      type: "box",
                      layout: "vertical",
                      spacing: "md",
                      contents: payPeriodContent.slice(1),
                    },
                  },
                };
                messages.push(periodMessage);
              }
            }
          } else {
            // หากไม่มีข้อความใดๆ ให้สร้างข้อความสรุปเดี่ยวๆ (รวม today + prev + period ถ้ามี)
            const contentsForMessage = {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                ...summaryContent,
                ...prevContent,
                ...payPeriodContent,
              ].slice(1),
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

          // ส่ง Discord daily report (ใช้ข้อมูลเดียวกัน คนละห้องกับ timestamp)
          try {
            await discordService.sendDailyReport(checkinResult);
          } catch (discordError) {
            console.error(
              "Discord daily report error (non-blocking):",
              discordError.message
            );
          }

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
    });
  },
  otNotify(data) {
    console.log("data", data);

    return new Promise(async (resolve, reject) => {
      try {
        const info = await informationService.find();

        if (
          !info?.line_notify_checkin?.token ||
          !info?.line_notify_checkin?.group
        ) {
          throw new Error("Missing Line configuration data");
        }

        // เตรียมข้อมูล
        const {
          date,
          startTime,
          endTime,
          description,
          requester_data,
          project_data,
          timestamp,
          rate,
          total_hours,
          orderId,
          createdAt,
          status_claim,
        } = data;

        // แปลงวันที่และเวลา
        const dateStr = dayjs(date).tz(tz).format("DD/MM/YYYY");
        const startStr = dayjs(startTime).tz(tz).format("HH:mm");
        const endStr = dayjs(endTime).tz(tz).format("HH:mm");
        const createdAtStr = dayjs(
          createdAt != null && createdAt !== "" ? createdAt : new Date()
        )
          .tz(tz)
          .format("DD/MM/YYYY HH:mm");
        const isRetroactiveClaim = Boolean(status_claim);

        const otDateValueRowContents = [
          {
            type: "text",
            text: dateStr,
            size: "sm",
            color: "#222222",
            wrap: true,
          },
          ...(isRetroactiveClaim
            ? [
                {
                  type: "text",
                  text: " (ขอย้อนหลัง)",
                  size: "sm",
                  color: "#e74c3c",
                  weight: "bold",
                  wrap: true,
                },
              ]
            : []),
        ];

        // รายชื่อพนักงาน
        const empList = (timestamp || []).map((emp, idx) => ({
          type: "box",
          layout: "horizontal",
          margin: "sm",
          contents: [
            {
              type: "text",
              text: `${idx + 1}.`,
              size: "sm",
              color: "#555555",
              flex: 1,
            },
            {
              type: "box",
              layout: "vertical",
              flex: 9,
              contents: [
                {
                  type: "text",
                  text: emp.name || "-",
                  size: "sm",
                  wrap: true,
                },
                // {
                //   type: "text",
                //   text: `${emp.department || "-"} • ${emp.role || "-"}`,
                //   size: "xs",
                //   color: "#888888",
                //   margin: "xs",
                //   wrap: true,
                // },
              ],
            },
          ],
        }));

        // Flex Message
        const flexMessage = {
          type: "flex",
          altText: `แจ้งขออนุมัติ OT - ${project_data?.project_number || ""}`,
          contents: {
            type: "bubble",
            size: "giga",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "box",
                      layout: "vertical",
                      flex: 8,
                      contents: [
                        {
                          type: "text",
                          text: "แจ้งขออนุมัติ OT",
                          weight: "bold",
                          size: "xl",
                          color: "#ffffff",
                        },
                        {
                          type: "text",
                          text: `วันที่สร้างรายการ ${createdAtStr}`,
                          size: "sm",
                          color: "#ffffff",
                          margin: "sm",
                        },
                      ],
                    },
                  ],
                },
              ],
              paddingAll: "lg",
            },
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                // ข้อมูลโครงการ
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "ข้อมูลโครงการ",
                      weight: "bold",
                      size: "md",
                      color: "#27ae60",
                    },
                    {
                      type: "box",
                      layout: "horizontal",
                      margin: "sm",
                      contents: [
                        {
                          type: "text",
                          text: "รหัส:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: project_data?.number || "-",
                          size: "sm",
                          color: "#222222",
                          flex: 7,
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
                          text: "ชื่อ:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: project_data?.name || "-",
                          size: "sm",
                          color: "#222222",
                          flex: 7,
                          wrap: true,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "separator",
                  margin: "md",
                },
                // ข้อมูล OT
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "รายละเอียด OT",
                      weight: "bold",
                      size: "md",
                      color: "#27ae60",
                    },
                    {
                      type: "box",
                      layout: "horizontal",
                      margin: "sm",
                      contents: [
                        {
                          type: "text",
                          text: "วันที่ OT:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "box",
                          layout: "horizontal",
                          flex: 7,
                          spacing: "xs",
                          contents: otDateValueRowContents,
                        },
                      ],
                    },
                    {
                      type: "box",
                      layout: "horizontal",
                      margin: "sm",
                      contents: [
                        {
                          type: "text",
                          text: "เวลา:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `${startStr} - ${endStr}`,
                          size: "sm",
                          color: "#222222",
                          flex: 7,
                        },
                      ],
                    },
                    {
                      type: "box",
                      layout: "horizontal",
                      contents: [
                        {
                          type: "text",
                          text: "ชั่วโมง:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `${total_hours} ชม.`,
                          size: "sm",
                          color: "#27ae60",
                          flex: 7,
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
                          text: "เรท:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `x${rate}`,
                          size: "sm",
                          color: "#e67e22",
                          flex: 7,
                          weight: "bold",
                        },
                      ],
                    },
                    {
                      type: "box",
                      layout: "vertical",
                      margin: "sm",
                      contents: [
                        {
                          type: "text",
                          text: "รายละเอียด:",
                          size: "sm",
                          color: "#555555",
                          margin: "none",
                        },
                        {
                          type: "text",
                          text: description || "-",
                          size: "sm",
                          color: "#222222",
                          wrap: true,
                          margin: "xs",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "separator",
                  margin: "md",
                },
                // ผู้ขอและสถานะ
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "box",
                      layout: "horizontal",
                      contents: [
                        {
                          type: "text",
                          text: "ผู้ขอ:",
                          size: "sm",
                          color: "#555555",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `${requester_data?.firstname || ""} ${
                            requester_data?.lastname || ""
                          }`,
                          size: "sm",
                          color: "#222222",
                          flex: 7,
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "separator",
                  margin: "md",
                },
                // รายชื่อพนักงาน
                {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: `รายชื่อพนักงาน (${timestamp?.length || 0} คน)`,
                      weight: "bold",
                      size: "md",
                      color: "#27ae60",
                    },
                    ...empList,
                  ],
                },
              ],
            },
            footer: {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  height: "sm",
                  action: {
                    type: "uri",
                    label: "ดูรายละเอียด / อนุมัติ",
                    uri: `${info?.url || ""}/humen/ot-request`,
                  },
                  color: "#27ae60",
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
                backgroundColor: "#27ae60",
              },
              footer: {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        };

        // ส่งผ่าน LINE Messaging API (push message)
        const payload = {
          to: info.line_notify_checkin.group,
          messages: [flexMessage],
        };

        await axios.post("https://api.line.me/v2/bot/message/push", payload, {
          headers: {
            Authorization: `Bearer ${info.line_notify_checkin.token}`,
            "Content-Type": "application/json",
          },
        });

        resolve("ส่งไลน์ OT สำเร็จ");
      } catch (error) {
        console.error(
          "Error in otNotify:",
          error.response?.data || error.message
        );
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
