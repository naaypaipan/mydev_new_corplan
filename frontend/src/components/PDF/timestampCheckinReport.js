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
  const productList = _.map(rows?.timesTampData, (row, index) => [
    { text: index + 1, alignment: 'center' },
    {
      text: [
        { text: row?.employeeDetails?.firstname },
        { text: '\t' },
        { text: row?.employeeDetails?.lastname },
      ],
    },
    {
      text: `${dayjs(row?.checkIn).format('HH:mm')}`,
      alignment: 'center',
    },
    { text: `${row?.salary?.day || 0.0}`, alignment: 'right' },
  ]);

  return productList;
};

const timestampCheckinReport = async (row) => {
  // eslint-disable-next-line global-require

  const genItemBody = genBody(row?.rows);
  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'Portrait',
    pageMargins: [20, 90, 20, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: '12',
    },
    info: {
      title: 'Daily Report ',
    },
    header: [
      {
        margin: [20, 16],
        table: {
          alignment: '',
          headerRows: 1,
          widths: ['100%'],
          body: [
            [
              {
                text: 'Daily Report',
                style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
            [
              {
                text: `Date: ${dayjs(row?.date).format('DD/MM/YYYY')}`,
                // style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
            [
              {
                text: `Total ${_?.sumBy(
                  row?.rows,
                  (t) => t?.totalRecords,
                )} Person  Estimate ${_?.sumBy(row?.rows, (t) => t?.totalLabor)
                  ?.toFixed(2)
                  ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')} Bath/day   ${
                  _?.sumBy(row?.rows, (t) => t?.totalSalaryHr) *
                  1.5?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                } Barth/hour OT `,
                // style: 'headerPage',
                border: [false, false, false, false],
              },
            ],
          ],
        },
      },
    ],
    content: _?.map(row?.rows, (row, index) => [
      {
        table: {
          margin: [0, 0, 0, 4],
          headerRows: 2,
          widths: ['8%', '*', '28%', '*'],
          body: [
            [
              {
                text: 'Project',
                fillColor: '#d2d4d2',
                alignment: 'right',
                border: [true, true, true, true],
              },
              {
                text: `${row?.projectDetails?.project_number || ''} | ${
                  row?.projectDetails?.name || ''
                }`,
                colSpan: 3,
                border: [true, true, true, true],
              },
              {},
              {},
            ],
            [
              {
                text: 'No.',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Name',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Check In',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: 'Cost',
                fillColor: '#d2d4d2',
                alignment: 'center',
                border: [true, true, true, true],
              },
            ],
            ...genBody(row),
            [
              {
                text: `Total ${row?.timesTampData?.length} Person`,
                fillColor: '',
                colSpan: 2,
                alignment: 'right',
                border: [true, true, true, true],
              },
              {
                text: '',
                fillColor: '',
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: `Estimate ${_?.sumBy(
                  row?.timesTampData,
                  (t) => t?.salary?.day,
                )
                  ?.toFixed(2)
                  ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')} Bath/day\n${
                  _?.sumBy(row?.timesTampData, (t) => t?.salary?.hr) *
                  1.5?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')
                }Bath/hr OT`,

                fillColor: '',
                colSpan: 2,
                alignment: 'right',
                border: [true, true, true, true],
              },

              {
                text: '',
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
export default timestampCheckinReport;
