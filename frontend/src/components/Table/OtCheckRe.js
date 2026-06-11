import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Chip,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  useMediaQuery,
  Divider,
  Grid,
  TablePagination,
} from '@mui/material';
import {
  AssignmentLate as AssignmentLateIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Assignment as ProjectIcon,
  AccessTime as ClockIcon,
  CheckCircleOutline as StatusIcon,
  AttachMoney as MoneyIcon,
  RestartAlt as ResetIcon,
  Block as CancelIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import _ from 'lodash';
import { OT_STATUS } from 'utils/constants';

export default function OtCheckRe({
  timestamp,
  renderApprove,
  renderReject,
  renderCancel,
  renderEditButton,
  renderReset,
  page,
  setPage,
  size,
  setSize,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const hasData = timestamp?.rows && timestamp.rows.length > 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const getStatusColor = (status) => {
    return OT_STATUS?.[status]?.color || 'default';
  };

  const getStatusLabel = (status) => {
    return OT_STATUS?.[status]?.status_code || status;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(value || 0);
  };

  const getRateChip = (rate) => {
    const rateConfig = {
      1: { label: 'X1', color: 'primary' },
      1.5: { label: 'X1.5', color: 'warning' },
      3: { label: 'X3', color: 'error' },
    };
    const config = rateConfig[rate] || rateConfig[1];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const ActionButtons = ({ row }) => (
    <Stack spacing={1}>
      {row?.status === 'PENDING' ? (
        <>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => renderApprove(row)}
            startIcon={<ApproveIcon />}
            fullWidth
          >
            อนุมัติ
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => renderReject(row)}
            startIcon={<RejectIcon />}
            fullWidth
          >
            ปฏิเสธ
          </Button>
        </>
      ) : (
        <>
          {row?.status !== 'CANCEL' && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => renderCancel(row)}
              startIcon={<CancelIcon />}
              fullWidth
            >
              ยกเลิก
            </Button>
          )}
          {row?.status === 'CANCEL' && (
            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={() => renderReset(row)}
              startIcon={<ResetIcon />}
              fullWidth
            >
              Reset
            </Button>
          )}
        </>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={<EditIcon />}
        onClick={() => renderEditButton(row)}
        fullWidth
      >
        แก้ไข
      </Button>
    </Stack>
  );

  if (!hasData) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <AssignmentLateIcon
            sx={{
              fontSize: 80,
              color: 'text.disabled',
              mb: 2,
              opacity: 0.5,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่มีรายการรออนุมัติ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ไม่พบข้อมูลการขอ OT ที่รออนุมัติในขณะนี้
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {timestamp.rows.map((row, index) => (
          <Card
            key={row._id || index}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  #{index + 1}
                </Typography>
                <Chip
                  label={getStatusLabel(row?.status)}
                  color={getStatusColor(row?.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Box>

            {/* Content */}
            <CardContent>
              <Grid container spacing={2}>
                {/* ผู้ทำรายการ */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        ผู้ทำรายการ
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {row?.resquester?.firstname} {row?.resquester?.lastname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row?.resquester?.department?.name || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* พนักงาน */}
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    พนักงาน
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {_.map(row?.ot_lists, (e, idx) => (
                      <Typography key={idx} variant="body2" fontWeight={500}>
                        {idx + 1}. {e?.employee_name}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>

                {/* โครงการ */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <ProjectIcon fontSize="small" color="action" />
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        โครงการ
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {row?.project?.project_number || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row?.project?.name || 'ไม่ระบุโครงการ'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* วันที่และเวลา */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ClockIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          วันที่
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {dayjs(row?.date).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimeIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          เวลา
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {dayjs(row?.startTime).format('HH:mm')} -{' '}
                          {dayjs(row?.endTime).format('HH:mm')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${row?.total_hours?.toFixed(1)} ชม.`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600, ml: 'auto' }}
                      />
                    </Box>
                  </Stack>
                </Grid>

                {/* อัตรา */}
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    อัตรา
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{getRateChip(row?.rate)}</Box>
                </Grid>

                {/* สถานะเคลม */}
                <Grid item xs={6}>
                  {row?.status_claim && (
                    <Chip
                      label="ขอโอทีย้อนหลัง"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Grid>

                {/* รายละเอียด */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    รายละเอียด
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {row?.description || 'ไม่มีรายละเอียด'}
                  </Typography>
                </Grid>

                {/* ผู้อนุมัติ */}
                {row?.approver && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      โดย {row?.approver?.firstname} {row?.approver?.lastname}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>

            {/* Actions */}
            <Box sx={{ p: 2, pt: 0 }}>
              <ActionButtons row={row} />
            </Box>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop Table View
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.primary.main,
                '& .MuiTableCell-root': {
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: 'none',
                },
              }}
            >
              <TableCell align="center" sx={{ width: 60 }}>
                #
              </TableCell>
              <TableCell sx={{ minWidth: 140 }}>ผู้ทำรายการ</TableCell>
              <TableCell sx={{ minWidth: 180 }}>พนักงาน</TableCell>
              <TableCell sx={{ minWidth: 160 }}>โครงการ</TableCell>
              <TableCell align="center" sx={{ minWidth: 180 }}>
                วันที่และเวลา
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 80 }}>
                อัตรา
              </TableCell>
              <TableCell sx={{ minWidth: 200 }}>รายละเอียด</TableCell>
              <TableCell align="center" sx={{ minWidth: 140 }}>
                สถานะ
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 160 }}>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timestamp.rows.map((row, index) => (
              <TableRow
                key={row._id || index}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              >
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {index + 1}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {row?.resquester?.firstname} {row?.resquester?.lastname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row?.resquester?.department?.name || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    {_.map(row?.ot_lists, (e, idx) => (
                      <Box key={idx}>
                        <Typography variant="body2" fontWeight={500}>
                          {idx + 1}. {e?.employee_name}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ProjectIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {row?.project?.project_number || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row?.project?.name || 'ไม่ระบุโครงการ'}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell align="center">
                  <Stack spacing={0.5} alignItems="center">
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {dayjs(row?.date).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <ClockIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        {dayjs(row?.startTime).format('HH:mm')} -{' '}
                        {dayjs(row?.endTime).format('HH:mm')}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${row?.total_hours?.toFixed(1)} ชม.`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </TableCell>

                <TableCell align="center">{getRateChip(row?.rate)}</TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    {row?.status_claim && (
                      <Chip
                        label="ขอโอทีย้อนหลัง"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {row?.description || 'ไม่มีรายละเอียด'}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell align="center">
                  <Stack spacing={0.5} alignItems="center">
                    <Chip
                      label={getStatusLabel(row?.status)}
                      color={getStatusColor(row?.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    {row?.approver ? (
                      <Typography variant="caption" color="text.secondary">
                        โดย {row?.approver?.firstname} {row?.approver?.lastname}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        รออนุมัติ
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell align="center">
                  <ActionButtons row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 30, 40, 50, 100]}
          component="div"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          count={timestamp?.total || 0}
          rowsPerPage={size}
          page={page - 1}
        />
      </TableContainer>
    </Card>
  );
}
