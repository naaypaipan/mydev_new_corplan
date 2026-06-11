import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import _ from 'lodash';

pdfMake.fonts = {
  Sarabun: {
    normal: 'Sarabun-Light.ttf',
    bold: 'Sarabun-Regular.ttf',
    italics: 'Sarabun-LightItalic.ttf',
    bolditalics: 'Sarabun-Italic.ttf',
  },
};

dayjs.locale('th');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

const formatMoney = (val) =>
  (val || 0)?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,');

const genBody = (rows = []) => {
  return _.map(rows, (row, index) => [
    {
      text: index + 1,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.payment_number || ''}`,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.payee?.name || ''}`,
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: [
        { text: row?.payee?.account_number || '' },
        { text: '\n' },
        { text: row?.payee?.bank || '' },
      ],
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.expenses_list?.length || 0}`,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${formatMoney(row?.totalAmount || 0)}`,
      alignment: 'right',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.status || 'PENDING'}`,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: _.map(row?.expenses_list || [], (it, i) => {
        const budgetCode = `${it?.budget?.prefix || ''}${it?.budget?.budget_number || ''}`.trim();
        const proj = (it?.project?.project_number || '').trim();
        const left = [proj, budgetCode].filter(Boolean).join(' ');
        const label = left ? `${left} — ${it?.name || ''}` : `${it?.name || ''}`;
        const raw =
          it?.net_price != null
            ? it.net_price
            : (it?.price || 0) - (it?.withholding_tax || 0);
        const net = Number.isFinite(raw) ? raw : 0;
        return `${i + 1}. ${label} (${formatMoney(net)})`;
      }).join('\n'),
      fontSize: 7,
      border: [false, false, false, false],
    },
  ]);
};

// Signature ให้เหมือน expensesReport: (result, info)
const paymentDailyReport = async (result, info) => {
  const rows = result?.rows || [];
  const body = genBody(rows);
  const total = _.sumBy(rows, (r) => Number(r?.totalAmount) || 0);
  const totalFormatted = formatMoney(total);

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [15, 90, 15, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 10,
    },
    info: {
      title: 'Payment Daily Report',
      author: info?.name || '',
      subject: 'Payment Daily Report',
    },
    header: [
      {
        margin: [20, 15, 20, 0],
        stack: [
          {
            text: 'รายงานการจ่ายเงินประจำวัน',
            style: 'headerTitle',
            alignment: 'center',
          },
          {
            text: `${info?.name || ''}`,
            style: 'headerCompany',
            alignment: 'center',
            margin: [0, 4, 0, 0],
          },
          {
            columns: [
              {
                text: `วันที่: ${info?.date ? dayjs(info.date).format('DD/MM/YYYY') : '-'}`,
                style: 'headerDate',
                width: 'auto',
              },
              {
                text: `ยอดรวม: ${totalFormatted} บาท`,
                style: 'headerTotal',
                width: '*',
                alignment: 'right',
              },
            ],
            margin: [0, 10, 0, 0],
          },
        ],
      },
    ],
    content: [
      {
        table: {
          headerRows: 1,
          // ใช้ fixed + * เพื่อให้ตารางเต็มหน้าเสมอ
          widths: [22, 70, 120, 130, 55, 85, 60, '*'],
          body: [
            [
              {
                text: 'ลำดับ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'เลขที่เอกสาร',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ผู้รับเงิน',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'เลขบัญชี/ธนาคาร',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'จำนวนรายการ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ยอดรวม',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'สถานะ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'รายละเอียดรายการย่อย',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
            ],
            ...body,
            [
              {
                text: 'รวมเงินทั้งหมด',
                fillColor: '#d2d4d2',
                alignment: 'center',
                colSpan: 5,
                border: [false, false, false, true],
              },
              {},
              {},
              {},
              {},
              {
                text: totalFormatted,
                alignment: 'right',
                border: [false, false, false, true],
                bold: true,
              },
              {},
              {},
            ],
          ],
        },
      },
    ],
    footer: function (currentPage, pageCount) {
      return {
        margin: [20, 0],
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              {
                text: `พิมพ์เมื่อ: ${dayjs().format('DD/MM/YYYY HH:mm')} น.`,
                fontSize: 8,
                alignment: 'left',
                border: [false, false, false, false],
              },
              {
                text: `หน้า ${currentPage} / ${pageCount}`,
                alignment: 'right',
                fontSize: 8,
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
      };
    },
    styles: {
      headerTitle: {
        fontSize: 16,
        bold: true,
        color: '#1a1a1a',
      },
      headerCompany: {
        fontSize: 12,
        bold: true,
        color: '#333333',
      },
      headerDate: {
        fontSize: 16,
        color: '#1A1A1A',
      },
      headerTotal: {
        fontSize: 18,
        bold: true,
        color: '#d32f2f',
      },
    },
  };

  pdfMake.createPdf(documentRef).open();
};

export default paymentDailyReport;

