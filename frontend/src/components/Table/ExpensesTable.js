import React from 'react';
import {
  Table,
  TableHead,
  TableContainer,
  Paper,
  TableCell,
  TableRow,
  TableBody,
  Button,
  TablePagination,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  Stack,
  Divider,
  Tooltip,
  alpha,
  Avatar,
} from '@mui/material';
import dayjs from 'dayjs';
import { PAIDTYPE_STATUS } from 'utils/constants';
import { PAID_STATUS } from '../../utils/constants';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useHistory } from 'react-router';
import _ from 'lodash';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

export default function ExpensesTable({
  expenses,
  page,
  size,
  setPage,
  setSize,
  handleEdit,
  handleDelete,
  filter,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  // ฟังก์ชันสำหรับแสดงสถานะ
  const getStatusChip = (e) => {
    if (e?.status === 'PENDING')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description || 'รอดำเนินการ'}`}
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'PREAPPROVE')
      return (
        <Chip
          label={`${
            PAID_STATUS?.[e?.status]?.description || 'รออนุมัติอีกครั้ง'
          }`}
          color="warning"
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'APPROVE')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description || 'อนุมัติแล้ว'}`}
          color="warning"
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'SUCCESS')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description || 'สำเร็จ'}`}
          color="success"
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'REJECT')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description || 'สำเร็จ'}`}
          color="error"
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'PREPARE')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description || 'สำเร็จ'}`}
          color="info"
          size="small"
          sx={{ fontWeight: 500, minWidth: 90 }}
        />
      );
    if (e?.status === 'CANCEL')
      return (
        <Chip
          size="small"
          label="Cancelled"
          sx={{ backgroundColor: 'black', color: 'white' }}
        />
      );
    if (e?.status === 'HOLD')
      return (
        <Chip
          size="small"
          label="Hold"
          sx={{ backgroundColor: 'black', color: 'white' }}
        />
      );

    return (
      <Chip
        label="ไม่ระบุ"
        size="small"
        sx={{ fontWeight: 500, minWidth: 90 }}
      />
    );
  };

  // จัดรูปแบบตัวเลขเงิน
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // แสดงสถานะว่างเปล่าเมื่อไม่มีข้อมูล
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={11} sx={{ p: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่พบข้อมูลรายจ่าย
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีข้อมูลรายจ่ายในระบบหรือไม่พบรายจ่ายตามเงื่อนไขการค้นหา
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderCardView = () => (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {filter?.map((e, index) => (
          <Grid item xs={12} key={e._id}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {e?.status && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '0 0 0 8px',
                    bgcolor:
                      e?.status === 'PENDING'
                        ? alpha(theme.palette.grey[500], 0.2)
                        : e?.status === 'APPROVE'
                        ? alpha(theme.palette.warning.main, 0.2)
                        : alpha(theme.palette.success.main, 0.2),
                  }}
                >
                  {getStatusChip(e)}
                </Box>
              )}

              <CardContent sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <ReceiptIcon
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                        fontSize="small"
                      />
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        {e?.code}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      mb={1}
                    >
                      <Box display="flex" alignItems="center">
                        <CalendarTodayIcon
                          sx={{
                            mr: 0.5,
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          สร้าง: {dayjs(e?.createdAt).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <CalendarTodayIcon
                          sx={{
                            mr: 0.5,
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          วันที่: {dayjs(e?.date).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      {e?.expenses_type && (
                        <Box display="flex" alignItems="center">
                          {e?.expenses_type === 'TRANSFER' ? (
                            <Chip
                              size="small"
                              label="เบิกเพื่อจ่าย"
                              color="primary"
                            />
                          ) : e?.expenses_type === 'REFUND' ? (
                            <Chip
                              size="small"
                              label="เบิกคืน"
                              color="secondary"
                            />
                          ) : null}
                        </Box>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        p: 1.5,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={500}>
                        <BusinessIcon
                          fontSize="small"
                          sx={{ mr: 1, verticalAlign: 'text-top' }}
                        />
                        {e?.project?.project_number || '-'}{' '}
                        {e?.project?.name || '-'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 0.5, ml: 3.5 }}
                      >
                        {e?.budget?.prefix}
                        {e?.budget?.budget_number} {e?.budget?.name || '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      รายการ
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {e?.name || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      จำนวนเงิน
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={theme.palette.success.dark}
                    >
                      {formatCurrency(e?.price)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.2,
                        )}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        ข้อมูลผู้รับเงิน
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccountBalanceIcon fontSize="small" color="action" />
                        <Typography variant="body1">
                          {e?.payee?.name || '-'}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 0.5, ml: 3.5 }}>
                        {e?.payee?.bank || '-'} -{' '}
                        {e?.payee?.account_number || '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Chip
                        label={e?.bill_pickup ? 'รับบิลแล้ว' : 'รอรับบิล'}
                        size="small"
                        color={e?.bill_pickup ? 'success' : 'error'}
                        variant="outlined"
                      />

                      <Tooltip title="รายละเอียด">
                        <IconButton
                          onClick={() =>
                            history.push(
                              `/profile/disbursement/detail/${e?._id}`,
                            )
                          }
                          sx={{
                            color: theme.palette.info.main,
                            bgcolor: alpha(theme.palette.info.main, 0.08),
                            mr: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.12),
                            },
                          }}
                          size="small"
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="อัปโหลดรูปบิล">
                        <IconButton
                          onClick={() =>
                            history.push(
                              `/profile/disbursement/detail/${e?._id}`,
                            )
                          }
                          sx={{
                            color: theme.palette.secondary.main,
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            mr: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.12),
                            },
                          }}
                          size="small"
                        >
                          <AddPhotoAlternateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {e?.status !== 'APPROVE' && e?.status !== 'SUCCESS' && (
                        <Box>
                          <Tooltip title="แก้ไข">
                            <IconButton
                              onClick={() =>
                                history.push(
                                  `/profile/disbursement/edit/${e?._id}`,
                                )
                              }
                              sx={{
                                color: theme.palette.warning.main,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                mr: 1,
                                '&:hover': {
                                  bgcolor: alpha(
                                    theme.palette.warning.main,
                                    0.2,
                                  ),
                                },
                              }}
                              size="small"
                            >
                              <ModeEditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ลบ">
                            <IconButton
                              onClick={() => handleDelete(e._id)}
                              sx={{
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2),
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 100]}
        component="div"
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        count={expenses?.total || 0}
        rowsPerPage={size}
        page={page - 1}
        labelRowsPerPage="แถวต่อหน้า:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count}`
        }
        sx={{
          '& .MuiTablePagination-toolbar': {
            height: 56,
          },
        }}
      />
    </Box>
  );

  // summary counts
  const statusCounts = _.countBy(
    filter || [],
    (item) => item?.status || 'UNKNOWN',
  );
  const countSuccess = statusCounts.SUCCESS || 0;
  const countApprove = statusCounts.APPROVE || 0;
  const countReject = statusCounts.REJECT || 0;
  const countPending = statusCounts.PENDING || 0;

  const renderSummary = () => (
    <Box sx={{ mb: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 0.5, borderRadius: 1 }}>
            <CardContent
              sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                  fontSize: '0.9rem',
                }}
              >
                <AttachMoneyIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  Success
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {countSuccess}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 0.5, borderRadius: 1 }}>
            <CardContent
              sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                  color: theme.palette.warning.main,
                }}
              >
                <ReceiptIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  Approved
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {countApprove}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 0.5, borderRadius: 1 }}>
            <CardContent
              sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: theme.palette.error.main,
                }}
              >
                <DeleteIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  Rejected
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {countReject}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 0.5, borderRadius: 1 }}>
            <CardContent
              sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.grey[500], 0.12),
                  color: theme.palette.grey[700],
                }}
              >
                <CalendarTodayIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  Pending
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {countPending}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <div>
      {isMobile ? (
        <>
          {renderSummary()}
          {renderCardView()}
        </>
      ) : (
        <>
          {renderSummary()}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow className="bg-theme-500 ">
                    <TableCell
                      width="5%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      No.
                    </TableCell>
                    <TableCell
                      width="20%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      รายละเอียดรายการ
                    </TableCell>
                    <TableCell
                      width="18%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      Project
                    </TableCell>
                    <TableCell
                      width="12%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      Item
                    </TableCell>
                    <TableCell
                      width="10%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      width="12%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      Payee
                    </TableCell>
                    <TableCell
                      width="10%"
                      sx={{ textAlign: 'center', color: 'white' }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      width="6%"
                      sx={{
                        textAlign: 'center',
                        color: 'white',
                      }}
                    >
                      Actions
                    </TableCell>
                    <TableCell width="5%"></TableCell>
                  </TableRow>
                </TableHead>

                {_.isEmpty(expenses?.rows) ? (
                  <TableBody>{renderEmptyState()}</TableBody>
                ) : (
                  <TableBody>
                    {filter?.map((e, index) => (
                      <TableRow
                        key={e._id}
                        sx={{
                          height: 76,
                          '&:nth-of-type(odd)': {
                            bgcolor: alpha(theme.palette.action.hover, 0.03),
                          },
                          '&:hover': {
                            bgcolor: alpha(theme.palette.action.hover, 0.1),
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">{index + 1}</Typography>
                        </TableCell>

                        <TableCell>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <CalendarTodayIcon
                                fontSize="small"
                                sx={{ opacity: 0.6 }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                สร้าง:
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {dayjs(e?.createdAt).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="primary"
                                gutterBottom
                              >
                                {e?.code}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                วันที่เบิก:{' '}
                                {dayjs(e?.date).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>

                            <Box>
                              {e?.expenses_type === 'TRANSFER' ? (
                                <Chip
                                  size="small"
                                  label="เบิกเพื่อจ่าย"
                                  color="primary"
                                />
                              ) : e?.expenses_type === 'REFUND' ? (
                                <Chip
                                  size="small"
                                  label="เบิกคืน"
                                  color="secondary"
                                />
                              ) : (
                                <Chip size="small" label="-" />
                              )}
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" gutterBottom>
                            {e?.project?.project_number || '-'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {e?.project?.name || '-'}
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {e?.budget?.prefix || ''}
                            {e?.budget?.budget_number || ''}{' '}
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {e?.budget?.name || '-'}
                            </span>
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" gutterBottom>
                            {e?.name || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoneyIcon
                              fontSize="small"
                              color="success"
                              sx={{ mr: 0.5, opacity: 0.7 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(e?.price)}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {e?.payee?.name || '-'}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {e?.payee?.bank || '-'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {e?.payee?.account_number
                                ? `-${e?.payee?.account_number}`
                                : ''}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack spacing={1}>
                            {getStatusChip(e)}
                            <Chip
                              label={e?.bill_pickup ? 'รับบิลแล้ว' : 'รอรับบิล'}
                              size="small"
                              color={e?.bill_pickup ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <Stack
                            spacing={1}
                            alignItems="center"
                            direction="row"
                          >
                            <Tooltip title="รายละเอียด">
                              <IconButton
                                onClick={() =>
                                  history.push(
                                    `/profile/disbursement/detail/${e?._id}`,
                                  )
                                }
                                sx={{
                                  color: theme.palette.info.main,
                                  bgcolor: alpha(theme.palette.info.main, 0.08),
                                  mr: 1,
                                  '&:hover': {
                                    bgcolor: alpha(
                                      theme.palette.info.main,
                                      0.12,
                                    ),
                                  },
                                }}
                                size="small"
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="อัปโหลดรูปบิล">
                              <IconButton
                                onClick={() =>
                                  history.push(
                                    `/profile/disbursement/detail/${e?._id}`,
                                  )
                                }
                                sx={{
                                  color: theme.palette.secondary.main,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                  mr: 1,
                                  '&:hover': {
                                    bgcolor: alpha(
                                      theme.palette.secondary.main,
                                      0.12,
                                    ),
                                  },
                                }}
                                size="small"
                              >
                                <AddPhotoAlternateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {e?.status !== 'APPROVE' &&
                              e?.status !== 'SUCCESS' && (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="center"
                                >
                                  <Tooltip title="แก้ไข">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        history.push(
                                          `/profile/disbursement/edit/${e?._id}`,
                                        )
                                      }
                                      sx={{
                                        color: theme.palette.warning.main,
                                        bgcolor: alpha(
                                          theme.palette.warning.main,
                                          0.1,
                                        ),
                                        '&:hover': {
                                          bgcolor: alpha(
                                            theme.palette.warning.main,
                                            0.2,
                                          ),
                                        },
                                      }}
                                    >
                                      <ModeEditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="ลบ">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(e._id)}
                                      sx={{
                                        color: theme.palette.error.main,
                                        bgcolor: alpha(
                                          theme.palette.error.main,
                                          0.1,
                                        ),
                                        '&:hover': {
                                          bgcolor: alpha(
                                            theme.palette.error.main,
                                            0.2,
                                          ),
                                        },
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              )}
                          </Stack>
                        </TableCell>

                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </Table>
            </TableContainer>

            <Divider />

            <TablePagination
              rowsPerPageOptions={[10, 20, 30, 100]}
              component="div"
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              count={expenses?.total || 0}
              rowsPerPage={size}
              page={page - 1}
              labelRowsPerPage="แถวต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} จาก ${count}`
              }
              sx={{
                '& .MuiTablePagination-toolbar': {
                  height: 56,
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  margin: 0,
                },
              }}
            />
          </Paper>
        </>
      )}
    </div>
  );
}
