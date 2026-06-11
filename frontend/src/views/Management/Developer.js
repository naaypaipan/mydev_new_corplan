import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';

import * as actions from '../../redux/actions';
import UpdateLabourTimestamp from '../../components/Forms/UpdateLabourTimestamp';
import api from '../../utils/functions/api';

const ACTION_COLOR = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
};

export default function Developer() {
  const dispatch = useDispatch();
  const employee = useSelector((state) => state.employee);
  const [form, setForm] = useState({
    userId: '',
    salary_month: '',
    salary_day: '',
    salary_hour: '',
  });
  const [extraForm, setExtraForm] = useState({
    month: '',
    day: '',
  });

  const [activityRows, setActivityRows] = useState([]);
  const [activityCount, setActivityCount] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityModule, setActivityModule] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 50;

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [activityError, setActivityError] = useState('');

  const apiBase = String(process.env.REACT_APP_API_URL || '').trim();

  const fetchActivityLog = useCallback(async () => {
    setActivityLoading(true);
    setActivityError('');
    try {
      const qs = new URLSearchParams({
        page: String(activityPage),
        size: String(activityPageSize),
      });
      if (activityModule) qs.set('module', activityModule);
      const { data, status } = await api.get(
        `${apiBase}/activity-log?${qs.toString()}`,
      );
      if (status === 200 && data) {
        setActivityRows(data.rows || []);
        setActivityCount(data.count ?? 0);
      }
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        'โหลด log ไม่สำเร็จ';
      setActivityError(String(msg));
      setActivityRows([]);
      setActivityCount(0);
    } finally {
      setActivityLoading(false);
    }
  }, [activityModule, activityPage, apiBase]);

  useEffect(() => {
    dispatch(actions.employeeAll({}));
  }, [dispatch]);

  useEffect(() => {
    fetchActivityLog();
  }, [fetchActivityLog]);

  const onSave = () => {
    const payload = {
      salary: {
        month: Number(form.salary_month),
        day: Number(form.salary_day),
        hr: Number(form.salary_day / 8),
      },
    };
    dispatch(actions.timestampPutSalary(form.userId, payload));
  };

  const onSaveExtra = () => {
    const payload = {
      salary_extra: {
        month: Number(extraForm.month),
        day: Number(extraForm.day),
      },
    };
    dispatch(actions.timestampPutSalary(form.userId, payload));
  };

  const openDetail = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
  };

  const renderUpdateSalary = () => (
    <div>
      <UpdateLabourTimestamp
        employee={employee?.rows}
        form={form}
        setForm={setForm}
        onSave={onSave}
        onSaveExtra={onSaveExtra}
        setExtraForm={setExtraForm}
        extraForm={extraForm}
      />
    </div>
  );

  return (
    <div>
      {renderUpdateSalary()}

      <Card sx={{ mt: 3 }} variant="outlined">
        <CardHeader
          title="บันทึกกิจกรรม HR / Finance"
          subheader="ย้อนหลังการสร้าง แก้ไข ลบรายการลงเวลาและค่าใช้จ่าย (รวม IP และ user จาก token เมื่อมี)"
        />
        <CardContent>
          {activityError ? (
            <Typography color="error" sx={{ mb: 2 }}>
              {activityError}
              {apiBase ? '' : ' (ยังไม่ได้ตั้ง REACT_APP_API_URL)'}
            </Typography>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              select
              label="โมดูล"
              size="small"
              value={activityModule}
              onChange={(e) => {
                setActivityPage(1);
                setActivityModule(e.target.value);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="FINANCE">Finance</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={fetchActivityLog} disabled={activityLoading}>
              รีเฟรช
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              ทั้งหมด {activityCount} รายการ
            </Typography>
          </Stack>

          {activityLoading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                maxHeight: 420,
                overflow: 'auto',
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>เวลา</TableCell>
                    <TableCell>โมดูล</TableCell>
                    <TableCell>ทรัพยากร</TableCell>
                    <TableCell>การกระทำ</TableCell>
                    <TableCell>ผู้ทำ (user)</TableCell>
                    <TableCell>สรุป</TableCell>
                    <TableCell align="right">รายละเอียด</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary">ยังไม่มี log</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityRows.map((row) => (
                      <TableRow key={row._id}>
                        <TableCell>
                          {row.createdAt
                            ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm:ss')
                            : '-'}
                        </TableCell>
                        <TableCell>{row.module}</TableCell>
                        <TableCell>{row.resourceType}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.action}
                            color={ACTION_COLOR[row.action] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {row.actorUsername || '-'}
                          {row.ip ? (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {row.ip}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
                          <Typography variant="body2" noWrap title={row.summary}>
                            {row.summary || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openDetail(row)}>
                            JSON
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activityCount > activityPageSize ? (
            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
              <Button
                size="small"
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
              >
                ก่อนหน้า
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                หน้า {activityPage}
              </Typography>
              <Button
                size="small"
                disabled={activityPage * activityPageSize >= activityCount}
                onClick={() => setActivityPage((p) => p + 1)}
              >
                ถัดไป
              </Button>
            </Stack>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียด log</DialogTitle>
        <DialogContent dividers>
          {detailRow ? (
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(
                {
                  _id: detailRow._id,
                  module: detailRow.module,
                  resourceType: detailRow.resourceType,
                  action: detailRow.action,
                  resourceId: detailRow.resourceId,
                  summary: detailRow.summary,
                  actorUserId: detailRow.actorUserId,
                  actorUsername: detailRow.actorUsername,
                  ip: detailRow.ip,
                  userAgent: detailRow.userAgent,
                  before: detailRow.before,
                  after: detailRow.after,
                  meta: detailRow.meta,
                  createdAt: detailRow.createdAt,
                },
                null,
                2,
              )}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
