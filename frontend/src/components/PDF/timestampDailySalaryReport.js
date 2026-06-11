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
    { text: index + 1, alignment: 'center' },
    {
      text: [
        { text: row?.employee?.firstname },
        { text: '\t' },
        { text: row?.employee?.lastname },
      ],
    },
    { text: `${row?.department?.name || ''}`, alignment: 'center' },

    {
      text: `${dayjs(row?.checkIn).format('HH:mm')}`,
      alignment: 'center',
    },
    {
      text: `${row?.checkOut ? dayjs(row?.checkOut).format('HH:mm') : ''}`,
      alignment: 'center',
    },
    {
      text: [{ text: `${row?.normal_time}` }],
      alignment: 'center',
    },
    {
      text: [{ text: `${row?.ot_show}` }],
      alignment: 'center',
    },
    {
      text: `${
        row?.priceLabor?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
      }`,
      alignment: 'right',
    },
    {
      text: `${
        row?.salary_extra?.day
          ?.toFixed(2)
          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
      }`,
      alignment: 'right',
    },
    {
      text: `${
        row?.totalPrice?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
      }`,
      alignment: 'right',
    },
  ]);

  return productList;
};

const timestampDailySalaryReport = async (row) => {
  // eslint-disable-next-line global-require

  const genItemBody = genBody(row?.rows);
  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'LandScape',
    pageMargins: [20, 80, 20, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: '12',
    },
    info: {
      title: 'report ',
    },
    header: [
      {
        margin: [0, 12],
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['100%'],
          body: [
            [
              {
                text: 'Timestamp Report',
                style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
          ],
        },
      },
      {
        margin: [6, 4],
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['10%', '70%', '10%', '10%'],
          body: [
            [
              {
                text: 'Project : ',
                margin: [8, 0],
                alignment: 'right',
                border: [false, false, false, false],
              },
              {
                text: row?.project?.name || '',

                border: [false, false, false, false],
              },
              {
                text: 'Date',
                alignment: 'right',
                border: [false, false, false, false],
              },
              {
                text: `${dayjs(row?.date)?.format('DD/MM/YYYY')}`,

                border: [false, false, false, false],
              },
            ],
          ],
        },
      },
    ],
    content: [
      {
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['8%', '18%', '18%', '8%', '8%', '4%', '4%', '*', '*', '*'],
          body: [
            [
              {
                text: 'ลำดับ.',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'ชื่อ-นามสกุล',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'ตำแหน่ง',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },

              {
                text: 'เข้า',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'ออก',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'ปกติ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'OT',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'ค่าแรง',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'เบี้ยเลี้ยง',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'รวม',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
            ],
            ...genItemBody,
            [
              {
                text: 'รวม',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
                colSpan: 7,
              },
              {},
              {},

              {},
              {},
              {},
              {},
              {
                text: `${
                  row?.totalLabor
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
                }`,
                fillColor: '#d2d4d2',
                alignment: 'right',
                border: [true, true, true, true],
              },
              {
                text: `${
                  row?.totalpriceExtra
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
                }`,
                fillColor: '#d2d4d2',
                alignment: 'right',
                border: [true, true, true, true],
              },
              {
                text: `${
                  row?.allPrice
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0
                }`,
                fillColor: '#d2d4d2',
                alignment: 'right',
                border: [true, true, true, true],
              },
            ],
          ],
        },
      },

      {},
      {
        // margin: [0, 12],
      },
    ],

    footer: [],

    styles: {
      headerPage: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
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
export default timestampDailySalaryReport;
