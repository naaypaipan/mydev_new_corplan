import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

export default function FinanceDailySotus({ data }) {
  try {
    if (!data || !data.rows || data.rows.length === 0) {
      alert('ไม่มีข้อมูลสำหรับออกรายงาน');
      return;
    }

    // 1. Prepare data for Sheet "AAAA"
    const sheet1Data = data.rows.map((row, index) => {
      const empName =
        row.employee?.firstname_th && row.employee?.lastname_th
          ? `${row.employee.firstname_th} ${row.employee.lastname_th}`
          : `${row.employee?.firstname || ''} ${row.employee?.lastname || ''}`;

      return {
        ลำดับที่: index + 1,
        'วันที่ขอรับ/จ่าย': row.date
          ? dayjs(row.date).format('DD/MM/YYYY')
          : '',
        ชื่อRecord: '',
        วันที่ทำรายการ: row.dateCreated
          ? dayjs(row.dateCreated).format('DD/MM/YYYY HH:mm')
          : '',
        'รหัสรับ-จ่าย': row.type || '',
        รหัสอ้างอิง: '',
        วันที่เกิดรายการ: row.date ? dayjs(row.date).format('DD/MM/YYYY') : '',
        ประเภท: row.type || '',
        ผู้ตั้งเบิก: empName.trim(),
        ผู้ขอเบิก: empName.trim(),
        รับเงินจาก: '',
        จ่ายให้: row.payee?.name || '',
        bank_reciever: row.payee?.bank || '',
        acc_reciever: row.payee?.account_number || '',
        'ยอดรับ+คืนKPP': '',
        ยอดรับประมาณการ: '',
        ยอดจ่ายประมาณการ: row.totalAmount || 0,
        CFรับ: '',
        CFจ่าย: row.totalAmount || 0,
        'ลูกหนี้เพิ่ม / ลูกหนี้ลด / เจ้าหนี้เพิ่ม / เจ้าหนี้ลด': '',
        'OWNERเพิ่ม / OWNERลด': '',
        'ลงทุนในงานเพิ่ม / ลงทุนในงานลด': '',
        'สำรองจ่ายเพิ่ม / สำรองจ่ายลด': '',
        'เบิกล่วงหน้าพนักงานเพิ่ม / เบิกล่วงหน้าพนักงานลด': '',
        'ซื้อสำรองไว้ใช้เพิ่ม / ซื้อสำรองไว้ใช้ลด': '',
        'กำไร / ขาดทุน': '',
        รับเงินเข้าอย่างเดียว: '',
        'ID / Personal / อื่นๆ': '',
        หมายเหตุ: '',
        Status: 'APPROVE', // Assuming approved based on context
        'วิธีการรับ/จ่าย': row.paidType || '',
        ยอดรวมกระทบCF: row.totalAmount || 0,
        รหัสอ้างอิงการชำระเงิน: '',
      };
    });

    // 2. Prepare data for Sheet "BBBB"
    let sheet2Data = [];
    data.rows.forEach((row, rowIndex) => {
      if (row.expenses && row.expenses.length > 0) {
        const expensesDocs = row.expenses.map((exp, expIndex) => {
          const netAmount =
            exp?.net_price != null
              ? exp.net_price
              : (exp?.price || 0) - (exp?.withholding_tax || 0) || 0;
          return {
            ลำดับที่: rowIndex + 1,
            ลำดับที่รายการย่อย: expIndex + 1,
            รายการ: exp.name || '',
            Team: exp.project?.name || '', // Using Project Name as Team/proejct
            job: exp.project?.project_number || '',
            CODEการจ่าย: exp.code || '',
            'sub-code1 / sub-code2': '',
            อ้างอิงใบวางบิลคู่ค้า: exp.invoice_number || '',
            จำนวนเงินไม่รวมvat: netAmount,
            VAT: '',
            'โดนหักณ ที่จ่าย': '',
            'เราหักณ ที่จ่าย': '',
            'VAT2 / โดนหักณ ที่จ่าย2 / เราหักณ ที่จ่าย2': '',
            'หักปกส / บริษัทจ่ายปกส': '',
            ยอดภงด1: '',
            หักภาษีเงินได้: '',
            'หัก/จ่ายค่าธรรมเนียมการโอน': '',
            ยอดจ่ายจริง: netAmount,
            ตรวจสอบงบประมาณ: '',
            อนุมัติโดย: '', // Could add approver if available
            รหัสงบประมาณ: exp.budget?.name || '', // Using budget name/number
            ตรวจสอบรหัสงบประมาณ: '',
            'อ้างอิงเลขที่ใบสั่งซื้อ (และคอลัมน์ตรวจสอบ)': '',
            อ้างอิงเลขที่ใบกำกับภาษี: '',
            'ต้นทุนต่างๆ (ค่าวัสดุ1xxx, ต้นทุนค่าแรง2xxx, ต้นทุนค่าเครื่องมือ3xxx, ต้นทุนค่างานเหมา4xxx, ต้นทุนทางอ้อม5xxx)':
              '',
            'ลงบ/ช บริษัท': '',
            'D/ID': '',
            'ยอดรับ/จ่ายจริง': netAmount,
            Status: exp.status || '',
            รหัสอ้างอิงการชำระเงิน: '',
          };
        });
        sheet2Data = [...sheet2Data, ...expensesDocs];
      }
    });

    // 3. Create Workbook and Sheets
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'AAAA');

    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'BBBB');

    // 4. Write and Download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    const fileName = `Finance_Daily_${dayjs().format('YYYYMMDD_HHmm')}.xlsx`;
    saveAs(dataBlob, fileName);
  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
  }
}
