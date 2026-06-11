import {
  Autocomplete,
  Button,
  Card,
  TextField,
  InputAdornment,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
export default function DatePickerCard({ setDate, date }) {
  return (
    <div>
      <div className="py-1">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="วันที่"
            value={date}
            size="small"
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
