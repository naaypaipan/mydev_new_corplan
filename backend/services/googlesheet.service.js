// Polyfill Web APIs for Node.js < 18 (required by googleapis v171+)
if (typeof globalThis.fetch === "undefined") {
  const fetch = require("node-fetch");
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}
if (typeof globalThis.Blob === "undefined") {
  globalThis.Blob = require("buffer").Blob;
}
if (typeof globalThis.FormData === "undefined") {
  const { FormData } = require("formdata-node");
  globalThis.FormData = FormData;
}
if (typeof globalThis.ReadableStream === "undefined") {
  const { ReadableStream } = require("stream/web");
  globalThis.ReadableStream = ReadableStream;
}

const { google } = require("googleapis");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const buddhistEra = require("dayjs/plugin/buddhistEra");
const config = require("../configs/app");
const credentials = require("../credentials/gcs");
const informationService = require("./information.service");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);
const tz = "Asia/Bangkok";

// สร้าง auth client จาก service account credentials (ตัวเดียวกับ GCS)
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

let _sheetTitle = null;

async function getFirstSheetTitle(spreadsheetId) {
  if (_sheetTitle) return _sheetTitle;
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  _sheetTitle = meta.data.sheets?.[0]?.properties?.title || "Sheet1";
  return _sheetTitle;
}

/**
 * ดึงรายชื่อแผ่นงานทั้งหมดใน Spreadsheet
 * @param {string} spreadsheetId - Google Spreadsheet ID
 * @returns {Promise<string[]>} - array ของชื่อแผ่นงาน
 */
async function getSheetTitles(spreadsheetId) {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  return meta.data.sheets?.map((s) => s.properties?.title || "Sheet1") || [];
}

