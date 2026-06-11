import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';

dayjs.extend(weekday);
dayjs.extend(localeData);

const Monthlyreport = ({
  timestamp,
  month,
  setMonth,
  year,
  daysInMonth,
  days,
  handleValueChange,
  selectedOption,
  permission,
}) => {
  const theme = useTheme();

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  const hasData = timestamp?.rows && timestamp.rows.length > 0;

  // --- คำนวณผลรวมสำหรับแถวสรุป ---
  const totals = hasData
    ? timestamp.rows.reduce(
        (acc, employee) => {
          acc.totalWork += employee.totalWork || 0;
          acc.totalOtHour += employee.totalOtHour || 0;
          acc.totalAmount += employee.totalAmount || 0;
          acc.totalOtAmount += employee.totalOtAmount || 0;
          return acc;
        },
        {
          totalWork: 0,
          totalOtHour: 0,
          totalAmount: 0,
          totalOtAmount: 0,
        },
      )
    : null;

  return (
    <div className="p-2">
      {/* ลบตัวเลือก Select ที่ซ้ำซ้อนเนื่องจากได้ย้ายไปอยู่ใน HrReport แล้ว */}

      <div className="overflow-auto">
        {hasData ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-theme-400">
                <th className="border border-gray-300 p-2 ">No.</th>
                <th
                  className="border border-gray-300 p-2 w-[00px]"
                  style={{
                    minWidth: '200px',
                  }}
                >
                  Name
                </th>
                <th className="border border-gray-300 p-2">Type</th>
                {days?.map((day) => {
                  const date = dayjs(`${year}-${month + 1}-${day}`);
                  const isWeekend = date.day() === 0 || date.day() === 6;
                  return (
                    <th
                      key={day}
                      className={`border border-gray-300 p-2 ${
                        isWeekend ? 'bg-red-400' : ''
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="border border-gray-300 p-2">Working</th>
                {permission?.hr_management && (
                  <th className="border border-gray-300 p-2">Day Rate</th>
                )}
                {permission?.hr_management && (
                  <th className="border border-gray-300 p-2">ค่าแรง</th>
                )}
                {permission?.hr_management && (
                  <th className="border border-gray-300 p-2">OT</th>
                )}
                {permission?.hr_management && (
                  <th className="border border-gray-300 p-2">Amount</th>
                )}
              </tr>
            </thead>
            <tbody>
              {timestamp?.rows?.map((employee, idx) => (
                <tr
                  key={idx}
                  className="text-center hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <td className="border border-gray-300 p-2">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">
                    {employee?.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="border-b border-gray-300 p-1">normal</div>
                    <div className="p-1">ot</div>
                  </td>
                  {days?.map((day) => (
                    <td
                      key={day}
                      className="border border-gray-300 p-2 text-center"
                    >
                      <div className="p-1 border-b border-gray-400 pb-1 mb-1 text-xs">
                        {employee.checkins
                          ?.find(
                            (e) =>
                              dayjs(e?.checkIn).format('D/M/YY') ===
                              `${day}/${month + 1}/${year % 100}`,
                          )
                          ?.totalHour.toFixed(0) *
                          employee.checkins
                            ?.find(
                              (e) =>
                                dayjs(e?.checkIn).format('D/M/YY') ===
                                `${day}/${month + 1}/${year % 100}`,
                            )
                            ?.rate?.toFixed(0) || (
                          <div className="text-white">-</div>
                        )}
                      </div>
                      <div className="p-1 text-xs">
                        {parseFloat(
                          employee.checkins
                            ?.find(
                              (e) =>
                                dayjs(e?.checkIn).format('D/M/YY') ===
                                `${day}/${month + 1}/${year % 100}`,
                            )
                            ?.otRequests?.total_hours?.toFixed(2),
                        ) || <div className="text-white">-</div>}
                      </div>
                    </td>
                  ))}
                  <td className="border border-gray-300 p-2">
                    <div className="p-1 border-b border-gray-400 pb-1 mb-1">
                      {employee?.totalWork}
                    </div>
                    <div className="p-1">
                      {employee?.totalOtHour?.toFixed(1)}
                    </div>
                  </td>
                  {permission?.hr_management && (
                    <td className="border border-gray-300 p-2">
                      {employee?.salary_per_day
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </td>
                  )}
                  {permission?.hr_management && (
                    <td className="border border-gray-300 p-2">
                      {employee?.totalAmount
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </td>
                  )}
                  {permission?.hr_management && (
                    <td className="border border-gray-300 p-2">
                      {employee?.totalOtAmount
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </td>
                  )}
                  {permission?.hr_management && (
                    <td className="border border-gray-300 p-2 font-bold">
                      {(employee?.totalAmount + employee?.totalOtAmount)
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            {/* --- เพิ่มส่วนสรุป (Footer) --- */}
            {permission?.hr_management && totals && (
              <tfoot className="bg-gray-200 dark:bg-gray-700 font-bold text-center">
                <tr>
                  <td
                    colSpan={3 + (days?.length || 0)}
                    className="border border-gray-300 p-2 text-right"
                  >
                    รวมทั้งหมด
                  </td>
                  {/* Working (ว่าง) */}
                  <td className="border border-gray-300 p-2"></td>
                  {/* Day Rate (ว่าง) */}
                  <td className="border border-gray-300 p-2"></td>
                  {/* ค่าแรง */}
                  <td className="border border-gray-300 p-2">
                    {totals.totalAmount
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </td>
                  {/* OT */}
                  <td className="border border-gray-300 p-2">
                    {totals.totalOtAmount
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </td>
                  {/* Amount */}
                  <td className="border border-gray-300 p-2">
                    {(totals.totalAmount + totals.totalOtAmount)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          // ส่วนแสดงเมื่อไม่มีข้อมูล
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 2,
              textAlign: 'center',
              bgcolor: alpha(
                theme?.palette?.background?.default || '#f5f5f5',
                0.7,
              ),
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <ContentPasteOffIcon
              sx={{
                fontSize: 60,
                color: 'text.disabled',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ไม่พบรายการลงเวลา
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 400 }}
            >
              ไม่พบข้อมูลการลงเวลาสำหรับช่วงเวลาที่เลือก
              กรุณาเลือกช่วงเวลาอื่นหรือปรับตัวกรองข้อมูล
            </Typography>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default Monthlyreport;
