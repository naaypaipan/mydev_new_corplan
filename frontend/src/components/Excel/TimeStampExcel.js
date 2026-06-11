import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const TimeStampExcel = ({ data, fileName }) => {
  const exportToExcel = () => {
    // Header
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['TIMESTAMP REPORT'],
      [
        'ลำดับ',
        'ชื่อ-นามสกุล',
        'ตำแหน่ง',
        'ค่าแรงต่อวัน',
        'Project_Id',
        'Project_Name',
        'Date',
        'Time In',
        'Time Out',
        'OT In',
        'OT Out',
        'OT Status',
        'OT Rate',
      ],
    ]);

    // Helper: convert JS Date to Excel time serial (0-1)
    const toExcelTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return (
        (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400
      );
    };

    // Prepare data
    const excelData = data.map((item, idx) => ({
      ลำดับ: idx + 1,
      'ชื่อ-นามสกุล':
        (item?.employee?.firstname || '') +
        ' ' +
        (item?.employee?.lastname || ''),
      ตำแหน่ง: item?.employee?.role?.name || item?.role?.name || '',
      ค่าแรงต่อวัน: item?.employee?.salary?.day || '',
      Project_Id: item?.project_in?.project_number || '',
      Project_Name: item?.project_in?.name || '',
      Date: item?.checkIn ? dayjs(item.checkIn).format('DD/MM/YYYY') : '',
      'Time In': item?.checkIn ? toExcelTime(item.checkIn) : '',
      'Time Out': item?.checkOut ? toExcelTime(item.checkOut) : '',
      'OT IN': item?.otRequests?.startTime
        ? toExcelTime(item.otRequests.startTime)
        : '',
      'OT OUT': item?.otRequests?.endTime
        ? toExcelTime(item.otRequests.endTime)
        : '',
      'OT Status': item?.otRequests?.status || '',
      'OT Rate': item?.otRequests?.rate || '',
    }));

    // Append data to worksheet starting from row 3
    XLSX.utils.sheet_add_json(worksheet, excelData, {
      origin: 'A3',
      skipHeader: true,
    });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 }, // ลำดับ
      { wch: 22 }, // ชื่อ-นามสกุล
      { wch: 16 }, // ตำแหน่ง
      { wch: 14 }, // ค่าแรงต่อวัน
      { wch: 18 }, // Project_Id
      { wch: 30 }, // Project_Name
      { wch: 14 }, // Date
      { wch: 12 }, // Time In
      { wch: 12 }, // Time Out
      { wch: 12 }, // OT IN
      { wch: 12 }, // OT OUT
      { wch: 12 }, // OT OUT
      { wch: 12 }, // OT OUT
    ];

    // Merge header
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    // Set report title styling
    worksheet['A1'] = {
      v: 'TIMESTAMP REPORT',
      s: {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' },
      },
    };

    // Set cell type and format for Time In/Time Out
    const startRow = 3;
    for (let i = 0; i < excelData.length; i++) {
      const row = i + startRow;
      // Time In
      const timeInCell = XLSX.utils.encode_cell({ r: row, c: 7 });
      if (
        worksheet[timeInCell] &&
        typeof worksheet[timeInCell].v === 'number'
      ) {
        worksheet[timeInCell].t = 'n';
        worksheet[timeInCell].z = 'hh:mm';
      }
      // Time Out
      const timeOutCell = XLSX.utils.encode_cell({ r: row, c: 8 });
      if (
        worksheet[timeOutCell] &&
        typeof worksheet[timeOutCell].v === 'number'
      ) {
        worksheet[timeOutCell].t = 'n';
        worksheet[timeOutCell].z = 'hh:mm';
      }
    }

    // Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TimeStamp');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return { exportToExcel };
};

export default TimeStampExcel;
