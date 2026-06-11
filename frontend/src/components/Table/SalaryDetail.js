import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Stack,
  Chip,
  Avatar,
  Paper,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  TablePagination,
  useTheme,
  alpha,
  Fade,
  ButtonGroup,
  Button,
  TableSortLabel,
  LinearProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as MoneyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  MoreVert as MoreIcon,
  ReceiptLong as PayslipIcon,
  Groups as GroupsIcon,
  PriceCheck as NetPayIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

export default function SalaryDetail({
  salary = [],
  onView,
  onEdit,
  onDelete,
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const salaryData = salary || [];

  const formatCurrency = (amount) => {
    // แสดงเฉพาะตัวเลข ไม่แสดงสัญลักษณ์ค่าเงิน
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY');
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  // คำนวณสรุปข้อมูล
  const summary = useMemo(() => {
    return salaryData.reduce(
      (acc, item) => {
        const gross = Object.values(item.revenue || {}).reduce(
          (sum, val) => sum + (val || 0),
          0,
        );
        const deductions = Object.values(item.expenses || {}).reduce(
          (sum, val) => sum + (val || 0),
          0,
        );

        return {
          totalEmployees: acc.totalEmployees + 1,
          totalGross: acc.totalGross + gross,
          totalDeductions: acc.totalDeductions + deductions,
          totalNet: acc.totalNet + (item.total || 0),
          totalWorkDays: acc.totalWorkDays + (item.timesTampData?.length || 0),
        };
      },
      {
        totalEmployees: 0,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalWorkDays: 0,
      },
    );
  }, [salaryData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = salaryData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (salaryData.length === 0) {
    return (
      <Fade in={true} timeout={500}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.05)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <ReceiptIcon
                  sx={{
                    fontSize: 30,
                    color: alpha(theme.palette.text.secondary, 0.7),
                  }}
                />
              </Avatar>

              <Typography
                variant="h6"
                color="text.primary"
                gutterBottom
                fontWeight={500}
              >
                ไม่พบข้อมูลเงินเดือน
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}
              >
                ยังไม่มีการบันทึกข้อมูลเงินเดือนในระบบ
                กรุณาเพิ่มข้อมูลเงินเดือนเพื่อแสดงในตารางนี้
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ py: 1 }}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.05)}`,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderBottom: `2px solid ${alpha(
                      theme.palette.primary.main,
                      0.1,
                    )}`,
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 60 }}
                  >
                    ลำดับ
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 200 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PersonIcon
                        sx={{
                          fontSize: 18,
                          color: theme.palette.primary.main,
                          opacity: 0.8,
                        }}
                      />
                      <Typography>พนักงาน</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    วันทำงาน
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 120 }}
                  >
                    เงินเดือน
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    โอที
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    เบี้ยเลี้ยง
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    เงินได้อื่นๆ
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    หักภาษี
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 120 }}
                  >
                    ประกันสังคม
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    หักค่าสาย
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 100 }}
                  >
                    หักอื่นๆ
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 120 }}
                  >
                    สุทธิ
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 600, py: 1.5, px: 2, minWidth: 150 }}
                  >
                    หมายเหตุ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1,
                      )}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.01),
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {/* ลำดับ */}
                    <TableCell align="center" sx={{ py: 1.2, px: 2 }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    {/* ข้อมูลพนักงาน */}
                    <TableCell sx={{ py: 1.2, px: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {row?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.employeeData?.employeeId}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* วันทำงาน */}
                    <TableCell sx={{ py: 1.2, px: 2 }}>
                      <Chip
                        label={`${row.totalWork || 0} วัน`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: 24,
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>

                    {/* รายได้ */}
                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(row.revenue?.salary || 0)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2">
                        {formatCurrency(row.revenue?.overtime || 0)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2">
                        {formatCurrency(row.revenue?.allowances || 0)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2">
                        {formatCurrency(row.revenue?.bonus || 0)}
                      </Typography>
                    </TableCell>

                    {/* ค่าใช้จ่าย/หัก */}
                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" color="error.main">
                        {row.expenses?.tax
                          ? `-${formatCurrency(row.expenses?.tax)}`
                          : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" color="error.main">
                        {row.expenses?.sso
                          ? `-${formatCurrency(row.expenses?.sso)}`
                          : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" color="error.main">
                        {row.expenses?.late
                          ? `-${formatCurrency(row.expenses?.late)}`
                          : '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" color="error.main">
                        {row.expenses?.other
                          ? `-${formatCurrency(row.expenses?.other)}`
                          : '-'}
                      </Typography>
                    </TableCell>

                    {/* สุทธิ */}
                    <TableCell align="right" sx={{ py: 1.2, px: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="info.main"
                      >
                        {formatCurrency(row?.total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="left" sx={{ py: 1.2, px: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {row?.note || '-'}
                      </Typography>
                    </TableCell>

                    {/* จัดการ */}
                    {/* <TableCell align="center" sx={{ py: 1.2, px: 2 }}>
                      <ButtonGroup
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      >
                        <Tooltip title="แก้ไข">
                          <Button
                            onClick={() => onEdit?.(row)}
                            sx={{
                              minWidth: 0,
                              p: 0.5,
                              borderColor: alpha(
                                theme.palette.warning.main,
                                0.2,
                              ),
                              '&:hover': {
                                bgcolor: alpha(
                                  theme.palette.warning.main,
                                  0.05,
                                ),
                              },
                            }}
                          >
                            <EditIcon
                              fontSize="small"
                              sx={{ color: theme.palette.warning.main }}
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip title="ลบ">
                          <Button
                            onClick={() => onDelete?.(row)}
                            sx={{
                              minWidth: 0,
                              p: 0.5,
                              borderColor: alpha(theme.palette.error.main, 0.2),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                              },
                            }}
                          >
                            <DeleteIcon
                              fontSize="small"
                              sx={{ color: theme.palette.error.main }}
                            />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
              {/* Add summary row at the bottom */}
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderTop: `2px solid ${alpha(
                    theme.palette.primary.main,
                    0.1,
                  )}`,
                }}
              >
                <TableCell
                  colSpan={2}
                  sx={{
                    py: 1.5,
                    px: 2,
                    fontWeight: 600,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <GroupsIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        รวมทั้งสิ้น
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ py: 1.5, px: 2, fontWeight: 600 }}
                >
                  {/* {formatCurrency(summary?.totalGross)} */}
                </TableCell>
                <TableCell colSpan={4} />
                <TableCell
                  colSpan={4}
                  align="right"
                  sx={{
                    py: 1.5,
                    px: 2,
                    fontWeight: 600,
                    color: theme.palette.error.main,
                  }}
                >
                  หัก: {formatCurrency(summary.totalDeductions)}
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, px: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="info.main"
                  >
                    {formatCurrency(summary.totalNet)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <TablePagination
              component="div"
              count={salaryData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="แสดงต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
              }
              sx={{
                '.MuiTablePagination-toolbar': {
                  minHeight: 'auto',
                  p: 0.5,
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Card>
      </Box>
    </Fade>
  );
}
