import React from 'react';
import {
  Box,
  Card,
  InputAdornment,
  TextField,
  Autocomplete,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  AccountBalance as ProjectIcon,
} from '@mui/icons-material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { DateRangePicker } from '@mui/lab';

export default function FilterFinanceExpenses({
  project,
  setFindProject,
  setSearch,
  dateStart,
  setDateStart,
}) {
  const [searchText, setSearchText] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState(null);

  const handleClearSearch = () => {
    setSearchText('');
    setSearch('');
  };

  const handleClearProject = () => {
    setSelectedProject(null);
    setFindProject(null);
  };

  const handleCheckProject = (data) => {
    setSelectedProject(data);
    const each = _.find(project.rows, { _id: data?._id });
    setFindProject(each);
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: 'transparent',
        border: 'none',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search expenses..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.paper',
                },
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Autocomplete
            value={selectedProject}
            onChange={(_, newValue) => handleCheckProject(newValue)}
            options={project?.rows || []}
            getOptionLabel={(option) =>
              `${option?.project_number} | ${option?.name}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Select project..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <ProjectIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'background.paper',
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={option?.project_number}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <span>{option?.name}</span>
                </Stack>
              </Box>
            )}
          />
        </Box>

        {selectedProject && (
          <Tooltip title="Clear project filter">
            <IconButton
              size="small"
              onClick={handleClearProject}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'error.lighter' },
              }}
            >
              <ClearIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        )}
        <div className="py-1">
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              localeText={{ start: 'Check-in', end: 'Check-out' }}
            >
              <DateRangePicker
                value={dateStart}
                size="small"
                onChange={(newValue) => {
                  setDateStart(newValue);
                }}
                renderInput={(startProps, endProps) => (
                  <React.Fragment>
                    <TextField {...startProps} size="small" />
                    <Box sx={{ mx: 2 }}> to </Box>
                    <TextField {...endProps} size="small" />
                  </React.Fragment>
                )}
              />
            </LocalizationProvider>
          </Box>
        </div>
      </Stack>
    </Card>
  );
}
