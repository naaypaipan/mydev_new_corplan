import React, { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  TextField,
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Stack,
  Avatar,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import {
  Business,
  Link as LinkIcon,
  Notifications,
  Settings,
  TableChart,
} from '@mui/icons-material';
import api from '../../utils/functions/api';

export default function EditInformationForm({
  errors,
  info,
  Controller,
  control,
}) {
  const theme = useTheme();
  const [sheetOptions, setSheetOptions] = useState([]);

  useEffect(() => {
    api
      .get(`${process.env.REACT_APP_API_URL}/google-sheet/sheets`)
      .then((res) => setSheetOptions(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setSheetOptions([]));
  }, []);

  const SectionHeader = ({ icon, title }) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          width: 40,
          height: 40,
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="h6" fontWeight={600} color="primary">
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* ข้อมูลบริษัท */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SectionHeader icon={<Business />} title="ข้อมูลบริษัท" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              defaultValue={info ? info.name : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ชื่อบริษัท (ไทย)"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.name}
                  helperText={errors?.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="name_eng"
              control={control}
              defaultValue={info ? info.name_eng : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ชื่อบริษัท (English)"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.name_eng}
                  helperText={errors?.name_eng?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="tax_id"
              control={control}
              defaultValue={info ? info.tax_id : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="เลขประจำตัวผู้เสียภาษี"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.tax_id}
                  helperText={errors?.tax_id?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="url"
              control={control}
              defaultValue={info ? info.url : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL ระบบ"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.url}
                  helperText={errors?.url?.message}
                  placeholder="https://example.com"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* การตั้งค่า LINE Notify */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SectionHeader
          icon={<Notifications />}
          title="การตั้งค่า LINE Notify"
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              LINE Notify สำหรับการลงเวลา
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="line_notify_checkin.group"
              control={control}
              defaultValue={info ? info?.line_notify_checkin?.group : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LINE Group ID (Check-in)"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.line_notify_checkin?.group}
                  helperText={errors?.line_notify_checkin?.group?.message}
                  placeholder="Cxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="line_notify_checkin.token"
              control={control}
              defaultValue={info ? info?.line_notify_checkin?.token : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LINE Token (Check-in)"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.line_notify_checkin?.token}
                  helperText={errors?.line_notify_checkin?.token?.message}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2, mt: 2 }}
            >
              LINE Notify สำหรับค่าใช้จ่าย
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="line_token_group_Expenses"
              control={control}
              defaultValue={info ? info.line_token_group_Expenses : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LINE Token (Expenses)"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.line_token_group_Expenses}
                  helperText={errors?.line_token_group_Expenses?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="line_token_id"
              control={control}
              defaultValue={info ? info?.line_token_id : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="LINE Token ID"
                  required
                  fullWidth
                  size="small"
                  error={!!errors?.line_token_id}
                  helperText={errors?.line_token_id?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* การตั้งค่าเงินเดือน / ประกันสังคม */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SectionHeader icon={<Settings />} title="การตั้งค่าเงินเดือน / ประกันสังคม" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="setting.payroll.sso.rate_percent"
              control={control}
              defaultValue={info?.setting?.payroll?.sso?.rate_percent ?? 5}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="เรทหักประกันสังคม (%)"
                  type="number"
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="เช่น 5"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="setting.payroll.sso.max_amount"
              control={control}
              defaultValue={info?.setting?.payroll?.sso?.max_amount ?? 875}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="เพดานหักประกันสังคม (บาท/เดือน)"
                  type="number"
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="เช่น 875"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="setting.payroll.work_start_time"
              control={control}
              defaultValue={info?.setting?.payroll?.work_start_time ?? '08:00'}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="เวลาเข้างาน (สำหรับหักเงินมาสาย)"
                  type="time"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  placeholder="08:00"
                  helperText="ใช้คำนวณนาทีมาสาย: เงินเดือน/30/8/60 × นาทีมาสาย"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              ใช้กับการคำนวณ SSO ในหน้า HR Add Salary โดยระบบจะคำนวณ \(salary\_per\_month × rate%\) และไม่เกินเพดาน (หักจากยอดที่เคยถูกหักในเดือนนั้นแล้ว)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* การตั้งค่า Google Sheet */}
      {sheetOptions?.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SectionHeader icon={<TableChart />} title="การตั้งค่า Google Sheet" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="google_sheet_worksheet"
                control={control}
                defaultValue={info?.google_sheet_worksheet ?? ''}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="google-sheet-worksheet-label">
                      แผ่นงานสำหรับส่งข้อมูล Payout
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="google-sheet-worksheet-label"
                      label="แผ่นงานสำหรับส่งข้อมูล Payout"
                    >
                      <MenuItem value="">
                        <em>ใช้แผ่นแรก (ค่าเริ่มต้น)</em>
                      </MenuItem>
                      {sheetOptions.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                เลือกแผ่นงานที่ต้องการบันทึกข้อมูลการจ่ายเงิน (Payout) จาก Google Sheet ที่ตั้งค่าไว้
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
