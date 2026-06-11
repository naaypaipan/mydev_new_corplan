import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Card,
  Button,
} from '@mui/material';
import _ from 'lodash';

// Icons
import {
  Launch as LaunchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Description as DescriptionIcon,
  AccountBalance as AccountBalanceIcon,
  Paid as PaidIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

const paymentStatusMap = {
  PENDING: { label: 'รอจ่ายเงิน', color: 'warning' },
  SUCCESS: { label: 'จ่ายแล้ว', color: 'success' },
  pending: { label: 'รอดำเนินการ', color: 'warning' },
  approved: { label: 'อนุมัติแล้ว', color: 'success' },
  paid: { label: 'จ่ายแล้ว', color: 'info' },
};

// Row component แสดงรายการเบิกจ่าย
function PaymentRow({
  payment,
  index,
  handleOnclickDetail,
  onClickDelete,
  onCompletePayment,
  onPrintPayment,
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const status = payment?.status || 'PENDING';
  const statusConfig = paymentStatusMap[status] || paymentStatusMap.PENDING;
  const canComplete = status !== 'SUCCESS' && typeof onCompletePayment === 'function';
  const canPrint = typeof onPrintPayment === 'function';

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        ...(showTime && { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <TableRow
        hover
        sx={{
          '&:nth-of-type(odd)': {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
          height: 60,
        }}
      >
        {/* ลำดับ */}
        <TableCell
          align="center"
          width={60}
          onClick={() => handleOnclickDetail(payment?._id)}
        >
          <Typography variant="body2">{index + 1}</Typography>
        </TableCell>

        {/* วันที่ขอรับ/จ่าย */}
        <TableCell onClick={() => handleOnclickDetail(payment?._id)}>
          <Stack spacing={0.5}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                ขอรับ
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(payment?.dateRequest)}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                จ่าย
              </Typography>
              <Typography variant="body2">
                {formatDate(payment?.datePayment) || '-'}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        {/* วันที่ทำรายการ */}
        <TableCell onClick={() => handleOnclickDetail(payment._id)}>
          <Typography variant="body2">
            {formatDate(payment?.createdAt, true)}
          </Typography>
        </TableCell>

        {/* ประเภท */}
        <TableCell onClick={() => handleOnclickDetail(payment._id)}>
          <Chip
            size="small"
            label={payment?.pay_type?.name || payment?.pay_type || '-'}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.main',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>

        {/* ผู้ขอเบิก */}
        <TableCell onClick={() => handleOnclickDetail(payment._id)}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
            <Typography variant="body2">
              {payment?.requester?.firstname
                ? `${payment?.requester?.firstname} ${
                    payment?.requester?.lastname || ''
                  }`
                : '-'}
            </Typography>
          </Stack>
        </TableCell>

        {/* ผู้รับเงิน/ธนาคาร */}
        <TableCell onClick={() => handleOnclickDetail(payment._id)}>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={500}>
              {payment?.payee?.name || '-'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccountBalanceIcon
                sx={{ fontSize: 14, color: 'text.secondary' }}
              />
              <Typography variant="caption" color="text.secondary">
                {payment?.payee?.bank || '-'}{' '}
                {payment?.payee?.account_number || ''}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>

        {/* ยอดเงิน / สถานะ */}
        <TableCell onClick={() => handleOnclickDetail(payment._id)}>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(payment?.totalAmount || 0)}
            </Typography>
            <Chip
              size="small"
              label={statusConfig.label}
              color={statusConfig.color}
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        </TableCell>

        {/* รายละเอียด / จ่ายเงิน / ลบ */}
        <TableCell align="center">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0.75}
            justifyContent="center"
            alignItems="center"
            sx={{ minWidth: { xs: 120, sm: 180 } }}
          >
            <Stack direction="row" spacing={0.25} justifyContent="center">
              <Tooltip title={open ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
                >
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Tooltip>

              {canPrint && (
                <Tooltip title="พิมพ์ PDF">
                  <IconButton
                    aria-label="print pdf"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintPayment(payment);
                    }}
                  >
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="ลบรายการ">
                <IconButton
                  aria-label="delete"
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickDelete(payment?._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            {canComplete && (
              <Tooltip title="จ่ายเงิน + อัปโหลดสลิป">
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<PaidIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompletePayment(payment);
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    minWidth: { xs: 120, sm: 110 },
                    width: { xs: '100%', sm: 'auto' },
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  จ่ายเงิน
                </Button>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      {/* Collapsible section สำหรับแสดงรายละเอียดเพิ่มเติม */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                py: 2,
                px: 3,
                bgcolor: alpha(theme.palette.background.default, 0.7),
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                รายการเบิกจ่าย
              </Typography>

              {payment?.status === 'SUCCESS' && payment?.slip && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    สลิปการโอน
                  </Typography>
                  <Box
                    component="img"
                    src={payment.slip?.url || payment.slip?.src}
                    alt="สลิป"
                    sx={{ maxWidth: 200, maxHeight: 150, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  />
                </Box>
              )}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell align="center" width={50}>
                        ลำดับ
                      </TableCell>
                      <TableCell>รายการ</TableCell>
                      <TableCell>งบประมาณ/โครงการ</TableCell>
                      <TableCell align="right">จำนวนเงิน</TableCell>
                      <TableCell align="right">VAT</TableCell>
                      <TableCell align="right">หัก ณ ที่จ่าย</TableCell>
                      <TableCell align="right">ยอดรวม</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payment?.expenses_list?.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item?.name || '-'}
                          </Typography>
                          {item?.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {item?.budget && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccountBalanceIcon
                                  sx={{ fontSize: 14, color: 'text.secondary' }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item?.budget?.prefix}{' '}
                                  {item?.budget?.budget_number}
                                </Typography>
                              </Box>
                            )}
                            {item?.project && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <DescriptionIcon
                                  sx={{ fontSize: 14, color: 'text.secondary' }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item?.project?.project_number}
                                </Typography>
                              </Box>
                            )}
                            {!item?.budget && !item?.project && '-'}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item?.price || 0)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: item?.vat ? 'error.main' : 'inherit' }}
                        >
                          {item?.vat ? `+${formatCurrency(item?.vat)}` : '-'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: item?.tax ? 'primary.main' : 'inherit' }}
                        >
                          {item?.tax ? `-${formatCurrency(item?.tax)}` : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item?.total || item?.price || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!payment?.expenses_list ||
                      payment?.expenses_list.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ py: 2, color: 'text.secondary' }}
                        >
                          ไม่พบรายการ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function PaymentListTable({
  payments,
  handleOnclickDetail,
  onClickDelete,
  onCompletePayment,
  onPrintPayment,
  page,
  setPage,
  size,
  setSize,
}) {
  const theme = useTheme();

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <Card elevation={0} variant="outlined">
      <TableContainer>
        <Table size="medium" aria-label="payment list table">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.primary.main,
              }}
            >
              <TableCell align="center" width={60}>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  ลำดับ
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  วันที่ขอรับ/จ่าย
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  วันที่ทำรายการ
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  ประเภท
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  ผู้ขอเบิก
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  ผู้รับเงิน/ธนาคาร
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  หมายเลขเอกสาร/ยอดเงิน
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2" fontWeight={600} color="white">
                  รายละเอียด
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {_.isEmpty(payments?.rows) ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      ไม่พบข้อมูลรายการเบิกจ่าย
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      ยังไม่มีรายการเบิกจ่ายในระบบ
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              _.map(payments?.rows, (payment, index) => (
                <PaymentRow
                  key={payment._id}
                  payment={payment}
                  index={index + (page - 1) * size}
                  handleOnclickDetail={handleOnclickDetail}
                  onClickDelete={onClickDelete}
                  onCompletePayment={onCompletePayment}
                  onPrintPayment={onPrintPayment}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={payments?.total || 0}
        rowsPerPage={size}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="แสดง"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
    </Card>
  );
}
