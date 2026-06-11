import { Autocomplete, Button, Card, TextField } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import React from 'react';

export default function FilterOtCard({
  setDateStart,
  projectSelect,
  setProjectSelect,
  project,
  dateStart,
}) {
  const handleCheckProject = (data, index) => {
    const each = _.find(project.rows, { _id: data?._id });
    setProjectSelect(each);
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
            options={project?.rows || []}
            getOptionLabel={(option) =>
              `${option?.project_number} |${option?.name} `
            }
            onChange={(e, newValue) => handleCheckProject(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Project" />
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
      </div>
    </div>
  );
}
