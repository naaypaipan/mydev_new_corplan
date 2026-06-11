import React from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

export default function EditTimestampTimeWithRate({
  value,
  setValue,
  projects,
  projectSelect,
  setProjectSelect,
  checkout = true,
  rate,
  setRate,
  allowance,
  setAllowance,
}) {
  const handleCheckProject = (data) => {
    const each = _.find(projects?.rows, { _id: data?._id });
    setProjectSelect(each);
  };

  const [localRate, setLocalRate] = React.useState(rate ?? 1);
  React.useEffect(() => {
    if (typeof setRate !== 'function') {
      setLocalRate(rate ?? 1);
    }
  }, [rate, setRate]);

  const handleRateChange = (ev) => {
    const v = Number(ev.target.value);
    if (typeof setRate === 'function') {
      setRate(v);
    } else {
      setLocalRate(v);
    }
  };

  const currentRate = typeof setRate === 'function' ? rate ?? 1 : localRate;

  return (
    <div>
      {checkout && (
        <div className="w-full  py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            value={projectSelect}
            options={projects?.rows || []}
            getOptionLabel={(option) =>
              `${option.project_number} | ${option.customer} | ${option.name}`
            }
            onChange={(e, newValue) => handleCheckProject(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Project" required />
            )}
          />
        </div>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <DateTimePicker
            label="check in"
            value={value}
            onChange={(newValue) => setValue(newValue)}
          />
        </DemoContainer>
      </LocalizationProvider>

      {/* Rate selector */}
      <Box sx={{ mt: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="rate-select-label">Rate</InputLabel>
          <Select
            labelId="rate-select-label"
            id="rate-select"
            value={currentRate}
            label="Rate"
            onChange={handleRateChange}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box>
        <TextField
          label="Allowance"
          type="number"
          size="small"
          fullWidth
          sx={{ mt: 1 }}
          value={allowance}
          onChange={(e) => setAllowance(e.target.value)}
        />
      </Box>
    </div>
  );
}
