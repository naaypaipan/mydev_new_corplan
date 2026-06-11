import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const FinanceExcel = ({ data, fileName }) => {
  const exportToExcel = () => {
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['EXPENSE REPORT'], // Report title
    ]);

    // Transform data for Excel format
    const excelData = data.map((item) => {
      const netAmount =
        item?.net_price != null
          ? item.net_price
          : (item?.price || 0) - (item?.withholding_tax || 0) || 0;
      return {
        Date: new Date(item.date).toLocaleDateString(),
        id: item.code,
        Project_Id: item?.project?.project_number || '',
        Project_Name: item?.project?.name || '',
        BudgetNumber: `${item?.budget?.prefix || ''}${
          item?.budget?.budget_number
        }`,
        Budget: item?.budget?.name || '',
        Oeder: item?.name || '',
        'ยอดจ่ายจริง': netAmount,
        Payee: item?.payee?.name || '',
        Bank: item?.payee?.bank || '',
        Account: item?.payee?.account_number || '',
        Status: item?.status || '',
        Applicant:
          item?.employee?.firstname + ' ' + item?.employee?.lastname || '',
      };
    });

    // Append data to worksheet starting from row 4
    XLSX.utils.sheet_add_json(worksheet, excelData, {
      origin: 'A2', // Start from row 2
      skipHeader: false,
    });

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // ID
      { wch: 20 }, // Project ID
      { wch: 30 }, // Project
      { wch: 20 }, //Budget number
      { wch: 30 }, // Budget
      { wch: 40 }, // Oeder
      { wch: 15 }, // Amount
      { wch: 12 }, // Status
      { wch: 20 }, // Paid Type
      { wch: 15 }, // Paid Type
      { wch: 15 }, // Paid Type
      { wch: 20 }, // Employee
    ];
    worksheet['!cols'] = columnWidths;

    // Set cell merges for header
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Merge cells for company name
    ];

    // Add some styling to header cells
    worksheet['A1'] = {
      v: 'EXPENSE REPORT',
      s: {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' },
      },
    };

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create blob and save file
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return { exportToExcel };
};

export default FinanceExcel;
