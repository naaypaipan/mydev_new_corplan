import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs, { Dayjs } from 'dayjs';

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

// Format number to currency
const formatCurrency = (number) => {
  return number?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0.00';
};

// Generate table body rows
const genBody = (rows) => {
  return _.map(rows, (row, index) => [
    { text: index + 1, alignment: 'center' },
    {
      text: [{ text: row?.name || '' }, ,],
    },
    // วันทำงาน
    { text: `${row.totalWork || 0} วัน`, alignment: 'center' },
    // ค่าแรง
    { text: formatCurrency(row?.revenue?.salary || 0), alignment: 'right' },
    // โอที
    { text: formatCurrency(row?.revenue?.overtime || 0), alignment: 'right' },
    // เบี้ยเลี้ยง
    { text: formatCurrency(row?.revenue?.allowances || 0), alignment: 'right' },
    // โบนัส
    { text: formatCurrency(row?.revenue?.bonus || 0), alignment: 'right' },
    // หักภาษี
    {
      text: row.expenses?.tax ? `${formatCurrency(row.expenses?.tax)}` : 0,
      alignment: 'right',
    },
    // ประกันสังคม
    {
      text: row.expenses?.sso ? `${formatCurrency(row.expenses?.sso)}` : 0,
      alignment: 'right',
    },
    // หักสาย
    {
      text: row.expenses?.late ? `${formatCurrency(row.expenses?.late)}` : 0,
      alignment: 'right',
    },
    // หักอื่นๆ
    {
      text: row.expenses?.other ? `${formatCurrency(row.expenses?.other)}` : 0,
      alignment: 'right',
    },
    // สุทธิ
    { text: formatCurrency(row?.total || 0), alignment: 'right', bold: true },
    // หมายเหตุ
    { text: row?.note || '-', alignment: 'left' },
  ]);
};

// Generate Dashboard Body
const genDashboardBody = (rows) => {
  return _.map(rows, (row, index) => [
    {
      text: row?.project_number || row?.project_name || 'ไม่ระบุโครงการ',
      alignment: 'left',
    },
    { text: formatCurrency(row?.total_salary || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_ot || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_sso || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_late || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_tax || 0), alignment: 'right' },
    { text: formatCurrency(row?.amount || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_allowance || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_bonus || 0), alignment: 'right' },
    { text: formatCurrency(row?.total_spent || 0), alignment: 'right' },
  ]);
};

