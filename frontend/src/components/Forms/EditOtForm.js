import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React from 'react';
import {
  Chip,
  Typography,
  Grid,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const otTypes = [
  { value: 1, label: 'โอทีปกติ/เดินทาง', rate: '1x' },
  { value: 1.5, label: 'โอทีวันปกติหลังเลิกงาน', rate: '1.5x' },
  { value: 3, label: 'โอทีพิเศษ', rate: '3x' },
];

export default function EditOtForm({
  formData,
  handleChange,
  handleCloseModal,
  handleSubmit,
}) {
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2}>
          {/* เวลาเริ่ม - สิ้นสุด */}
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="เวลาเริ่ม OT"
              value={formData.startTime}
              onChange={(value) => handleChange('startTime', value)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label="เวลาสิ้นสุด OT"
              value={formData.endTime}
              onChange={(value) => handleChange('endTime', value)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
            />
          </Grid>

          {/* จำนวนชั่วโมง */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="จำนวนชั่วโมง"
              type="number"
              value={formData.totalHours}
              onChange={(e) =>
                handleChange('totalHours', parseFloat(e.target.value))
              }
              fullWidth
              size="small"
              inputProps={{ step: 0.5, min: 0 }}
            />
          </Grid>

          {/* อัตรา */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>อัตรา OT</InputLabel>
              <Select
                value={formData.rate}
                label="อัตรา OT"
                onChange={(e) => handleChange('rate', e.target.value)}
              >
                {otTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Typography variant="body2">{type.label}</Typography>
                      <Chip
                        label={type.rate}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* หมายเหตุ */}
          <Grid item xs={12}>
            <TextField
              label="สาเหตุ"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="เหตุผลในการขอ OT"
            />
          </Grid>
          {/* Buttons */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCloseModal}
              >
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
              >
                บันทึก
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </div>
  );
}
