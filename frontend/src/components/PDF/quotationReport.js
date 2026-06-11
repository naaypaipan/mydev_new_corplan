import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.locale('th');
dayjs.extend(buddhistEra);

const quotationReport = (data) => {
  // ตรวจสอบข้อมูลและกำหนดค่าเริ่มต้น
  const safeData = {
    billingNumber: data.billingNumber || 'ไม่ระบุ',
    customerName: data.customerName || 'ไม่ระบุ',
    topic: data.topic || '-',
    date: data.date || dayjs().format('YYYY-MM-DD'),
    vatRate: data.vatRate || 7,
    items: Array.isArray(data.items) ? data.items : [],
    summary: {
      subtotal: data.summary?.subtotal || '0.00',
      discount: data.summary?.discount || '0.00',
      afterDiscount: data.summary?.afterDiscount || '0.00',
      vat: data.summary?.vat || '0.00',
      total: data.summary?.total || '0.00',
    },
  };

  const docDefinition = {
    content: [
      { text: 'ใบเสนอราคา', style: 'header' },
      { text: `เลขที่เอกสาร: ${safeData.billingNumber}`, style: 'subheader' },
      { text: `วันที่: ${dayjs(safeData.date).format('DD MMMM BBBB')}`, style: 'subheader' },
      { text: `ลูกค้า: ${safeData.customerName}`, style: 'subheader' },
      { text: `ที่อยู่: ${safeData.topic}`, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['5%', '40%', '15%', '15%', '15%', '10%'],
          body: [
            [
              { text: 'ลำดับ', style: 'tableHeader' },
              { text: 'รายการ', style: 'tableHeader' },
              { text: 'จำนวน', style: 'tableHeader' },
              { text: 'หน่วย', style: 'tableHeader' },
              { text: 'ราคาต่อหน่วย', style: 'tableHeader' },
              { text: 'รวม', style: 'tableHeader' },
            ],
            ...safeData.items.map((item, index) => [
              index + 1,
              item.description || 'ไม่ระบุ',
              (item.quantity || 0).toString(),
              item.unit || '-',
              (Number(item.pricePerUnit) || 0).toFixed(2), // แปลงเป็น Number
              (Number(item.total) || 0).toFixed(2), // แปลงเป็น Number
            ]),
          ],
        },
        layout: 'lightHorizontalLines',
      },
      { text: `รวมเป็นเงิน: ${safeData.summary.subtotal} บาท`, style: 'summary' },
      { text: `ส่วนลด: ${safeData.summary.discount} บาท`, style: 'summary' },
      { text: `ราคาหลังหักส่วนลด: ${safeData.summary.afterDiscount} บาท`, style: 'summary' },
      { text: `ภาษีมูลค่าเพิ่ม ${safeData.vatRate}%: ${safeData.summary.vat} บาท`, style: 'summary' },
      { text: `จำนวนเงินรวมทั้งสิ้น: ${safeData.summary.total} บาท`, style: 'summary' },
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, margin: [0, 5, 0, 5] },
      summary: { fontSize: 12, margin: [0, 5, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'black', fillColor: '#f5f5f5' },
    },
    defaultStyle: {
      font: 'Sarabun',
    },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
  };

  try {
    pdfMake.createPdf(docDefinition).open();
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw new Error('ไม่สามารถสร้าง PDF ได้');
  }
};

export default quotationReport;