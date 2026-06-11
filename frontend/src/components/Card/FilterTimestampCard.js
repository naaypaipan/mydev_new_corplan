import { Autocomplete, Button, Card, TextField } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import React from 'react';

export default function FilterTimestampCard({
  employees,
  emSelect,
  setEmSelect,
  dateStart,
  dateEnd,
  setDateStart,
  setDateEnd,
  timestamp,
  handlePrint,
}) {
  const handleCheckEmployees = (data, index) => {
    const each = _.find(employees.rows, { _id: data?._id });
    setEmSelect(each);
  };
  return (
    <div>
      <div className="p-2 w-full lg:grid grid-cols-3 gap-2 ">
        <div className="py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            size="small"
            options={employees?.rows || []}
            getOptionLabel={(option) =>
              `${option.firstname} ${option.lastname}`
            }
            onChange={(e, newValue) => handleCheckEmployees(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Employee" />
            )}
          />
        </div>
        <div className="py-1">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date start"
              value={dateStart}
              size="small"
              onChange={(newValue) => {
                setDateStart(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </div>
        <div className="py-1">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date End "
              value={dateEnd}
              size="small"
              onChange={(newValue) => {
                setDateEnd(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </div>
      </div>
      <div className="px-2 py-1 flex justify-between text-xl ">
        {/* <div>
          <div>
            <b className="text-theme-600">Total Checked : </b>
            {timestamp?.total || 0}
          </div>
        </div> */}
        {/* <div className="py-1">
          <Button variant="contained" onClick={() => handlePrint()}>
            print
          </Button>
        </div> */}
      </div>
    </div>
  );
}
