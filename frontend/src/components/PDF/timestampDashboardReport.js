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
    { text: `${row?.project_number || ''}`, alignment: 'center' },
    { text: `${row?.project_name || ''}`, alignment: 'center' },
    {
      text: `${
        row?.total_salary?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,') ||
        '0.00'
      }`,
      alignment: 'right',
    },
    {
      text: `${
        row?.total_ot?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0.00'
      }`,
      alignment: 'right',
    },
    {
      text: `${
        ((row?.total_ot || 0) + (row?.total_salary || 0))
          ?.toFixed(2)
          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0.00'
      }`,
      alignment: 'right',
    },
  ]);
  return productList;
};

const timestampDashboardReport = async (row, dateStart, me) => {
  const genItemBody = genBody(row?.rows);

  // แปลงวันที่ให้อยู่ในรูปแบบไทย
  const formatDate = (d) => (d ? dayjs(d).format('DD/MM/BBBB') : '-');

  const dateRangeText =
    dateStart && dateStart[0] && dateStart[1]
      ? `วันที่ ${formatDate(dateStart[0])} - ${formatDate(dateStart[1])}`
      : '';

  const printBy =
    me?.userData?.firstname || me?.userData?.lastname
      ? `ผู้สั่งพิมพ์: ${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`
      : '';

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [20, 90, 20, 40],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 12,
    },
    info: {
      title: 'Estimate Labor Report',
    },
    header: [
      {
        margin: [20, 12],
        table: {
          widths: ['100%'],
          body: [
            [
              {
                text: 'Estimate Labor Report',
                style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
            [
              {
                text: dateRangeText,

                border: [false, false, false, false],
                margin: [0, 2, 0, 0],
              },
            ],
            [
              {
                text: printBy,

                border: [false, false, false, false],
                margin: [0, 2, 0, 0],
              },
            ],
          ],
        },
      },
    ],
    content: [
      {
        table: {
          headerRows: 1,
          widths: ['6%', '18%', '32%', '14%', '14%', '16%'],
          body: [
            [
              {
                text: 'ลำดับ',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Project ID',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Project Name',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Estimated Labor Cost',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Estimated OT Cost',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Estimated Total Cost',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
            ],
            ...genItemBody,
          ],
        },
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? '#d2d4d2' : null;
          },
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
              {
                text: `print date ${dayjs().format('DD/MM/BBBB HH:mm:ss')}`,
                alignment: 'right',
                fontSize: 10,
                border: [false, false, false, false],
              },
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
        fontSize: 16,
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
export default timestampDashboardReport;
