import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as MoneyIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import CallSSO from '../../utils/functions/CalSSO';
import CalTax from 'utils/functions/CalTax';
import CalSalaryMonthly from '../../utils/functions/CalSalaryMonthly';

export default function AddSalaryTable({
  fields = [],
  control,
  watch,
  setValue,
  remove,
  onSubmit,
  handleOpenModal,
}) {
  const theme = useTheme();

  // เพิ่มการตรวจสอบที่ปลอดภัยมากขึ้น
  const watchedFields = watch ? watch('salaryData') : [];
  const safeWatchedFields = Array.isArray(watchedFields) ? watchedFields : [];

  // คำนวณเงินเดือนสุทธิสำหรับแต่ละแถว
  const calculateNetSalary = (index) => {
    if (!safeWatchedFields[index]) return 0;

    const field = safeWatchedFields[index];
    // ใช้ allowance จาก field.revenue.allowances เพื่อให้แก้ไขได้
    const salary = parseFloat(field?.revenue?.salary || 0);
    const overtime = parseFloat(field?.revenue?.overtime || 0); // OT รวมในสุทธิ
    const allowances = parseFloat(field?.revenue?.allowances || 0);
    const bonus = parseFloat(field?.revenue?.bonus || 0);

    const tax = parseFloat(field?.expenses?.tax || 0);
    const sso = parseFloat(field?.expenses?.sso || 0);
    const late = parseFloat(field?.expenses?.late || 0);
    const other = parseFloat(field?.expenses?.other || 0);

    // รวม OT ใน totalIncome
    const totalIncome = salary + overtime + allowances + bonus;
    const totalDeductions = tax + sso + late + other;

    return totalIncome - totalDeductions;
  };

  // คำนวณยอดรวมทั้งหมด
  const totalSummary = useMemo(() => {
    if (!safeWatchedFields || safeWatchedFields.length === 0) {
      return {
        totalSalary: 0,
        totalOvertime: 0,
        totalAllowances: 0,
        totalBonus: 0,
        totalIncome: 0,
        totalTax: 0,
        totalSSO: 0,
        totalLate: 0,
        totalOther: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalWorkDays: 0,
      };
    }

    return safeWatchedFields.reduce(
      (summary, field, index) => {
        if (!field) return summary;

        const salary = parseFloat(field?.revenue?.salary || 0);
        const overtime = parseFloat(field?.revenue?.overtime || 0);
        const allowances = parseFloat(field?.revenue?.allowances || 0); // <-- ใช้ค่าที่แก้ไขได้
        const bonus = parseFloat(field?.revenue?.bonus || 0);

        const income = salary + overtime + allowances + bonus;
        const workDays = parseFloat(fields[index]?.totalWork || 0);

        const tax = parseFloat(field?.expenses?.tax || 0);
        const sso = parseFloat(field?.expenses?.sso || 0);
        const late = parseFloat(field?.expenses?.late || 0);
        const other = parseFloat(field?.expenses?.other || 0);

        const deductions = tax + sso + late + other;
        const net = income - deductions;

        return {
          totalSalary: summary.totalSalary + salary,
          totalOvertime: summary.totalOvertime + overtime,
          totalAllowances: summary.totalAllowances + allowances,
          totalBonus: summary.totalBonus + bonus,
          totalIncome: summary.totalIncome + income,
          totalTax: summary.totalTax + tax,
          totalSSO: summary.totalSSO + sso,
          totalLate: summary.totalLate + late,
          totalOther: summary.totalOther + other,
          totalDeductions: summary.totalDeductions + deductions,
          totalNet: summary.totalNet + net,
          totalWorkDays: summary.totalWorkDays + workDays,
        };
      },
      {
        totalSalary: 0,
        totalOvertime: 0,
        totalAllowances: 0,
        totalBonus: 0,
        totalIncome: 0,
        totalTax: 0,
        totalSSO: 0,
        totalLate: 0,
        totalOther: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalWorkDays: 0,
      },
    );
  }, [safeWatchedFields, fields]);

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
        รายการเงินเดือนรายเดือน
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

  // ตรวจสอบว่า fields เป็น array และมีข้อมูลหรือไม่
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
          <Table sx={{ minWidth: 1200 }} size="small">
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 60, width: 60, position: 'sticky', left: 0, zIndex: 3, bgcolor: '#f4f6f8' }}
                >
                  ลำดับ
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 200, width: 200, position: 'sticky', left: 60, zIndex: 3, bgcolor: '#f4f6f8' }}>
                  พนักงาน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 140, width: 140, position: 'sticky', left: 260, zIndex: 3, bgcolor: '#f4f6f8' }}
                >
                  เงินเดือนพื้นฐาน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100, width: 100, position: 'sticky', left: 400, zIndex: 3, bgcolor: '#f4f6f8', borderRight: '1px solid #e0e0e0' }}
                >
                  วันทำงาน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 120 }}
                >
                  เงินเดือน
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  โอที
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  เบี้ยเลี้ยง
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  เงินได้อื่นๆ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  หักภาษี
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 120 }}
                >
                  ประกันสังคม
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  หักเงินสาย
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 100 }}
                >
                  หักอื่นๆ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 120 }}
                >
                  สุทธิ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 150 }}
                >
                  หมายเหตุ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 80 }}
                >
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
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
                  <TableCell sx={{ position: 'sticky', left: 60, zIndex: 1, bgcolor: 'background.paper' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {field?.name || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {field?.department || '-'} • {field?.role || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  {/* เงินเดือนต่อเดือน (แสดงอย่างเดียว) */}
                  <TableCell align="center" sx={{ position: 'sticky', left: 260, zIndex: 1, bgcolor: 'background.paper' }}>
                    <Typography variant="body2">
                      {formatCurrency(field?.salary_per_month || 0)}
                    </Typography>
                  </TableCell>
                  {/* วันทำงาน */}
                  <TableCell align="center" sx={{ position: 'sticky', left: 400, zIndex: 1, bgcolor: 'background.paper', borderRight: '1px solid #e0e0e0' }}>
                    <Chip
                      label={`${field?.totalWork || 0} วัน`}
                      size="small"
                      color="primary"
                      variant="outlined"
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
                  {/* เงินเดือนพื้นฐาน */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.revenue.salary`}
                        control={control}
                        defaultValue={field?.salary_per_month || 0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 140 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(field?.baseSalary || 0)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* โอที */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.revenue.overtime`}
                        control={control}
                        defaultValue={field?.revenue?.overtime ?? field?.totalOtAmount ?? 0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(field?.revenue?.overtime ?? field?.totalOtAmount ?? 0)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* เบี้ยเลี้ยง (total_extra_day) */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.revenue.allowances`}
                        control={control}
                        defaultValue={field?.revenue?.allowances ?? field?.total_extra_day ?? 0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            value={controlField.value}
                            onChange={controlField.onChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      />
                    ) : (
                      <TextField
                        size="small"
                        type="number"
                        value={field?.revenue?.allowances?.toFixed(2) ?? field?.total_extra_day?.toFixed(2) ?? 0}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">฿</InputAdornment>
                          ),
                        }}
                        sx={{ width: 120 }}
                        disabled
                      />
                    )}
                  </TableCell>

                  {/* เงินได้อื่นๆ */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.revenue.bonus`}
                        control={control}
                        defaultValue={0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(field?.bonus || 0)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* หักภาษี */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.expenses.tax`}
                        control={control}
                        defaultValue={CalTax(
                          field?.salary_per_month,
                          field?.tax_type,
                        )}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(field?.withholdingTax || 0)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* ประกันสังคม */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.expenses.sso`}
                        control={control}
                        defaultValue={
                          field?.expenses?.sso || 0
                        }
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
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
                  <TableCell align="center">
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
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
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
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.expenses.other`}
                        control={control}
                        defaultValue={0}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            type="number"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ฿
                                </InputAdornment>
                              ),
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2">
                        {formatCurrency(field?.otherDeductions || 0)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* เงินเดือนสุทธิ */}
                  <TableCell align="center">
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        borderColor: alpha(theme.palette.success.main, 0.2),
                        minWidth: 100,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                        textAlign="right"
                      >
                        {formatCurrency(calculateNetSalary(index))}
                      </Typography>
                    </Paper>
                  </TableCell>

                  {/* หมายเหตุ */}
                  <TableCell align="center">
                    {control ? (
                      <Controller
                        name={`salaryData.${index}.note`}
                        control={control}
                        defaultValue={field?.note || ''}
                        render={({ field: controlField }) => (
                          <TextField
                            {...controlField}
                            size="small"
                            placeholder="หมายเหตุ..."
                            sx={{ width: 150 }}
                          />
                        )}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                        {field?.note || '-'}
                      </Typography>
                    )}
                  </TableCell>

                  {/* ปุ่มจัดการ */}
                  <TableCell align="center">
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
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.07) }}
              >
                <TableCell colSpan={4} sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: '#f4f6f8', borderRight: '1px solid #e0e0e0' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SummarizeIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      สรุปรวมทั้งหมด ({fields.length} คน)
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalSalary)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalOvertime)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalAllowances)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalBonus)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalTax)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalSSO)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalLate)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formatCurrency(totalSummary.totalOther)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Paper
                    sx={{
                      p: 1,
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
                    >
                      {formatCurrency(totalSummary.totalNet)}
                    </Typography>
                  </Paper>
                </TableCell>
                <TableCell></TableCell>
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
            {totalSummary.totalWorkDays} วัน
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
