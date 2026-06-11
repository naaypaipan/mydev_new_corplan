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
    { text: `${row?.project_in?.name || ''}`, alignment: 'center' },
    {
      text: `${dayjs(row?.checkIn).format('DD/MM/YYYY')}`,
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
      text: [
        {
          text: `${
            row?.otRequests?.startTime
              ? dayjs(row?.otRequests?.startTime).format('HH:mm')
              : ''
          }`,
        },
      ],
      alignment: 'center',
    },
    {
      text: [
        {
          text: `${
            row?.otRequests?.endTime
              ? dayjs(row?.otRequests?.endTime).format('HH:mm')
              : ''
          }`,
        },
      ],
      alignment: 'center',
    },
    {},
  ]);

  return productList;
};

const timestampReport = async (row) => {
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
    ],
    content: [
      {
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['8%', '18%', '28%', '10%', '6%', '6%', '6%', '6%', '8%'],
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
                text: 'โครงการ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'วันที่',
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
                text: 'OT เข้า',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'OT ออก',
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
            ...genItemBody,
          ],
        },
      },

      {},
      {
        // margin: [0, 12],
      },
    ],

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
export default timestampReport;