const methods = {
  /**
   * API: ดึงรายชื่อแผ่นงานทั้งหมด
   */
  async listSheets() {
    const spreadsheetId = config.googleSheetId;
    if (!spreadsheetId) return [];
    try {
      return await getSheetTitles(spreadsheetId);
    } catch (error) {
      console.error("Google Sheet listSheets failed:", error.message);
      return [];
    }
  },

  /**
   * เพิ่มข้อมูล payout ลงใน Google Sheet
   * @param {Object} payoutDoc - payout document ที่ save แล้ว
   * @param {Object} expensesDoc - expenses document ที่ populate แล้ว (project, budget, employee)
   * @param {Object} options - { sheetTitle?: string } ชื่อแผ่นงานที่ต้องการ (ถ้าไม่ระบุใช้แผ่นแรก)
   */
  async appendPayoutRow(payoutDoc, expensesDoc, options = {}) {
    const spreadsheetId = config.googleSheetId;
    if (!spreadsheetId) {
      console.log("Google Sheet ID not configured, skipping");
      return;
    }

    try {
      let sheetTitle = options.sheetTitle;
      if (!sheetTitle) {
        const info = await informationService.find().catch(() => null);
        sheetTitle = info?.google_sheet_worksheet || null;
      }
      if (!sheetTitle) {
        sheetTitle = await getFirstSheetTitle(spreadsheetId);
      }
      const payDate = payoutDoc.date ? dayjs(payoutDoc.date).tz(tz) : null;
      const expenseDate = expensesDoc?.date ? dayjs(expensesDoc.date).tz(tz) : null;

      const row = [
        "", // 1. ลำดับรายการ
        expensesDoc?.code || payoutDoc?.payout_number || "", // 2. ชื่อ Record
        payoutDoc?.createdAt ? dayjs(payoutDoc.createdAt).tz(tz).format("DD/MM/BBBB HH:mm") : "", // 3. วันที่ทำรายการ (พ.ศ.)
        expenseDate ? expenseDate.format("DD/MM/BBBB") : (payDate ? payDate.format("DD/MM/BBBB") : ""), // 4. วันที่เกิดรายการ (พ.ศ.)
        expensesDoc?.expenses_type || "", // 5. ประเภท
        expensesDoc?.employee ? `${expensesDoc.employee.firstname || ""} ${expensesDoc.employee.lastname || ""}`.trim() : "", // 6. ผู้ขอเบิก
        expensesDoc?.payee?.name || "", // 7. ผู้รับ
        expensesDoc?.payee?.bank || "", // 8. ธนาคาร
        expensesDoc?.payee?.account_number || "", // 9. บัญชี
        "", // 10. D/ID
        expenseDate ? expenseDate.format("DD/MM/BBBB") : "", // 11. วันที่ขอรับ/จ่าย (พ.ศ.)
        payoutDoc?.paidType || "", // 12. ประเภทการโอน
        expensesDoc?.name || "", // 13. รายการ
        expensesDoc?.employee?.team || "", // 14. Team
        expensesDoc?.project?.project_number || "", // 15. Job (รหัสโปรเจค)
        payoutDoc?.price ?? expensesDoc?.net_price ?? expensesDoc?.price ?? 0, // 16. ยอดจ่าย
        expensesDoc?.includes_vat ? 7 : "", // 17. % Vat
        expensesDoc?.vat_amount ?? "", // 18. ยอด Vat
        expensesDoc?.withholding_tax_rate ?? "", // 19. % เราหัก
        expensesDoc?.withholding_tax ?? "", // 20. ยอด เราหัก
        expensesDoc?.budget ? `${expensesDoc.budget.prefix || ""}${expensesDoc.budget.budget_number || ""}`.trim() : "", // 21. รหัสงบประมาณ
         "ST", // 22. บริษัท
        expenseDate ? expenseDate.format("BBBB") : (payDate ? payDate.format("BBBB") : ""), // 23. ปี (พ.ศ.)
        expenseDate ? expenseDate.format("MM") : (payDate ? payDate.format("MM") : ""), // 24. เดือน
        "-", // 25. สถานะเบิกจ่าย
        expensesDoc?.invoice_number && expensesDoc?.description ? `${expensesDoc.invoice_number} ${expensesDoc.description}` : (expensesDoc?.invoice_number || expensesDoc?.description || ""), // 26. Num+Description
         "", // 27. ค่าใช้จ่าย ID
        expensesDoc?.description || "", // 28. คำอธิบาย ID
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${sheetTitle}'!A:AB`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [row],
        },
      });

      console.log("Payout data appended to Google Sheet successfully");
    } catch (error) {
      console.error("Google Sheet append failed:", error.message);
    }
  },

  /**
   * สร้าง header row ถ้า sheet ว่าง (เรียกครั้งเดียวตอน setup)
   * @param {string} [sheetTitle] - ชื่อแผ่นงาน (ถ้าไม่ระบุใช้แผ่นแรก)
   */
  async ensureHeaders(sheetTitle) {
    const spreadsheetId = config.googleSheetId;
    if (!spreadsheetId) return;

    try {
      const title = sheetTitle || (await getFirstSheetTitle(spreadsheetId));

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${title}'!A1:AB1`,
      });

      if (response.data.values && response.data.values.length > 0) {
        return;
      }

      const headers = [
        "ลำดับรายการ",
        "ชื่อ Record",
        "วันที่ทำรายการ",
        "วันที่เกิดรายการ",
        "ประเภท",
        "ผู้ขอเบิก",
        "ผู้รับ",
        "ธนาคาร",
        "บัญชี",
        "D/ID",
        "วันที่ขอรับ/จ่าย",
        "ประเภทการโอน",
        "รายการ",
        "Team",
        "Job",
        "ยอดจ่าย",
        "% Vat",
        "ยอด Vat",
        "% เราหัก",
        "ยอด เราหัก",
        "รหัสงบประมาณ",
        "บริษัท",
        "ปี",
        "เดือน",
        "สถานะเบิกจ่าย",
        "Num+Description",
        "ค่าใช้จ่าย ID",
        "คำอธิบาย ID",
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${title}'!A1:AB1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });

      console.log("Google Sheet headers created");
    } catch (error) {
      console.error("Google Sheet ensureHeaders failed:", error.message);
    }
  },
};

module.exports = { ...methods };
