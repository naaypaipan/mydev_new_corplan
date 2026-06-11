import { Autocomplete, Button, Card, TextField } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import React from 'react';
import dayjs from 'dayjs';

export default function FilterTimestampReportCard({
  employees,
  setEmSelect,
  dateStart,
  setDateStart,
  handlePrint,
  setMonth,
  setYear,
  roletype,
  roleSelect,
  setRoleSelect,
  project,
  setProjectSelect,
}) {
  const handleCheckEmployees = (data, index) => {
    const each = _.find(employees.rows, { _id: data?._id });
    setEmSelect(each);
  };
  const handleCheckRole = (data, index) => {
    const each = _.find(roletype.rows, { _id: data?._id });
    setRoleSelect(each);
  };
  const handleCheckProject = (data, index) => {
    const each = _.find(project.rows, { _id: data?._id });
    setProjectSelect(each);
  };

  const handelMonth = (date) => {
    setDateStart(date);
    setMonth(dayjs(date).month());
    setYear(dayjs(date).year());
  };

  return (
    <div>
      <div className="p-2 w-full lg:grid grid-cols-4 gap-2  ">
        <div className="py-1">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Month"
              value={dateStart}
              size="small"
              views={['year', 'month']}
              onChange={(newValue) => {
                handelMonth(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </div>
        <div className="py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            size="small"
            options={project?.rows || []}
            getOptionLabel={(option) =>
              `${option.project_number} | ${option.name}`
            }
            onChange={(e, newValue) => handleCheckProject(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Project" />
            )}
          />
        </div>
        <div className="py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            size="small"
            options={roletype?.rows || []}
            getOptionLabel={(option) => `${option.name} `}
            onChange={(e, newValue) => handleCheckRole(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Role" />
            )}
          />
        </div>

        {/* <div className="py-1">
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
          </div> */}

        <div className="py-1 w-full flex justify-end">
          <Button variant="contained" onClick={() => handlePrint()}>
            print
          </Button>
        </div>
      </div>
    </div>
  );
}
