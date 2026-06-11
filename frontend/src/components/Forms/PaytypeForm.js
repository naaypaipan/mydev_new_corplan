import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
export default function PaytypeForm({
  errors,
  holiday,
  Controller,
  control,
  date,
  setDate,
}) {
  return (
    <div className="">
      <div className="w-full px-1 py-2">
        <Controller
          name={'name'}
          control={control}
          defaultValue={holiday ? holiday.name : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="name"
              required
              fullWidth
              size={'small'}
              helperText={errors.name && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
    </div>
  );
}
