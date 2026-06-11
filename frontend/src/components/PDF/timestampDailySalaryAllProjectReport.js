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

const fmt = (v) =>
  Number(v || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,');

const genBody = (employees = []) =>
  _.map(employees, (row, index) => [
    { text: index + 1, alignment: 'center' },
    {
      text: [{ text: row?.name || '-' }],
      alignment: 'left',
    },
    {
      text: `${row?.role || ''}`,
      alignment: 'center',
    },
    {
      text: row?.checkIn ? dayjs(row.checkIn).format('HH:mm') : '-',
      alignment: 'center',
    },
    {
      text: row?.checkOut ? dayjs(row.checkOut).format('HH:mm') : '-',
      alignment: 'center',
    },
    {
      text: `${row?.ot_show ?? ''}`,
      alignment: 'center',
    },
    {
      text: `${fmt(row?.salary_per_day)}`,
      alignment: 'right',
    },
    {
      text: `${fmt(row?.allowance)}`,
      alignment: 'right',
    },
    {
      text: `${fmt(row?.total)}`,
      alignment: 'right',
    },
  ]);

const timestampDailySalaryAllProjectReport = async (data) => {
  // data is expected to have { date, rows: [ { project_number, project_name, employees: [...] , totalLabor, totalSalaryHr, totalRecords, totalLabor, totalSalaryHr } ] }
  const totalPersons = _.sumBy(data?.rows, (t) => t?.employees?.length || 0);
  const totalLabor = _.sumBy(data?.rows, (t) => Number(t?.totalLabor || 0));
  const totalSalaryHr = _.sumBy(data?.rows, (t) =>
    Number(t?.totalSalaryHr || 0),
  );

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [20, 100, 20, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 12,
    },
    info: {
      title: 'Timestamp Report',
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
                text: `${dayjs(data?.date).format('DD/MM/YYYY')}`,
                colSpan: 3,
                border: [false, false, false, false],
              },
              {},
              {},
            ],
            [
              {
                text: `Total`,
                colSpan: 1,
                border: [false, false, false, false],
              },
              {
                text: `${totalPersons} Person  Estimate ${fmt(
                  totalLabor,
                )} Bath/day   ${fmt(totalSalaryHr)} Bath/hour OT`,
                colSpan: 3,
                border: [false, false, false, false],
              },
              {},
              {},
            ],
          ],
        },
      },
    ],
    content: _.flatMap(data?.rows || [], (projectRow) => {
      const employees = projectRow?.employees || [];
      return [
        {
          table: {
            alignment: '',
            headerRows: 2,
            widths: ['8%', '18%', '18%', '8%', '8%', '8%', '*', '*', '*'],
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
                  text: `${projectRow?.project_number || ''} | ${
                    projectRow?.project_name || ''
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
              // employee rows
              ...genBody(employees),
              // project total row
              [
                {
                  text: `Total `,
                  fillColor: '#d2d4d2',
                  colSpan: 2,
                  alignment: 'right',
                  border: [true, true, true, true],
                },
                {},
                {
                  text: `${employees.length} Person`,
                  fillColor: '',
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                {
                  text: '',
                  colSpan: 6,
                  fillColor: '',
                  alignment: 'right',
                  border: [true, true, true, true],
                },
                {},
                {},
                {},
                {},
                {},
              ],
            ],
          },
        },
        { text: ' ', margin: [0, 4] },
      ];
    }),
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
export default timestampDailySalaryAllProjectReport;
