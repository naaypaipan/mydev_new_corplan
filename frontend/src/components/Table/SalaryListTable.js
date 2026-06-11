import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  useTheme,
  alpha,
  Card,
  Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import _ from 'lodash';

export default function SalaryListTable({
  salary = [],
  handleDelete,
  handleDetail,
  payrollReport,
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data หากไม่มีข้อมูล
  const mockSalaryData = [];

  const salaryData = salary.length > 0 ? salary : mockSalaryData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
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

  const getStatusChip = (status) => {
    const statusConfig = {
      draft: { label: 'ร่าง', color: 'default' },
      pending: { label: 'รอการอนุมัติ', color: 'warning' },
      approved: { label: 'อนุมัติแล้ว', color: 'info' },
      paid: { label: 'จ่ายแล้ว', color: 'success' },
      cancelled: { label: 'ยกเลิก', color: 'error' },
    };

    const config = statusConfig[status] || {
      label: 'ไม่ทราบ',
      color: 'default',
    };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

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
      <Card variant="outlined">
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่พบข้อมูลเงินเดือน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีการบันทึกข้อมูลเงินเดือนในระบบ
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                <TableCell
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 80 }}
                >
                  ลำดับ
                </TableCell>
                <TableCell
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 80 }}
                >
                  รหัสรายการ
                </TableCell>
                <TableCell
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 200 }}
                >
                  ช่วงที่จ่าย
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 140 }}
                >
                  ค่าใช้จ่ายรวม
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 140 }}
                >
                  ประเภทพนักงาน
                </TableCell>
                {/* <TableCell
                  align="center"
                  sx={{ fontWeight: 600, minWidth: 120 }}
                >
                  สถานะเอกสาร
                </TableCell> */}
                <TableCell
                  align="center"
                  sx={{ color: '#FFFFFF', fontWeight: 600, minWidth: 150 }}
                >
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={row._id}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  {/* ลำดับ */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {page * rowsPerPage + index + 1}
                    </Typography>
                  </TableCell>

                  {/* รหัสรายการ */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row?.code}
                    </Typography>
                  </TableCell>

                  {/* ช่วงที่จ่าย */}
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(row.dateStart)} - {formatDate(row.dateEnd)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(row.dateStart).format('MMMM YYYY')}
                      </Typography>
                      {row.documentNumber && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          เลขที่: {row.documentNumber}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* ค่าใช้จ่ายรวม */}
                  <TableCell align="right">
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {formatCurrency(_.sumBy(row.salaryData, (o) => o?.total))}
                    </Typography>
                  </TableCell>
                  {/* ประเภทพนักงาน */}
                  <TableCell align="right">
                    <Typography variant="body1">
                      {row.role_type === 'FULLTIME'
                        ? 'พนักงานรายเดือน'
                        : 'พนักงานรายวัน'}
                    </Typography>
                  </TableCell>

                  {/* สถานะเอกสาร
                  <TableCell align="center">
                    {getStatusChip(row.status)}
                  </TableCell> */}

                  {/* ปุ่มจัดการ */}
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDetail(row._id)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* <Tooltip title="แก้ไข">
                        <IconButton
                          size="small"
                          color="warning"
                          disabled={
                            row.status === 'paid' || row.status === 'cancelled'
                          }
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip> */}

                      <Tooltip title="พิมพ์">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => payrollReport(row)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                          }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* <Tooltip title="ดาวน์โหลด">
                        <IconButton
                          size="small"
                          color="success"
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip> */}

                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={row.status === 'paid'}
                          onClick={() => handleDelete(row._id)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
        />
      </Card>
    </Box>
  );
}
