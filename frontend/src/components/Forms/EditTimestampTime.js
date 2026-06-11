import React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Autocomplete, TextField } from '@mui/material';

export default function EditTimestampTime({
  value,
  setValue,
  projects,
  projectSelect,
  setProjectSelect,
  checkout = true,
}) {
  const handleCheckProject = (data, index) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setProjectSelect(each);
  };
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
    </div>
  );
}
