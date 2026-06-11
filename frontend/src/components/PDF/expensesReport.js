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

const genBody = (rows) => {
  const productList = _.map(rows, (row, index) => [
    {
      text: index + 1,
      alignment: 'center',
      border: [false, false, false, false],
    },
    {
      text: `${row?.code || ''}`,
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: row?.expenses_type === 'REFUND' ? 'เบิกคืน' : 'เบิกเพื่อจ่าย',
      alignment: 'center',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.employee?.firstname || ''} ${
        row?.employee?.lastname || ''
      }`,
      fontSize: 8,
      alignment: 'center',
      border: [false, false, false, false],
    },
    {
      text: [{ text: row?.payee?.name || '' }],
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
      text: (row?.budget?.prefix || '') + (row?.budget?.budget_number || ''),
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: row?.project?.project_number || '',
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${row?.name || ''}`,
      fontSize: 8,
      border: [false, false, false, false],
    },
    {
      text: `${
        (row?.net_price ?? (row?.price || 0) - (row?.withholding_tax || 0))
          ?.toFixed(2)
          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || ''
      }`,
      alignment: 'right',
      fontSize: 8,
      border: [false, false, false, false],
    },
  ]);

  return productList;
};

const expensesReport = async (row, info) => {
  // eslint-disable-next-line global-require
  // console.log('rows pdf', info);

  const getNetPrice = (r) =>
    r?.net_price ?? (r?.price || 0) - (r?.withholding_tax || 0);
  const genItemBody = genBody(row?.rows);
  const total = _.sumBy(row?.rows, getNetPrice);
  const totalFormatted = total?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,');

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [15, 90, 15, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: '10',
    },
    info: {
      title: 'Expenses Report',
      author: info?.name || '',
      subject: 'Expenses Report',
    },
    header: [
      {
        margin: [20, 15, 20, 0],
        stack: [
          {
            text: 'รายงานการเบิกจ่ายประจำวัน',
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
                text: `วันที่: ${dayjs(info?.date).format('DD/MM/YYYY')}`,
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
          alignment: '',
          headerRows: 1,
          widths: [
            '4%',
            '9%',
            'auto',
            '10%',
            '10%',
            '10%',
            'auto',
            'auto',
            '*',
            '10%',
          ],
          body: [
            [
              {
                text: 'ลำดับ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'รหัส',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ประเภท',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ผู้เบิก',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'จ่ายให้',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'เลขบัญชี',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'รหัสงบประมาณ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'job',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'รายการ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
              {
                text: 'ยอดจ่ายจริง',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [false, false, false, true],
              },
            ],
            ...genItemBody,
            [
              {
                text: 'รวมเงินทั้งหมด',
                fillColor: '#d2d4d2',
                alignment: 'center',
                colSpan: 9,
                border: [false, false, false, true],
              },
              {},
              {},
              {},
              {},
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
      headerPage: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
      },
      subHeader: {
        fontSize: 10,
        alignment: 'center',
        margin: [0, 5, 0, 0],
      },
      header: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
      },
      header1: {
        fontSize: 11,
        bold: true,
        alignment: 'center',
      },
      header2: {
        alignment: 'right',
      },
    },
  };

  pdfMake.createPdf(documentRef).open();
};

export default expensesReport;
