import React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Autocomplete, TextField, Box } from '@mui/material';

export default function AddTimestampTime({
  checkInValue,
  setCheckInValue,
  checkOutValue,
  setCheckOutValue,
  projects,
  projectSelect,
  setProjectSelect,
  employees,
  employeeSelect,
  setEmployeeSelect,
}) {
  const handleCheckProject = (data) => {
    const each = projects?.rows?.find((p) => p._id === data?._id);
    setProjectSelect(each);
  };
  const handleCheckEmployee = (data) => {
    const each = employees?.rows?.find((e) => e._id === data?._id);
    setEmployeeSelect(each);
  };
  return (
    <div>
      <div className="w-full  pb-1">
        <Autocomplete
          disablePortal
          id="employee-autocomplete"
          freeSolo
          value={employeeSelect}
          options={employees?.rows || []}
          getOptionLabel={(option) => `${option.firstname} ${option.lastname}`}
          onChange={(e, newValue) => handleCheckEmployee(newValue)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Employee" required />
          )}
        />
      </div>
      <div className="w-full  py-1">
        <Autocomplete
          disablePortal
          id="project-autocomplete"
          freeSolo
          value={projectSelect}
          options={projects?.rows || []}
          getOptionLabel={(option) =>
            `${option.project_number} | ${option.name}`
          }
          onChange={(e, newValue) => handleCheckProject(newValue)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Project" required />
          )}
        />
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
          <DateTimePicker
            label="Check In"
            value={checkInValue}
            onChange={(newValue) => setCheckInValue(newValue)}
          />
          <DateTimePicker
            label="Check Out"
            value={checkOutValue}
            onChange={(newValue) => setCheckOutValue(newValue)}
          />
        </DemoContainer>
      </LocalizationProvider>
    </div>
  );
}
