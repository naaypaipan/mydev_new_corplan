import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as MoneyIcon,
  AccessTime as TimeIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

export default function SalaryListDetailCard({ salary, payrollReport }) {
  const theme = useTheme();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/BBBB');
  };

  // คำนวณสรุปข้อมูล
  const summary = useMemo(() => {
    if (!salary?.salaryData) {
      return {
        totalGross: 0,
        totalNet: 0,
        totalDeductions: 0,
        employeeCount: 0,
      };
    }

    return salary.salaryData.reduce(
      (acc, item) => {
        const gross =
          (item.revenue?.salary || 0) +
          (item.revenue?.overtime || 0) +
          (item.revenue?.bonus || 0) +
          (item.revenue?.allowance || 0) +
          (item.revenue?.other || 0);

        const deductions =
          (item.expenses?.tax || 0) +
          (item.expenses?.sso || 0) +
          (item.expenses?.timestamp || 0) +
          (item.expenses?.other || 0);

        const net = gross - deductions;

        return {
          totalGross: acc.totalGross + gross,
          totalDeductions: acc.totalDeductions + deductions,
          totalNet: acc.totalNet + net,
          employeeCount: acc.employeeCount + 1,
        };
      },
      { totalGross: 0, totalNet: 0, totalDeductions: 0, employeeCount: 0 },
    );
  }, [salary]);

  const renderHeader = () => (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.03,
        )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        borderColor: alpha(theme.palette.primary.main, 0.1),
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <ReceiptIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  เงินเดือน
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssignmentIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    เลขที่:
                  </Typography>
                  <Chip
                    label={salary?.code}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      height: 24,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.03),
                    borderColor: alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon fontSize="small" color="info" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        วันที่สร้าง
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(salary.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.03),
                    borderColor: alpha(theme.palette.warning.main, 0.1),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TimeIcon fontSize="small" color="warning" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ช่วงเวลา
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(salary?.dateStart)} -{' '}
                        {formatDateTime(salary?.dateEnd)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {salary?.note && (
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.grey[500], 0.03),
                      borderColor: alpha(theme.palette.grey[500], 0.1),
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      หมายเหตุ
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {salary.note}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ ml: 2 }}>
            <Tooltip title="พิมพ์">
              <IconButton
                size="small"
                color="primary"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
                onClick={() => payrollReport(salary)}
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* <Tooltip title="ดาวน์โหลด">
              <IconButton
                size="small"
                color="success"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                  },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="แก้ไข">
              <IconButton
                size="small"
                color="warning"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return <Box>{renderHeader()}</Box>;
}
