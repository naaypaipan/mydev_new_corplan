import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import dayjs from 'dayjs';
pdfMake.fonts = {
  Sarabun: {
    normal: 'Sarabun-Light.ttf',
    bold: 'Sarabun-Regular.ttf',
    italics: 'Sarabun-LightItalic.ttf',
    bolditalics: 'Sarabun-Italic.ttf',
  },
};

const timeStampMontlyReport = (
  info,
  timestamp,
  days,
  month,
  year,
  dateStart,
) => {
  // console.log('timestamp pdf', info);

  const tableBody = [
    [
      {
        text: 'No.',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'center',
      },
      {
        text: 'Name',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'left',
      },
      {
        text: 'Type',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'center',
      },
      ...days.map((day) => {
        const date = dayjs(`${year}-${month + 1}-${day}`);
        const isWeekend = date.day() === 0 || date.day() === 6;
        return {
          text: day.toString(),
          style: 'tableHeader',
          fillColor: isWeekend ? '#ffb3b3' : '#e6e6e6',
          alignment: 'center',
          fontSize: 6,
        };
      }),
      {
        text: 'Working',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'center',
      },
      {
        text: 'Day Rate',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'right',
      },
      {
        text: 'ค่าแรง',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'right',
      },
      {
        text: 'OT',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'right',
      },
      {
        text: 'Amount',
        style: 'tableHeader',
        fillColor: '#d2d4d2',
        alignment: 'right',
      },
    ],
  ];

  timestamp?.rows?.forEach((employee, idx) => {
    tableBody.push([
      {
        text: idx + 1,
        rowSpan: 2,
        alignment: 'center',
        style: 'tableBody',
        margin: [0, 2, 0, 2],
      },
      {
        text: `${employee?.name}`,
        rowSpan: 2,
        alignment: 'left',
        style: 'tableBody',
        margin: [1, 2, 0, 2],
      },
      { text: 'ปกติ', alignment: 'center', style: 'tableBody', color: '#333' },
      ...days.map((day) => {
        const foundData = employee.checkins?.find(
          (e) =>
            dayjs(e?.checkIn).format('D/M/YY') ===
            `${day}/${month + 1}/${year % 100}`,
        );
        return {
          text: (foundData?.totalHour * foundData?.rate || 1)?.toFixed(1) || '',
          alignment: 'center',
          style: 'tableBody',
          color: foundData?.totalHour ? '#1976d2' : '#bbb',
          margin: [0, 2, 0, 2],
          fontSize: 6,
        };
      }),
      {
        text: employee?.totalWork?.toFixed(1) || '-',
        alignment: 'center',
        style: 'tableBody',
        color: '#1976d2',
        margin: [0, 2, 0, 2],
      },
      {
        text: employee?.salary_per_day?.toFixed(2) || '-',
        rowSpan: 2,
        style: 'tableBody',
        alignment: 'right',
        margin: [0, 4, 0, 4],
      },
      {
        text: employee?.totalAmount?.toFixed(2) || '0.00',
        rowSpan: 2,
        style: 'tableBody',
        alignment: 'right',
        margin: [0, 4, 0, 4],
      },
      {
        text: employee?.totalOtAmount?.toFixed(2) || '0.00',
        rowSpan: 2,
        style: 'tableBody',
        alignment: 'right',
        margin: [0, 2, 1, 2],
        color: '#d32f2f',
      },
      {
        text:
          (employee?.totalAmount + employee?.totalOtAmount)?.toFixed(2) || '-',
        style: 'tableBody',
        alignment: 'right',
        rowSpan: 2,
        margin: [0, 2, 1, 2],
        bold: true,
      },
    ]);
    tableBody.push([
      {}, // Placeholder for No.
      {}, // Placeholder for Name
      { text: 'OT', alignment: 'center', style: 'tableBody', color: '#d32f2f' },
      ...days.map((day) => {
        const foundData = employee.checkins?.find(
          (e) =>
            dayjs(e?.checkIn).format('D/M/YY') ===
            `${day}/${month + 1}/${year % 100}`,
        );
        return {
          text: foundData?.otRequests?.total_hours?.toFixed(1) || '',
          alignment: 'center',
          style: 'tableBody',
          color: foundData?.otRequests?.total_hours ? '#d32f2f' : '#bbb',
          margin: [0, 2, 0, 2],
          fontSize: 6,
        };
      }),
      {
        text: employee?.totalOtHour?.toFixed(1) || '-',
        alignment: 'center',
        style: 'tableBody',
        color: '#d32f2f',
        margin: [0, 2, 0, 2],
      },
      {}, // Placeholder for Day Rate
      {}, // Placeholder for ค่าแรง
      {}, // Placeholder for OT
      {}, // Placeholder for Amount
    ]);
  });

  // --- สร้างตารางสรุปค่าแรงตามโปรเจค (Project Cost Table) ---
  const projectCostTableBody = [
    [
      { text: 'โครงการ', style: 'tableHeader', fillColor: '#d2d4d2' },
      { text: 'ค่าแรง', style: 'tableHeader', fillColor: '#d2d4d2' },
      { text: 'OT', style: 'tableHeader', fillColor: '#d2d4d2' },
      { text: 'รวม', style: 'tableHeader', fillColor: '#d2d4d2' },
    ],
  ];

  if (timestamp?.dashboard?.length > 0) {
    timestamp.dashboard.forEach((row) => {
      projectCostTableBody.push([
        row?.project_number || '-',
        {
          text: (row?.total_salary ?? 0).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
          }),
          alignment: 'right',
        },
        {
          text: (row?.total_ot ?? 0).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
          }),
          alignment: 'right',
        },
        {
          text: (
            (row?.total_salary ?? 0) + (row?.total_ot ?? 0)
          ).toLocaleString('th-TH', { minimumFractionDigits: 2 }),
          alignment: 'right',
        },
      ]);
    });
    // summary row
    projectCostTableBody.push([
      { text: 'รวมทั้งหมด', style: 'tableHeader', alignment: 'center' },
      {
        text: timestamp.dashboard
          .reduce((sum, row) => sum + (row?.total_salary || 0), 0)
          .toLocaleString('th-TH', { minimumFractionDigits: 2 }),
        alignment: 'right',
        style: 'tableHeader',
      },
      {
        text: timestamp.dashboard
          .reduce((sum, row) => sum + (row?.total_ot || 0), 0)
          .toLocaleString('th-TH', { minimumFractionDigits: 2 }),
        alignment: 'right',
        style: 'tableHeader',
      },
      {
        text: timestamp.dashboard
          .reduce(
            (sum, row) =>
              sum + ((row?.total_salary || 0) + (row?.total_ot || 0)),
            0,
          )
          .toLocaleString('th-TH', { minimumFractionDigits: 2 }),
        alignment: 'right',
        style: 'tableHeader',
      },
    ]);
  } else {
    projectCostTableBody.push([
      {
        text: 'ไม่มีข้อมูล',
        colSpan: 4,
        alignment: 'center',
        color: '#888',
      },
      {},
      {},
      {},
    ]);
  }

  const docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [15, 80, 15, 60],
    defaultStyle: {
      font: 'Sarabun',
      fontSize: 7,
    },
    info: {
      title: 'Employee Time Sheet',
      author: 'MNS System',
      subject: `Time Sheet ${dayjs(dateStart).format('MMMM YYYY')}`,
    },
    header: function (currentPage, pageCount, pageSize) {
      return [
        {
          columns: [
            {
              text: info?.name,
              style: 'header',
              alignment: 'left',
              margin: [20, 10, 0, 0],
            },
            {
              text: `Employee Time Sheet`,
              style: 'header',
              alignment: 'center',
              margin: [0, 10, 0, 0],
            },
            {
              text: `วันที่พิมพ์: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
              alignment: 'right',
              fontSize: 10,
              margin: [0, 10, 20, 0],
            },
          ],
        },
        {
          text: `เดือน ${dayjs(dateStart).format('MMMM YYYY')}`,
          alignment: 'center',
          fontSize: 12,
          margin: [0, 2, 0, 10],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 20,
              y1: 0,
              x2: pageSize.width - 20,
              y2: 0,
              lineWidth: 1,
              lineColor: '#bbb',
            },
          ],
          margin: [0, 0, 0, 10],
        },
      ];
    },
    content: [
      {
        table: {
          headerRows: 1,
          widths: [
            18, // No.
            '*', // Name
            25, // Type
            ...days.map(() => 12), // Days
            35, // Working
            40, // Day Rate
            40, // ค่าแรง
            35, // OT
            45, // Amount
          ],
          body: tableBody,
        },
        layout: {
          hLineWidth: function (i, node) {
            // เส้นขอบบนและล่างของตาราง
            if (i === 0 || i === node.table.body.length) return 1.5;
            // เส้นปิดแถวสุดท้าย
            if (i === node.table.body.length - 1) return 0.5;
            return 0.5;
          },
          vLineWidth: function (i, node) {
            // เส้นคอลัมน์
            return 0.7;
          },

          vLineColor: function (i, node) {
            return '#bbb';
          },
          paddingLeft: function (i) {
            return 1;
          },
          paddingRight: function (i) {
            return 1;
          },
          paddingTop: function (i) {
            return 1;
          },
          paddingBottom: function (i) {
            return 1;
          },
        },
        margin: [0, 0, 0, 20],
      },
      {
        text: 'สรุปค่าแรงตามโครงการ (ไม่หักภาษีและประกันสังคม)',
        style: 'header',
        fontSize: 13,
        margin: [0, 10, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: [
            70, // โครงการ
            80, // ค่าแรง
            80, // OT
            90, // รวม
          ],
          body: projectCostTableBody,
        },
        layout: 'lightHorizontalLines',
      },
    ],
    footer: function (currentPage, pageCount, pageSize) {
      return [
        {
          canvas: [
            {
              type: 'line',
              x1: 20,
              y1: 0,
              x2: pageSize.width - 20,
              y2: 0,
              lineWidth: 1,
              lineColor: '#bbb',
            },
          ],
          margin: [0, 0, 0, 6],
        },
        {
          columns: [
            {
              text: info?.name_eng,
              alignment: 'left',
              fontSize: 10,
              margin: [20, 2, 0, 0],
            },
            {
              text: `หน้าที่ ${currentPage} / ${pageCount}`,
              alignment: 'right',
              fontSize: 10,
              margin: [0, 2, 20, 0],
            },
          ],
        },
      ];
    },
    styles: {
      header: { fontSize: 14, bold: true },
      tableHeader: { bold: true, fillColor: '#CCCCCC', alignment: 'center' },
      tableBody: { alignment: 'right' },
    },
  };

  pdfMake.createPdf(docDefinition).open();
};
export default timeStampMontlyReport;
