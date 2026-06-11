import {
  Autocomplete,
  Button,
  ButtonGroup,
  Card,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import React from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';

export default function FilterTimestampDailyCard({
  employees,
  emSelect,
  setEmSelect,
  dateStart,
  dateEnd,
  setDateStart,
  setDateEnd,
  timestamp,
  handlePrint,
  project,
  setProjectSelect,
  renderButtonGrotup,
  roletype,
  setRoleSelect,
  goToPreviousDay,
  goToNextDay,
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

  return (
    <div>
      <div className="p-2 w-full lg:grid grid-cols-3 gap-2 ">
        {/* <div className="py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            size="small"
            options={project?.rows || []}
            getOptionLabel={(option) =>
              `${option?.project_number} | ${option?.name}`
            }
            onChange={(e, newValue) => handleCheckProject(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Project" />
            )}
          />
        </div> */}

        <div className="py-1 w-full">
          <div>
            <Stack direction="row" spacing={1}>
              <IconButton>
                <ChevronLeft onClick={goToPreviousDay} />
              </IconButton>
              {/* <div className="py-2">{dayjs(dateStart).format('DD/MM/YY')}</div> */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
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
              <IconButton>
                <ChevronRight onClick={goToNextDay} />
              </IconButton>
            </Stack>
          </div>
        </div>
        <div className="py-1">
          <Autocomplete
            disablePortal
            id="free-solo-demo"
            freeSolo
            size="small"
            options={roletype?.rows || []}
            getOptionLabel={(option) => ` ${option.name}`}
            onChange={(e, newValue) => handleCheckRole(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="role" />
            )}
          />
        </div>

        <div className="py-1 flex justify-end">
          {/* <Button variant="contained" onClick={() => handlePrint()}>
              print
            </Button> */}
          {renderButtonGrotup()}
        </div>
      </div>
    </div>
  );
}
