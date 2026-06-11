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
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  TablePagination,
  useMediaQuery,
} from '@mui/material';
import dayjs from 'dayjs';
import { OT_STATUS } from 'utils/constants';
import _ from 'lodash';

export default function OtRequestTable({
  otRequest,
  handleOnclickDetail,
  page,
  setPage,
  size,
  setSize,
  handleDelete,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasData = otRequest?.rows && otRequest.rows.length > 0;

  const calculateHours = (startTime, endTime) => {
    return dayjs(endTime).diff(dayjs(startTime), 'hour', true).toFixed(1);
  };

  const getStatusColor = (status) => {
    return OT_STATUS?.[status]?.color || 'default';
  };

  const getStatusLabel = (status) => {
    return OT_STATUS?.[status]?.status_code || status;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  if (!hasData) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
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

  // --- Mobile Card View ---
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {otRequest.rows.map((row, index) => (
          <Card
            key={row.id}
            variant="outlined"
            sx={{ borderRadius: 3, p: 0, overflow: 'hidden' }}
          >
            {/* Status Bar */}
            <Box
              sx={{
                bgcolor: OT_STATUS?.[row?.status]?.color
                  ? theme.palette[OT_STATUS[row.status].color].main
                  : theme.palette.grey[300],
                px: 2,
                py: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Chip
                label={getStatusLabel(row?.status)}
                color={getStatusColor(row?.status)}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  bgcolor: 'inherit',
                  color: '#fff',
                }}
              />
              {row?.approver ? (
                <Typography
                  variant="caption"
                  fontWeight={500}
                  sx={{
                    color: '#fff',
                    fontSize: '0.85rem',
                    ml: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                  }}
                >
                  {row?.approver?.firstname} {row?.approver?.lastname}
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: '#fff', fontSize: '0.85rem', ml: 1 }}
                >
                  รออนุมัติ
                </Typography>
              )}
            </Box>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.2}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  fontWeight={700}
                >
                  #{index + 1} {row?.project?.project_number || 'N/A'} -{' '}
                  {row?.project?.name}
                </Typography>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    ผู้ทำรายการ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row?.resquester?.firstname} {row?.resquester?.lastname}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    พนักงาน
                  </Typography>
                  <Stack spacing={0.5}>
                    {_?.map(row?.ot_lists, (e, idx) => (
                      <Typography
                        key={e?._id || idx}
                        variant="body2"
                        color={theme.palette.text.primary}
                      >
                        {idx + 1}. {e?.employee_name}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    รายละเอียด
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row?.description || 'ไม่มีรายละเอียด'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      เวลา
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {dayjs(row?.startTime).format('HH:mm')} -{' '}
                      {dayjs(row?.endTime).format('HH:mm')}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${calculateHours(
                      row?.startTime,
                      row?.endTime,
                    )} ชม.`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 500, minWidth: 70 }}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleDelete(row?._id)}
                  sx={{ mt: 1, alignSelf: 'flex-end' }}
                >
                  ลบ
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // --- Desktop Table View ---
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
              <TableCell
                sx={{ color: '#FFFFFF', width: 60, minWidth: 60, maxWidth: 70 }}
              >
                ลำดับ
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 120,
                  minWidth: 100,
                  maxWidth: 140,
                }}
              >
                ผู้ทำรายการ
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 160,
                  minWidth: 120,
                  maxWidth: 180,
                }}
              >
                พนักงาน
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 120,
                  minWidth: 100,
                  maxWidth: 140,
                }}
              >
                โปรเจค
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 180,
                  minWidth: 140,
                  maxWidth: 220,
                }}
              >
                รายละเอียด
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 110,
                  minWidth: 90,
                  maxWidth: 120,
                }}
              >
                วันที่
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 110,
                  minWidth: 90,
                  maxWidth: 120,
                }}
              >
                เวลา
              </TableCell>
              <TableCell
                sx={{
                  color: '#FFFFFF',
                  width: 120,
                  minWidth: 100,
                  maxWidth: 140,
                }}
              >
                สถานะ / ผู้อนุมัติ
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: '#FFFFFF', width: 80, minWidth: 60, maxWidth: 90 }}
              >
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otRequest.rows.map((row, index) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                {/* ลำดับ */}
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {index + 1}
                  </Typography>
                </TableCell>

                {/* ผู้ทำรายการ */}
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={theme.palette.text.primary}
                  >
                    {row?.resquester?.firstname} {row?.resquester?.lastname}
                  </Typography>
                </TableCell>

                {/* พนักงาน */}
                <TableCell>
                  <Box>
                    {_?.map(row?.ot_lists, (e, idx) => (
                      <Typography
                        key={e?._id || idx}
                        variant="body2"
                        fontWeight={500}
                        color={theme.palette.text.primary}
                      >
                        {idx + 1}. {e?.employee_name}
                      </Typography>
                    ))}
                  </Box>
                </TableCell>

                {/* โปรเจค */}
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color={theme.palette.info.main}
                    >
                      {row?.project?.project_number || 'N/A'}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={theme.palette.text.secondary}
                    >
                      {row?.project?.name || 'ไม่ระบุโปรเจค'}
                    </Typography>
                  </Box>
                </TableCell>

                {/* รายละเอียด */}
                <TableCell>
                  {row?.status_claim && (
                    <div>
                      <Chip
                        label={'ขอโอทีย้อนหลัง'}
                        size="small"
                        color="error"
                      />
                    </div>
                  )}
                  สาเหตุ: {row?.description || 'ไม่มีรายละเอียด'}
                </TableCell>

                {/* ช่วงเวลา */}
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={theme.palette.success.main}
                  >
                    {dayjs(row?.date).format('DD/MM/BBBB')}
                  </Typography>
                </TableCell>

                {/* จำนวนชั่วโมง */}
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={theme.palette.success.main}
                  >
                    {dayjs(row?.startTime).format('HH:mm')} -{' '}
                    {dayjs(row?.endTime).format('HH:mm')}
                  </Typography>
                  <Chip
                    label={`${row?.total_hours} ชม.`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>

                {/* สถานะ / ผู้อนุมัติ */}
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip
                      label={getStatusLabel(row?.status)}
                      color={getStatusColor(row?.status)}
                      size="small"
                      variant="filled"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {row?.approver ? (
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        sx={{
                          fontSize: '0.7rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 120,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {row?.approver?.firstname} {row?.approver?.lastname}
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        color={theme.palette.text.disabled}
                        sx={{ fontSize: '0.7rem' }}
                      >
                        รออนุมัติ
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                {/* ปุ่มจัดการ */}
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleDelete(row?._id)}
                    disabled={
                      row?.status_approve?.approve && row?.status !== 'CANCEL'
                    }
                  >
                    ลบ
                  </Button>
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
          count={otRequest?.total || 0}
          rowsPerPage={size}
          page={page - 1}
        />
      </TableContainer>
    </Card>
  );
}