// ปรับหัวตาราง
const tableHeader = [
  {
    text: 'ลำดับ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'พนักงาน',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'วันทำงาน',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'ค่าแรง',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'โอที',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'เบี้ยเลี้ยง',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'เงินได้อื่นๆ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'หักภาษี',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'ประกันสังคม',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'หักสาย',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'หักอื่นๆ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'สุทธิ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'หมายเหตุ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
];

const dashboardSuperHeader = [
  {
    text: 'สรุปค่าแรงและค่าใช้จ่ายตามโครงการ',
    colSpan: 10,
    alignment: 'center',

    bold: true,
  },
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
];

const dashboardHeader = [
  {
    text: 'โครงการ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'ค่าแรง',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'OT',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'ปกส.',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'หักสาย',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'ภาษี/อื่นๆ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'สุทธิ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'เบี้ยเลี้ยง',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'เงินได้อื่นๆ',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
  {
    text: 'จ่ายจริง',
    fillColor: '#e0e0e0',
    color: 'black',
    alignment: 'center',
    bold: true,
    border: [true, true, true, true],
  },
];

const payrollReport = async (data) => {
  // Format month and year for the header
  const monthYear = dayjs(data?.dateStart).format('MMMM BBBB');

  const genItemBody = genBody(data?.salaryData || []);
  const genDashboardItemBody = genDashboardBody(data?.dashboard || []);

  // Calculate Totals for each column
  const totalSalary = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.revenue?.salary || 0),
  );
  const totalOvertime = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.revenue?.overtime || 0),
  );
  const totalAllowance = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.revenue?.allowances || 0),
  );
  const totalBonus = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.revenue?.bonus || 0),
  );
  const totalTax = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.expenses?.tax || 0),
  );
  const totalSSO = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.expenses?.sso || 0),
  );
  const totalLate = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.expenses?.late || 0),
  );
  const totalOther = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.expenses?.other || 0),
  );
  const totalNet = _.sumBy(data?.salaryData, (item) =>
    parseFloat(item?.total || 0),
  );

  // Calculate Global Cost Summary
  const totalEmployerSSO = totalSSO; // สมมติว่านายจ้างสมทบเท่ากับลูกจ้าง
  const totalGrandCost = totalNet + totalSSO + totalEmployerSSO;

  // Calculate Dashboard Totals
  const totalDashboardSalary = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_salary || 0),
  );
  const totalDashboardOT = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_ot || 0),
  );
  const totalDashboardSSO = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_sso || 0),
  );
  const totalDashboardLate = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_late || 0),
  );
  const totalDashboardTax = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_tax || 0),
  );
  const totalDashboardAmount = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.amount || 0),
  );
  const totalDashboardAllowance = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_allowance || 0),
  );
  const totalDashboardBonus = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_bonus || 0),
  );
  const totalDashboardSpent = _.sumBy(data?.dashboard, (item) =>
    parseFloat(item?.total_spent || 0),
  );

  // Create Summary Row
  const summaryRow = [
    {
      text: 'รวมทั้งสิ้น',
      colSpan: 3,
      alignment: 'center',
      bold: true,
      fillColor: '#eeeeee',
    },
    {}, // Placeholder for colSpan
    {}, // Placeholder for colSpan
    {
      text: formatCurrency(totalSalary),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalOvertime),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalAllowance),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalBonus),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalTax),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalSSO),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalLate),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalOther),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    {
      text: formatCurrency(totalNet),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
    },
    { text: '', alignment: 'left' },
  ];

  // Simplified Summary Table (Only 3 items)
  const simpleSummaryHeader = [
    {
      text: 'รายการ',
      fillColor: '#e0e0e0',
      color: 'black',
      alignment: 'center',
      bold: true,
    },
    {
      text: 'จำนวนเงิน',
      fillColor: '#e0e0e0',
      color: 'black',
      alignment: 'center',
      bold: true,
    },
  ];

  const simpleSummaryData = [
    [
      { text: 'ยอดจ่ายสุทธิ (Net Pay)', alignment: 'left', bold: true },
      { text: formatCurrency(totalNet), alignment: 'right', bold: true },
    ],
    [
      { text: 'ประกันสังคม (ลูกจ้าง)', alignment: 'left' },
      { text: formatCurrency(totalSSO), alignment: 'right' },
    ],
    [
      { text: 'ประกันสังคม (นายจ้างสมทบ)', alignment: 'left' },
      { text: formatCurrency(totalEmployerSSO), alignment: 'right' },
    ],
    [
      {
        text: 'รวมทั้งสิ้น',
        alignment: 'left',
        bold: true,
        fillColor: '#e0e0e0',
      },
      {
        text: formatCurrency(totalGrandCost),
        alignment: 'right',
        bold: true,
        fillColor: '#e0e0e0',
        color: 'black',
      },
    ],
  ];

  // Create Dashboard Summary Row
  const dashboardSummaryRow = [
    {
      text: 'รวมทั้งหมด',
      alignment: 'center',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardSalary),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardOT),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardSSO),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardLate),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardTax),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardAmount),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardAllowance),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardBonus),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
    {
      text: formatCurrency(totalDashboardSpent),
      alignment: 'right',
      bold: true,
      fillColor: '#eeeeee',
      color: 'black',
    },
  ];

  const documentRef = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [10, 80, 10, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 10,
    },
    info: {
      title: 'รายงานการจ่ายค่าแรงประจำเดือน',
      subject: monthYear,
      author: 'MNS System',
    },
    header: function () {
      return {
        margin: [0, 12],
        columns: [
          {
            width: '*',
            text: [
              {
                text: 'รายงานการจ่ายค่าแรงประจำเดือน ',
                style: 'headerPage',
              },
              { text: monthYear, style: 'headerPage' },
            ],
            alignment: 'center',
            border: [false, false, false, false],
          },
        ],
      };
    },
    content: [
      {
        text:
          'ช่วงวันที่ ' +
          `${dayjs(data?.dateStart).format('DD/MM/BBBB')} - ${dayjs(
            data?.dateEnd,
          ).format('DD/MM/BBBB')}`,
        margin: [0, 0, 0, 4],
      },
      {
        text:
          'ประเภท ' +
          `${
            data?.role_type === 'DAILY' ? 'พนักงานรายวัน' : 'พนักงานรายเดือน'
          }`,
        margin: [0, 0, 0, 4],
      },
      {
        table: {
          alignment: '',
          headerRows: 1,
          widths: [
            '5%', // ลำดับ
            'auto', // พนักงาน (ปรับให้เล็กลง)
            '7%', // วันทำงาน
            '10%', // ค่าแรง
            '7%', // โอที
            '8%', // เบี้ยเลี้ยง
            '7%', // โบนัส
            '8%', // หักภาษี
            '9%', // ประกันสังคม
            '7%', // หักสาย
            '6%', // หักอื่นๆ
            '8%', // สุทธิ
            '*', // หมายเหตุ (เพิ่มให้กว้างขึ้น)
          ],
          body: [tableHeader, ...genItemBody, summaryRow], // Add summaryRow back
        },
      },

      // Add Simplified Summary Table
      {
        text: 'สรุปยอดรวม',
        style: 'header',
        margin: [0, 20, 0, 5],
        bold: true,
        fontSize: 12,
      },
      {
        table: {
          widths: ['20%', '30%'],
          headerRows: 1,
          body: [simpleSummaryHeader, ...simpleSummaryData],
        },
        // filepath: c:\Users\User\Desktop\my_dev\mydev_MNS\frontend\src\components\PDF\payrollReport.js
      },

      // Dashboard Section (Project Cost)
      data?.dashboard && data.dashboard.length > 0
        ? [
            {
              text: 'สรุปค่าใช้จ่ายตามโครงการ',
              style: 'header',
              margin: [0, 20, 0, 5],
              bold: true,
              fontSize: 12,
            },
            {
              table: {
                widths: [
                  '16%',
                  '10%',
                  '10%',
                  '6%',
                  '8%',
                  '11%',
                  '11%',
                  '9%',
                  '9%',
                  '10%',
                ],
                headerRows: 2,
                body: [
                  dashboardSuperHeader,
                  dashboardHeader,
                  ...genDashboardItemBody,
                  dashboardSummaryRow,
                ],
              },
            },
          ]
        : [],
    ],

    footer: function (currentPage, pageCount) {
      return {
        columns: [
          {
            text: 'เอกสารใช้ภายในบริษัทเท่านั้น',
            alignment: 'left',
            fontSize: 8,
            margin: [10, 0, 0, 0],
          },
          {
            text: 'หน้า ' + currentPage.toString() + ' จาก ' + pageCount,
            alignment: 'right',
            fontSize: 8,
            margin: [0, 0, 10, 0],
          },
        ],
      };
    },

    styles: {
      headerPage: {
        fontSize: 16,
        bold: true,
        alignment: 'center',
      },
    },
  };

  pdfMake.createPdf(documentRef).open();
};

export default payrollReport;
