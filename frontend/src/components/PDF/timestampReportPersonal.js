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

    { text: `${row?.projectDetails?.name || ''}`, alignment: 'center' },
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
      text: [{ text: `${row?.normal_time}` }],
      alignment: 'center',
    },
    {
      text: [{ text: `${row?.ot_show}` }],
      alignment: 'center',
    },
    {
      text: '',
      alignment: 'right',
    },
    {},
  ]);

  return productList;
};

const timestampReportPersonal = async (row) => {
  // eslint-disable-next-line global-require

  const genItemBody = genBody(row?.timesTampData);
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
                text: 'Times Sheet Report',
                style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
          ],
        },
      },
    ],
    content: _.map(row, (e) => [
      {
        margin: [6, 4],
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['auto', '20%', 'auto', '*'],
          body: [
            [
              {
                text: 'name : ',
                margin: [8, 0],
                alignment: 'right',
                border: [false, false, false, false],
              },
              {
                text: `${e?.employeeDetails?.firstname} ${e?.employeeDetails?.lastname}`,

                border: [false, false, false, false],
              },
              {
                text: 'position',
                alignment: 'right',
                border: [false, false, false, false],
              },
              {
                text: ``,

                border: [false, false, false, false],
              },
            ],
          ],
        },
      },
      {
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['8%', '30%', '15%', '*', '*', '*', '*', '*', '*'],
          body: [
            [
              {
                text: 'ลำดับ.',
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
            ...genBody(e?.timesTampData),
          ],
        },
      },

      {
        text: '',
        pageOrientation: 'landscape',
        pageBreak: 'before',
      },
    ]),

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
export default timestampReportPersonal;
