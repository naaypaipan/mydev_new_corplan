import React from 'react';
import {
  Autocomplete,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
export default function AddpayinForm({
  control,
  Controller,
  date,
  setDate,
  setPaidType,
  paidType,
  projects,
  projectSelect,
  setProjectSelect,
  setValue,
  budgetSelect,
  setBudgetSelect,
  edit,
}) {
  const handleChange = (event) => {
    setPaidType(event.target.value);
  };

  const handleCheckLevel = (data, index) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setValue(`project`, each?._id);
    setProjectSelect(each);
  };

  const handleCheckBudget = (data, index) => {
    const each = _.find(projectSelect?.budget, { _id: data?._id });
    setValue(`budget`, each?._id);
    setBudgetSelect(each);
  };

  return (
    <div>
      <div className="w-full px-1 py-1">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Accept Date"
            value={date}
            onChange={(newValue) => {
              setDate(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
        </LocalizationProvider>
      </div>

      <div className="w-full px-1 py-1">
        <Controller
          name={'price'}
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Accept total"
              fullWidth
              type="number"
              size={'small'}
              required
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-1">
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Accept by</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={paidType}
            label="Accept by"
            size="small"
            onChange={handleChange}
          >
            <MenuItem value={'TRANSFER'}>Transfer</MenuItem>
            <MenuItem value={'CASH'}>Cash</MenuItem>
            <MenuItem value={'CHEQUE'}>Cheque</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="w-full px-1 py-1">
        <Controller
          name={'remark'}
          control={control}
          defaultValue={''}
          render={({ field }) => (
            <TextField {...field} label="remark" fullWidth size={'small'} />
          )}
        />
      </div>
      <div className="flex justify-center">
        <Button variant="contained" type="submit">
          บันทึก
        </Button>
      </div>
    </div>
  );
}
