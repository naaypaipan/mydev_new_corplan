import React from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Divider,
  Chip,
  useTheme,
  alpha,
  Card,
  CardContent,
  Table,
  TableHead,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Checkbox,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const _ = require('lodash');

export default function DirectApproveExpensesTable({
  expenses = [],
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onApprove,
  onApproveMultiple,
  onHold,
  onReset,
  checkColor,
  isMobile,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={
                expenses.length > 0 && selectedRows.length === expenses.length
              }
              indeterminate={
                selectedRows.length > 0 && selectedRows.length < expenses.length
              }
              onChange={onSelectAll}
              size="small"
            />
            <Typography variant="body2">เลือกทั้งหมด</Typography>
          </Box>

          {selectedRows.length > 0 && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={onApproveMultiple}
            >
              อนุมัติ ({selectedRows.length})
            </Button>
          )}
        </Stack>
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {_.isEmpty(expenses) ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                ไม่มีรายการรอการอนุมัติ
              </Typography>
            </Box>
          ) : (
            expenses.map((e) => (
              <Card key={e._id} sx={{ position: 'relative' }}>
                <Checkbox
                  checked={selectedRows.some((row) => row._id === e._id)}
                  onChange={() => onSelectRow(e)}
                  size="small"
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                />
                <CardContent sx={{ pl: 5 }}>
                  {/* Code & Date */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      เอกสาร
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        className="text-theme-600"
                      >
                        {e?.code}
                      </Typography>
                      <Box>{checkColor(e.status)}</Box>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {dayjs(e?.date).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>

                  {/* Project & Budget */}
                  <Box sx={{ mb: 2, borderTop: '1px solid #eee', pt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      โครงการ
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {e?.project?.project_number}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {e?.budget?.prefix}
                      {e?.budget?.budget_number} {e?.budget?.name}
                    </Typography>
                  </Box>

                  {/* Order & Amount */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      รายการ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{e?.name}</Typography>
                      <IconButton size="small" sx={{ p: 0 }}>
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Amount */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      จำนวนเงิน
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      ฿
                      {e?.price
                        ?.toFixed(0)
                        .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                    </Typography>
                  </Box>

                  {/* Applicant */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      ผู้ขอ
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {e?.employee?.firstname} {e?.employee?.lastname}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Divider sx={{ my: 2 }} />
                  {e?.status === 'PREAPPROVE' ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onApprove(e._id)}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        startIcon={<CancelIcon />}
                        onClick={() => onHold(e._id)}
                      >
                        คงไว้
                      </Button>
                    </Stack>
                  ) : e?.status === 'APPROVE' || e?.status === 'HOLD' ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      fullWidth
                      onClick={() => onReset(e._id)}
                    >
                      รีเซ็ต
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell align="center" sx={{ color: 'white' }}>
                  <Checkbox
                    checked={
                      expenses.length > 0 &&
                      selectedRows.length === expenses.length
                    }
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < expenses.length
                    }
                    onChange={onSelectAll}
                    size="small"
                    sx={{ '& .MuiCheckbox-root': { color: 'white' } }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  เอกสาร
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  วันที่
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  โครงการ
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  งบประมาณ
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  รายการ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  จำนวนเงิน
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  ผู้ขอ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  สถานะ
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  การดำเนิน
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.isEmpty(expenses) ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      ไม่มีรายการรอการอนุมัติ
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e, index) => (
                  <TableRow key={e._id} hover>
                    <TableCell align="center">
                      <Checkbox
                        checked={selectedRows.some((row) => row._id === e._id)}
                        onChange={() => onSelectRow(e)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: theme.palette.primary.main,
                      }}
                    >
                      {e?.code}
                    </TableCell>
                    <TableCell>{dayjs(e?.date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>{e?.project?.project_number}</TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {e?.budget?.prefix}
                        {e?.budget?.budget_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {e?.budget?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Typography variant="body2">{e?.name}</Typography>
                        <IconButton size="small" sx={{ p: 0 }}>
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 'bold', color: 'success.main' }}
                    >
                      ฿
                      {e?.price
                        ?.toFixed(0)
                        .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {e?.employee?.firstname} {e?.employee?.lastname}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {checkColor(e?.status)}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {e?.status === 'PREAPPROVE' ? (
                          <>
                            <Tooltip title="อนุมัติ">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => onApprove(e._id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="คงไว้">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onHold(e._id)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : e?.status === 'APPROVE' || e?.status === 'HOLD' ? (
                          <Tooltip title="รีเซ็ต">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => onReset(e._id)}
                            >
                              <RestartAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
