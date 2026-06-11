import { TextField } from '@mui/material';
import React from 'react';

export default function OtRequireForm({ Controller, control }) {
  return (
    <div>
      <div className="py-1">
        <Controller
          name={'description'}
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="สาเหตุ"
              fullWidth
              size={'small'}
              required
              helperText={'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
    </div>
  );
}
