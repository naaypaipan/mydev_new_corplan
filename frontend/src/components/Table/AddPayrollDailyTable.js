import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as MoneyIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import _ from 'lodash';
import CalSSO from '../../utils/functions/CalSSO';
import CalTax from '../../utils/functions/CalTax';

export default function AddPayrollDailyTable({
  fields = [],
  control,
  watch,
  setValue,
  remove,
  onSubmit,
  handleOpenModal,
}) {
  const theme = useTheme();

  // ปลอดภัยขึ้น
  const watchedFields = watch ? watch('salaryData') : [];
  const safeWatchedFields = Array.isArray(watchedFields) ? watchedFields : [];
  const ssoRate = watch ? watch('sso') : 5;

  // คำนวณเงินเดือนสุทธิแต่ละแถว
  const calculateNetSalary = (index) => {
    const field = fields[index];
    const watched = safeWatchedFields[index] || {};
    const salary = parseFloat(field?.totalAmount || 0);
    const overtime = parseFloat(watched?.revenue?.overtime || 0);
    // ใช้ allowances จากฟอร์มที่กรอกได้
    const allowances = parseFloat(watched?.revenue?.allowances ?? field?.revenue?.allowances ?? field?.total_extra_day ?? 0);
    const bonus = parseFloat(watched?.revenue?.bonus || 0);
    const extraDay = parseFloat(field?.total_extra_day || 0); // เพิ่ม total_extra_day
    const tax = parseFloat(watched?.expenses?.tax ?? field?.expenses?.tax ?? CalTax(salary || 0, field?.tax_type));
    const sso = parseFloat(watched?.expenses?.sso ?? field?.expenses?.sso ?? 0);
    const late = parseFloat(watched?.expenses?.late ?? field?.expenses?.late ?? 0);
    const other = parseFloat(watched?.expenses?.other ?? field?.expenses?.other ?? 0);
    // แก้ไขการคำนวณ totalIncome โดยไม่บวก extraDay ซ้ำซ้อน (เพราะ allowances = extraDay แล้ว)
    // ดังนั้น totalIncome = salary + overtime + allowances (ซึ่งคือ extraDay) + bonus
    const totalIncome = salary + overtime + allowances + bonus;
    const totalDeductions = tax + sso + late + other;
    return totalIncome - totalDeductions;
  };

  // สรุปรวม
  const totalSummary = useMemo(() => {
    if (!fields || fields.length === 0) {
      return {
        totalDays: 0,
        totalDailyRate: 0,
        totalDailyWages: 0,
        totalSalary: 0,
        totalOvertime: 0,
        totalAllowances: 0,
        totalBonus: 0,
        totalExtraDay: 0, // เพิ่ม totalExtraDay
        totalIncome: 0,
        totalTax: 0,
        totalSSO: 0,
        totalLate: 0,
        totalOther: 0,
        totalDeductions: 0,
        totalNet: 0,
      };
    }

    return fields.reduce(
      (summary, field, index) => {
        const watched = safeWatchedFields[index] || {};

        // ข้อมูลพื้นฐาน
        const days = parseFloat(field?.totalWork || 0);
        const dailyRate = parseFloat(field?.salary_per_day || 0);
        const dailyWages = parseFloat(
          field?.totalAmount || dailyRate * days || 0,
        );
        const extraDay = parseFloat(field?.total_extra_day || 0); // เพิ่ม extraDay

        // รายได้
        const overtime = parseFloat(watched?.revenue?.overtime || 0);
        // ใช้ allowances จากฟอร์มที่กรอกได้
        const allowances = parseFloat(watched?.revenue?.allowances ?? field?.revenue?.allowances ?? field?.total_extra_day ?? 0);
        const bonus = parseFloat(watched?.revenue?.bonus || 0);

        // แก้ไขการคำนวณ totalIncome
        const totalIncome = dailyWages + overtime + allowances + bonus;

        // รายจ่าย
        const tax = parseFloat(watched?.expenses?.tax ?? field?.expenses?.tax ?? 0);
        const sso = parseFloat(watched?.expenses?.sso ?? field?.expenses?.sso ?? 0);
        const late = parseFloat(watched?.expenses?.late ?? field?.expenses?.late ?? 0);
        const other = parseFloat(watched?.expenses?.other ?? field?.expenses?.other ?? 0);
        const totalDeductions = tax + sso + late + other;

        // สุทธิ
        const net = totalIncome - totalDeductions;

        return {
          totalDays: summary.totalDays + days,
          totalDailyRate: summary.totalDailyRate + dailyRate,
          totalDailyWages: summary.totalDailyWages + dailyWages,
          totalSalary: summary.totalSalary + dailyWages,
          totalOvertime: summary.totalOvertime + overtime,
          totalAllowances: summary.totalAllowances + allowances,
          totalBonus: summary.totalBonus + bonus,
          totalExtraDay: summary.totalExtraDay + extraDay, // รวม totalExtraDay
          totalIncome: summary.totalIncome + totalIncome,
          totalTax: summary.totalTax + tax,
          totalSSO: summary.totalSSO + sso,
          totalLate: summary.totalLate + late,
          totalOther: summary.totalOther + other,
          totalDeductions: summary.totalDeductions + totalDeductions,
          totalNet: summary.totalNet + net,
        };
      },
      {
        totalDays: 0,
        totalDailyRate: 0,
        totalDailyWages: 0,
        totalSalary: 0,
        totalOvertime: 0,
        totalAllowances: 0,
        totalBonus: 0,
        totalExtraDay: 0, // เพิ่ม totalExtraDay
        totalIncome: 0,
        totalTax: 0,
        totalSSO: 0,
        totalLate: 0,
        totalOther: 0,
        totalDeductions: 0,
        totalNet: 0,
      },
    );
  }, [fields, safeWatchedFields, ssoRate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderTableHeader = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 3,
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" component="h2">
        รายการเงินเดือนรายวัน
      </Typography>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={!Array.isArray(fields) || fields.length === 0}
        size="large"
        type="submit"
        sx={{ borderRadius: 2 }}
      >
        บันทึกข้อมูล
      </Button>
    </Box>
  );

  if (!Array.isArray(fields) || fields.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <MoneyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            กดปุ่มค้นหาเพื่อดึงข้อมูลพนักงาน
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {renderTableHeader()}

      <Card
        variant="outlined"
        sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 1000 }} size="small">
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 50, minWidth: 50, py: 1.5, position: 'sticky', left: 0, zIndex: 3, bgcolor: '#f4f6f8' }}
                >
                  ลำดับ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    width: 180,
                    minWidth: 180,
                    py: 1.5,
                    position: 'sticky',
                    left: 50,
                    zIndex: 3,
                    bgcolor: '#f4f6f8'
                  }}
                >
                  พนักงาน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 70, minWidth: 70, py: 1.5, position: 'sticky', left: 230, zIndex: 3, bgcolor: '#f4f6f8' }}
                >
                  วันทำงาน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 90, minWidth: 90, py: 1.5, position: 'sticky', left: 300, zIndex: 3, bgcolor: '#f4f6f8', borderRight: '1px solid #e0e0e0' }}
                >
                  ค่าแรง/วัน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 90, py: 1.5 }}
                >
                  รวมค่าแรง
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  โอที
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  เบี้ยเลี้ยง
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  เงินได้อื่นๆ
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  หักภาษี
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 90, py: 1.5 }}
                >
                  ประกันสังคม
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  หักเงินสาย
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 80, py: 1.5 }}
                >
                  หักอื่นๆ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 90, py: 1.5 }}
                >
                  สุทธิ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 150, py: 1.5 }}
                >
                  หมายเหตุ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 50, py: 1.5 }}
                >
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => {
                const watched = safeWatchedFields[index] || {};
                return (
                  <TableRow
                    key={field?.id || index}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    {/* ลำดับ */}
                    <TableCell align="center" sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>{index + 1}</TableCell>
                    {/* ข้อมูลพนักงาน */}
                    <TableCell sx={{ py: 1, position: 'sticky', left: 50, zIndex: 1, bgcolor: 'background.paper' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {field?.name || ''}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {field?.department || '-'} • {field?.role || '-'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, position: 'sticky', left: 230, zIndex: 1, bgcolor: 'background.paper' }}>
                      <Chip
                        label={`${field?.totalWork || 0} วัน`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenModal(field?.checkins)}
                          sx={{ ml: 1 }}
                        >
                          <SummarizeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    {/* ค่าแรงต่อวัน */}
                    <TableCell align="center" sx={{ py: 1, position: 'sticky', left: 300, zIndex: 1, bgcolor: 'background.paper', borderRight: '1px solid #e0e0e0' }}>
                      {control ? (
                        <Controller
                          name={`salaryData.${index}.salary_per_day`}
                          control={control}
                          defaultValue={field?.salary_per_day?.toFixed(2) || 0}
                          render={({ field: controlField }) => (
                            <TextField
                              {...controlField}
                              value={
                                controlField.value
                                  ? parseFloat(controlField.value).toFixed(2)
                                  : '0.00'
                              }
                              size="small"
                              type="number"
                              disabled
                              inputProps={{
                                step: '0.01',
                                min: '0',
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ฿
                                  </InputAdornment>
                                ),
                                sx: { fontSize: '0.8rem', py: 0.5 },
                              }}
                              sx={{ width: 120 }}
                            />
                          )}
                        />
                      ) : (
                        <Typography variant="body2">
                          {formatCurrency(field?.salary_per_day || 0)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      {control ? (
                        <Controller
                          name={`salaryData.${index}.revenue.salary`}
                          control={control}
                          defaultValue={
                            (
                              watch(`salaryData.${index}.salary_per_day`) *
                              field?.totalWork
                            )?.toFixed(2) || 0
                          }
                          render={({ field: controlField }) => (
                            <TextField
                              {...controlField}
                              size="small"
                              type="number"
                              disabled
                              inputProps={{
                                step: '0.01',
                                min: '0',
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ฿
                                  </InputAdornment>
                                ),
                                sx: { fontSize: '0.8rem', py: 0.5 },
                              }}
                              sx={{ width: 120 }}
                            />
                          )}
                        />
                      ) : (
                        <Typography variant="body2">
                          {formatCurrency(field?.salary_per_day || 0)}
                        </Typography>
                      )}
                    </TableCell>

                    {/* โอที */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.revenue.overtime`}
                        control={control}
                        defaultValue={field?.revenue?.overtime?.toFixed(2) ?? field?.totalOtAmount?.toFixed(2) ?? 0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            inputProps={{
                              step: '0.01',
                              min: '0',
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                              sx: { fontSize: '0.8rem', py: 0.5 },
                            }}
                            sx={{ width: 100 }}
                          />
                        )}
                      />
                    </TableCell>
                    {/* เบี้ยเลี้ยง (แสดง total_extra_day) */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.revenue.allowances`}
                        control={control}
                        defaultValue={field?.revenue?.allowances?.toFixed(2) ?? field?.total_extra_day?.toFixed(2) ?? 0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            inputProps={{
                              step: '0.01',
                              min: '0',
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                              sx: { fontSize: '0.8rem', py: 0.5 },
                            }}
                            sx={{ width: 100 }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.revenue.bonus`}
                        control={control}
                        defaultValue={0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            inputProps={{
                              step: '0.01',
                              min: '0',
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                              sx: { fontSize: '0.8rem', py: 0.5 },
                            }}
                            sx={{ width: 100 }}
                          />
                        )}
                      />
                    </TableCell>
                    {/* หักภาษี */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.expenses.tax`}
                        control={control}
                        defaultValue={
                          parseFloat(
                            CalTax(
                              field?.salary_per_day * field?.totalWork,
                              field?.tax_type,
                            )?.toFixed(2),
                          ) || 0
                        }
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            inputProps={{
                              step: '0.01',
                              min: '0',
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                              sx: { fontSize: '0.8rem', py: 0.5 },
                            }}
                            sx={{ width: 100 }}
                          />
                        )}
                      />
                    </TableCell>
                    {/* ประกันสังคม */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      {control ? (
                        <Controller
                          name={`salaryData.${index}.expenses.sso`}
                          control={control}
                          defaultValue={
                            field?.expenses?.sso ?? (
                              CalSSO(
                                field?.salary_per_day * field?.totalWork,
                                field?.sso_tax,
                                field?.sso_paid,
                              ) || 0
                            )
                          }
                          render={({ field: controlField }) => (
                            <TextField
                              {...controlField}
                              size="small"
                              type="number"
                              inputProps={{
                                step: '0.01',
                                min: '0',
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ฿
                                  </InputAdornment>
                                ),
                                sx: { fontSize: '0.8rem', py: 0.5 },
                              }}
                              sx={{ width: 110 }}
                            />
                          )}
                        />
                      ) : (
                        <Typography variant="body2">
                          {formatCurrency(field?.otherDeductions || 0)}
                        </Typography>
                      )}
                    </TableCell>
                    {/* หักเงินสาย */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      {control ? (
                        <Controller
                          name={`salaryData.${index}.expenses.late`}
                          control={control}
                          defaultValue={field?.expenses?.late ?? 0}
                          render={({ field: controlField }) => (
                            <TextField
                              {...controlField}
                              size="small"
                              type="number"
                              inputProps={{
                                step: '0.01',
                                min: '0',
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ฿
                                  </InputAdornment>
                                ),
                                sx: { fontSize: '0.8rem', py: 0.5 },
                              }}
                              sx={{ width: 100 }}
                            />
                          )}
                        />
                      ) : (
                        <Typography variant="body2">
                          {formatCurrency(field?.expenses?.late || 0)}
                        </Typography>
                      )}
                    </TableCell>
                    {/* หักอื่นๆ */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.expenses.other`}
                        control={control}
                        defaultValue={0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            inputProps={{
                              step: '0.01',
                              min: '0',
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                              sx: { fontSize: '0.8rem', py: 0.5 },
                            }}
                            sx={{ width: 100 }}
                          />
                        )}
                      />
                    </TableCell>
                    {/* เงินเดือนสุทธิ */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 0.5,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderColor: alpha(theme.palette.success.main, 0.2),
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="success.main"
                          textAlign="right"
                          fontSize="0.8rem"
                        >
                          {formatCurrency(calculateNetSalary(index))}
                        </Typography>
                      </Paper>
                    </TableCell>
                    {/* หมายเหตุ */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Controller
                        name={`salaryData.${index}.note`}
                        control={control}
                        defaultValue={field?.note || ''}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            placeholder="ระบุหมายเหตุ"
                            sx={{ width: 150 }}
                            inputProps={{
                              style: { fontSize: '0.8rem' },
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    {/* ปุ่มจัดการ */}
                    <TableCell align="center" sx={{ py: 1 }}>
                      {remove && (
                        <Tooltip title="ลบรายการ">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => remove(index)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                              padding: 0.5,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.07) }}
              >
                <TableCell colSpan={3} sx={{ py: 1, position: 'sticky', left: 0, zIndex: 2, bgcolor: '#f4f6f8' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SummarizeIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      สรุปรวมทั้งหมด ({fields.length} คน)
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ py: 1, position: 'sticky', left: 300, zIndex: 2, bgcolor: '#f4f6f8', borderRight: '1px solid #e0e0e0' }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalDailyRate)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="info.main"
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalDailyWages)}
                  </Typography>
                </TableCell>
                {/* <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalExtraDay)}
                  </Typography>
                </TableCell> */}
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalOvertime)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalAllowances)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalBonus)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalTax)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalSSO)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalLate)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize="0.8rem"
                  >
                    {formatCurrency(totalSummary.totalOther)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <Paper
                    sx={{
                      p: 0.5,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderColor: alpha(theme.palette.success.main, 0.3),
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.3,
                      )}`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="success.main"
                      textAlign="right"
                      fontSize="0.8rem"
                    >
                      {formatCurrency(totalSummary.totalNet)}
                    </Typography>
                  </Paper>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            รวมพนักงาน {fields.length} คน, วันทำงานทั้งหมด{' '}
            {totalSummary.totalDays} วัน
          </Typography>
        </Stack>
        <Stack direction="row" spacing={4} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUpIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              รายได้รวม:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {formatCurrency(totalSummary.totalIncome)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingDownIcon color="error" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              หักรวม:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="error.main">
              {formatCurrency(totalSummary.totalDeductions)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <MoneyIcon color="success" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              จ่ายสุทธิ:
            </Typography>
            <Typography variant="body2" fontWeight={700} color="success.main">
              {formatCurrency(totalSummary.totalNet)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
