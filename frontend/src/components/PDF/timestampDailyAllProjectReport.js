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
  const productList = _.map(rows?.employees, (row, index) => [
    { text: index + 1, alignment: 'center' },
    {
      text: [{ text: row?.name }],
    },
    {
      text: `${row?.role || ''}`,
      alignment: 'center',
    },

    {
      text: `${dayjs(row?.checkIn).format('HH:mm')}`,
      alignment: 'center',
    },
    {
      text: `${row?.checkOut ? dayjs(row?.checkOut).format('HH:mm') : ''}`,
      alignment: 'center',
    },
    {
      text: [{ text: `` }],
      alignment: 'center',
    },
    {
      text: [{ text: `` }],
      alignment: 'center',
    },
    {
      text: ``,
      alignment: 'right',
    },
    {},
  ]);

  return productList;
};

const timestampDailyAllProjectReport = async (row) => {
  // eslint-disable-next-line global-require

  // const genItemBody = genBody(row?.rows);
  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'LandScape',
    pageMargins: [20, 100, 20, 60],
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
        margin: [20, 4],
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['auto', '70%', '10%', '10%'],
          body: [
            [
              {
                text: 'Date',
                alignment: 'right',

                border: [false, false, false, false],
              },
              {
                text: `${dayjs(row?.date)?.format('DD/MM/YYYY')}`,
                colSpan: 3,
                border: [false, false, false, false],
              },
              {},
              {},
            ],
            [
              {
                text: `  `,
                // style: 'headerPage',
                colSpan: 4,
                border: [false, false, false, false],
              },
              {
                text: ``,
                fillColor: '',
                alignment: 'center',
                border: [false, false, false, false],
              },
              {},
              {},
            ],
          ],
        },
      },
    ],
    content: _?.map(row?.rows, (row) => [
      {
        table: {
          alignment: '',
          headerRows: 2,
          widths: ['8%', '18%', '18%', '8%', '8%', '8%', '8%', '*', '*'],
          body: [
            [
              {
                text: 'Project',
                fillColor: '#d2d4d2',
                alignment: 'right',
                colSpan: 1,
                border: [true, true, true, true],
              },
              {
                text: `${row?.project_number || ''} | ${
                  row?.project_name || ''
                }`,
                colSpan: 8,
                border: [true, true, true, true],
              },
              {},

              {},
              {},
              {},
              {},
              {},
              {},
            ],
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
                text: '',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
            ],
            ...genBody(row),
            [
              {
                text: `Total `,
                fillColor: '#d2d4d2',
                colSpan: 8,
                alignment: 'right',
                border: [true, true, true, true],
              },
              {},

              {},

              {},

              {},
              {},
              {},
              {},
              {
                text: `${row?.employees?.length} Person`,
                fillColor: '',
                alignment: 'center',
                border: [true, true, true, true],
              },
            ],
          ],
        },
      },

      {},
      { text: ' ', margin: [0, 4] },
    ]),

    footer: function (currentPage, pageCount) {
      return {
        margin: [20, 0],
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              '',
              {
                text: `page ${currentPage} / ${pageCount}`,
                alignment: 'right',
                fontSize: 10,
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
      };
    },

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
export default timestampDailyAllProjectReport;
