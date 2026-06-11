import * as React from 'react';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { TextField } from '@mui/material';

export default function ConfirmPayForm({ dateConfirm, setDateConfirm, title }) {
  return (
    <div>
      <div className="py-2">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="confirm"
            value={dateConfirm}
            onChange={(newValue) => {
              setDateConfirm(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
