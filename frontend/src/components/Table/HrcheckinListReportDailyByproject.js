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
  Card,
  CardContent,
  Avatar,
  Modal,
  Box,
  IconButton,
  Typography,
  Stack,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Grid,
  Divider,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import {
  Delete as DeleteIcon,
  Edit as ModeEditIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import dayjs from 'dayjs';
import React from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function HrcheckinListReportDailyByproject({
  timestamp,
  page,
  size,
  setPage,
  setSize,
  showSalary,
  handleEditTimestamp,
  handleEdit,
  handleDeleteTimestamp,
}) {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangeRowsPerPage = (event) => {
    setSize(Number(event.target.value));
    setPage(1);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const employees = timestamp?.employees || [];
  const personsCount = employees.length;

  const totalSalaryPerDay = _.sumBy(employees, (e) => e?.salary_per_day || 0);
  const totalAllowance = _.sumBy(employees, (e) => e?.allowance || 0);
  const totalAmount = _.sumBy(employees, (e) => e?.total || 0);

  const fmt = (v) =>
    Number(v || 0)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');

  const totalColumns = showSalary ? 14 : 11;

  // Helper to get OT hours by rate from otRequests
  const getOtHoursByRate = (otRequests, rate) => {
    if (!otRequests || otRequests.length === 0) return 0;
    return _.sumBy(
      otRequests.filter((ot) => ot.rate === rate),
      (ot) => ot.total_hours || 0,
    );
  };

  // Helper to get OT data by rate
  const getOtDataByRate = (otRequests, rate) => {
    if (!otRequests || otRequests.length === 0) return null;
    return otRequests.find((ot) => ot.rate === rate);
  };

  const sumOTcost = (otRequests) => {
    if (!otRequests || otRequests?.length === 0) return 0;
    return _.sumBy(otRequests, (ot) => ot?.total_price || 0);
  };

  const getRateChip = (rate, hours, otData) => {
    const rateConfig = {
      1: { label: 'X1', color: 'primary' },
      1.5: { label: 'X1.5', color: 'warning' },
      3: { label: 'X3', color: 'error' },
    };
    const config = rateConfig[rate] || rateConfig[1];

    if (hours <= 0) return <Typography variant="body2">-</Typography>;

    return (
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="center"
      >
        <Chip
          label={`${hours.toFixed(1)} ชม.`}
          color={config.color}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        {otData && handleEdit && (
          <IconButton
            size="small"
            color={config.color}
            onClick={() => handleEdit(otData)}
          >
            <ModeEditIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    );
  };

  // Delete helper - calls parent handler if provided
  const onDelete = (employee) => {
    const ok = window.confirm(
      `ยืนยันลบรายการลงเวลาของ ${employee?.name || ''} ?`,
    );
    if (!ok) return;
    if (handleDeleteTimestamp) {
      handleDeleteTimestamp(timestamp, employee);
    } else {
      alert('Delete handler not implemented');
    }
  };

  if (!employees.length) {
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
          <PersonIcon
            sx={{
              fontSize: 80,
              color: 'text.disabled',
              mb: 2,
              opacity: 0.5,
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่มีข้อมูลพนักงาน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ไม่พบข้อมูลการลงเวลาในวันนี้
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {employees.map((e, index) => {
          const otX1 = getOtHoursByRate(e?.otRequests, 1);
          const otX15 = getOtHoursByRate(e?.otRequests, 1.5);
          const otX3 = getOtHoursByRate(e?.otRequests, 3);

          const otX1Data = getOtDataByRate(e?.otRequests, 1);
          const otX15Data = getOtDataByRate(e?.otRequests, 1.5);
          const otX3Data = getOtDataByRate(e?.otRequests, 3);

          return (
            <Card
              key={e?._id || index}
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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {e?.name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rate: {e?.rate ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                  {e?.out_of_location && (
                    <Chip
                      label="Out of Location"
                      color="error"
                      size="small"
                      icon={<WarningIcon />}
                    />
                  )}
                </Stack>
                {e?.out_of_location && e?.note && (
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Note: {e.note}
                  </Typography>
                )}
              </Box>

              {/* Content */}
              <CardContent>
                <Grid container spacing={2}>
                  {/* เวลาเข้า-ออก */}
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary">
                            Check In
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {e?.checkIn
                              ? dayjs(e.checkIn).format('HH:mm')
                              : '-'}
                          </Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary">
                            Check Out
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {e?.checkOut
                              ? dayjs(e.checkOut).format('HH:mm')
                              : '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* OT */}
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      ชั่วโมง OT
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">OT X1:</Typography>
                        {getRateChip(1, otX1, otX1Data)}
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">OT X1.5:</Typography>
                        {getRateChip(1.5, otX15, otX15Data)}
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">OT X3:</Typography>
                        {getRateChip(3, otX3, otX3Data)}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>

              {/* Actions */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    disabled={e?.status_payroll}
                    onClick={() => onDelete(e)}
                  >
                    ลบ
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ModeEditIcon />}
                    color="primary"
                    disabled={e?.status_payroll}
                    onClick={() => handleEditTimestamp(timestamp, e)}
                    sx={{ flex: 1 }}
                  >
                    แก้ไข
                  </Button>
                </Stack>
              </Box>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // Desktop Table View
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.primary.main,
                '& .MuiTableCell-root': {
                  color: 'white',
                  fontWeight: 600,
                  borderBottom: 'none',
                  py: 1.5,
                },
              }}
            >
              <TableCell align="center" sx={{ width: 60 }}>
                #
              </TableCell>
              <TableCell sx={{ minWidth: 180 }}>พนักงาน</TableCell>
              <TableCell align="center" sx={{ minWidth: 100 }}>
                Check In
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 100 }}>
                Check Out
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 80 }}>
                Rate
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 120 }}>
                OT X1
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 120 }}>
                OT X1.5
              </TableCell>
              <TableCell align="center" sx={{ minWidth: 120 }}>
                OT X3
              </TableCell>
              {showSalary && (
                <>
                  <TableCell align="center" sx={{ minWidth: 120 }}>
                    Labour Cost
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 120 }}>
                    Allowance
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 120 }}>
                    OT Cost
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 120 }}>
                    Total
                  </TableCell>
                </>
              )}
              <TableCell align="center" sx={{ minWidth: 120 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map((e, index) => {
              const otX1 = getOtHoursByRate(e?.otRequests, 1);
              const otX15 = getOtHoursByRate(e?.otRequests, 1.5);
              const otX3 = getOtHoursByRate(e?.otRequests, 3);

              const otX1Data = getOtDataByRate(e?.otRequests, 1);
              const otX15Data = getOtDataByRate(e?.otRequests, 1.5);
              const otX3Data = getOtDataByRate(e?.otRequests, 3);

              return (
                <TableRow
                  key={e?._id || index}
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
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={500}>
                        {e?.name || '-'}
                      </Typography>
                      {e?.out_of_location && (
                        <>
                          <Chip
                            label="Out of Location"
                            color="error"
                            size="small"
                            icon={<WarningIcon />}
                          />
                          {e?.note && (
                            <Typography variant="caption" color="error.main">
                              Note: {e.note}
                            </Typography>
                          )}
                        </>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2">
                      {e?.checkIn ? dayjs(e.checkIn).format('HH:mm') : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2">
                      {e?.checkOut ? dayjs(e.checkOut).format('HH:mm') : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={e?.rate ?? '-'}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    {getRateChip(1, otX1, otX1Data)}
                  </TableCell>

                  <TableCell align="center">
                    {getRateChip(1.5, otX15, otX15Data)}
                  </TableCell>

                  <TableCell align="center">
                    {getRateChip(3, otX3, otX3Data)}
                  </TableCell>

                  {showSalary && (
                    <>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {typeof e?.salary_per_day === 'number'
                            ? fmt(e.salary_per_day)
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {typeof e?.allowance === 'number'
                            ? fmt(e.allowance)
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {sumOTcost(e?.otRequests).toFixed(2) || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {typeof e?.total === 'number' ? fmt(e.total) : '-'}
                        </Typography>
                      </TableCell>
                    </>
                  )}

                  <TableCell
                    align="center"
                    sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}
                  >
                    {/* <Tooltip title="ลบรายการ">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(e)}
                          disabled={e?.status_payroll}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip> */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ModeEditIcon />}
                      disabled={e?.status_payroll}
                      color="primary"
                      onClick={() => handleEditTimestamp(timestamp, e)}
                    >
                      แก้ไข
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Summary Row */}
            <TableRow
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  borderTop: '2px solid',
                  borderColor: 'primary.main',
                },
              }}
            >
              <TableCell colSpan={showSalary ? 8 : 8} align="right">
                <Typography variant="body2" fontWeight={600}>
                  รวมทั้งหมด: {personsCount} คน
                </Typography>
              </TableCell>
              {showSalary && (
                <>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {fmt(totalSalaryPerDay)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {fmt(totalAllowance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      -
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary"
                    >
                      {fmt(totalAmount)}
                    </Typography>
                  </TableCell>
                </>
              )}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
