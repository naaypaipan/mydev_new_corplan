import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Autocomplete,
  Typography,
  Grid,
  Box,
  Stack,
  Chip,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Fade,
  CardHeader,
  Avatar,
} from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Group as GroupIcon,
  MonetizationOn as MoneyIcon,
  Search as SearchIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import _ from 'lodash';
import { DateRangePicker } from '@mui/lab';

export default function FilterAddHrSalary({
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  selectedRole,
  setSelectedType,
  roletype,
  totalExpenses = 0,
  totalNetPay = 0,
  onChangeRoll,
  handleClickFetch,
}) {
  const theme = useTheme();

  const handleCheckRole = (data) => {
    const each = _.find(roletype?.rows, { _id: data?._id });
    setSelectedType(each);
  };

  const handleClearRole = () => {
    setSelectedType({ _id: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasFilters = dateStart || dateEnd || selectedRole;

  return (
    <Fade in={true} timeout={500}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          mb: 2,
          bgcolor: theme.palette.background.paper,
          borderColor: alpha(theme.palette.primary.main, 0.15),
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
          overflow: 'visible',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Filters Row */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2.5} alignItems="center">
              {/* Date Range Picker */}
              <Grid item xs={12} md={5}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <EventNoteIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main, opacity: 0.7 }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    ช่วงวันที่
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    localeText={{ start: 'เริ่มต้น', end: 'สิ้นสุด' }}
                  >
                    <DateRangePicker
                      value={dateStart}
                      size="small"
                      onChange={(newValue) => {
                        setDateStart(newValue);
                      }}
                      renderInput={(startProps, endProps) => (
                        <React.Fragment>
                          <TextField
                            {...startProps}
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                          <Box
                            sx={{
                              mx: 1,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Divider
                              orientation="horizontal"
                              flexItem
                              sx={{ width: '20px' }}
                            />
                          </Box>
                          <TextField
                            {...endProps}
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                '&:hover fieldset': {
                                  borderColor: theme.palette.primary.main,
                                },
                              },
                            }}
                          />
                        </React.Fragment>
                      )}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>

              {/* Role Filter */}
              <Grid item xs={12} md={4}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <AccountCircleIcon
                    fontSize="small"
                    sx={{ color: theme.palette.primary.main, opacity: 0.7 }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    ประเภทพนักงาน
                  </Typography>
                </Stack>
                <FormControl required fullWidth size="small">
                  <Select
                    onChange={(event) => onChangeRoll(event.target.value)}
                    defaultValue="FULLTIME"
                    displayEmpty
                    sx={{
                      borderRadius: 1.5,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <MenuItem value="FULLTIME">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon
                          fontSize="small"
                          sx={{ color: theme.palette.info.main }}
                        />
                        <Typography>พนักงานประจำ</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="DAILY">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon
                          fontSize="  small"
                          sx={{ color: theme.palette.warning.main }}
                        />
                        <Typography>พนักงานรายวัน</Typography>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <GroupIcon
                          fontSize="small"
                          sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography>เลือกประเภทพนักงาน</Typography>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3} mb={2}>
                <div className="pt-8">
                  <Button
                    onClick={handleClickFetch}
                    variant="contained"
                    fullWidth
                    startIcon={<SearchIcon />}
                    sx={{
                      borderRadius: 1.5,
                      py: 1,
                      boxShadow: `0 4px 10px ${alpha(
                        theme.palette.primary.main,
                        0.25,
                      )}`,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        boxShadow: `0 6px 15px ${alpha(
                          theme.palette.primary.main,
                          0.35,
                        )}`,
                      },
                    }}
                  >
                    ค้นหาข้อมูล
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Cards - แสดงเฉพาะเมื่อมีข้อมูล */}
          {(totalExpenses > 0 || totalNetPay > 0) && (
            <Fade in={true} timeout={800}>
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ mb: 2 }}
                >
                  <MoneyIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary.main"
                  >
                    สรุปค่าใช้จ่าย
                  </Typography>
                </Stack>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderColor: alpha(theme.palette.error.main, 0.2),
                        border: `1px solid ${alpha(
                          theme.palette.error.main,
                          0.1,
                        )}`,
                        textAlign: 'center',
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 6px 12px ${alpha(
                            theme.palette.error.main,
                            0.15,
                          )}`,
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.12),
                            color: theme.palette.error.main,
                            width: 48,
                            height: 48,
                            margin: '0 auto',
                          }}
                        >
                          <TrendingDownIcon />
                        </Avatar>
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="error.main"
                          sx={{ mt: 1 }}
                        >
                          {formatCurrency(totalExpenses)}
                        </Typography>
                        <Chip
                          label="ค่าใช้จ่ายทั้งหมด"
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 500,
                            mx: 'auto',
                            borderRadius: 4,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        borderColor: alpha(theme.palette.success.main, 0.2),
                        border: `1px solid ${alpha(
                          theme.palette.success.main,
                          0.1,
                        )}`,
                        textAlign: 'center',
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 6px 12px ${alpha(
                            theme.palette.success.main,
                            0.15,
                          )}`,
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                            color: theme.palette.success.main,
                            width: 48,
                            height: 48,
                            margin: '0 auto',
                          }}
                        >
                          <TrendingUpIcon />
                        </Avatar>
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="success.main"
                          sx={{ mt: 1 }}
                        >
                          {formatCurrency(totalNetPay)}
                        </Typography>
                        <Chip
                          label="จ่ายสุทธิทั้งหมด"
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 500,
                            mx: 'auto',
                            borderRadius: 4,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
}
