import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Card,
  TextField,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { DateRangePicker } from '@mui/lab';
import React from 'react';

export default function FilterTimestampDashboardCard({
  employees,
  emSelect,
  setEmSelect,
  dateStart,
  setDateStart,
  project,
  setProjectSelect,
  roletype,
  setRoleSelect,
  handlePrint,
}) {
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
      <div className="p-3 w-full flex justify-between items-center">
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
        </div> */}
        <Box sx={{ minWidth: 260, flex: 1 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            localeText={{ start: 'Check-in', end: 'Check-out' }}
          >
            <DateRangePicker
              value={dateStart}
              onChange={(newValue) => setDateStart(newValue)}
              renderInput={(startProps, endProps) => (
                <React.Fragment>
                  <TextField {...startProps} size="small" label="วันที่เริ่ม" />
                  <Box sx={{ mx: 1, color: '#888' }}>ถึง</Box>
                  <TextField {...endProps} size="small" label="วันที่สิ้นสุด" />
                </React.Fragment>
              )}
            />
          </LocalizationProvider>
        </Box>
        <Box>
          <Button onClick={handlePrint} variant="contained" color="success">
            พิมพ์รายงาน
          </Button>
        </Box>
      </div>
    </div>
  );
}
