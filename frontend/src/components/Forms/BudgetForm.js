import React from 'react';
import { TextField } from '@mui/material';

export default function BudgetForm({ Controller, control }) {
  return (
    <div>
      <div className="py-1">
        <Controller
          name={'budget_number'}
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="รหัสงบประมาณ"
              fullWidth
              size={'small'}
              required
            />
          )}
        />
      </div>
      <div className="py-1">
        <Controller
          name={'name'}
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="รายการ"
              fullWidth
              size={'small'}
              required
            />
          )}
        />
      </div>
      <div className="py-1">
        <Controller
          name={'cost'}
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <TextField
              {...field}
              label="จำนวนเงิน"
              fullWidth
              size={'small'}
              type="number"
            />
          )}
        />
      </div>
    </div>
  );
}
