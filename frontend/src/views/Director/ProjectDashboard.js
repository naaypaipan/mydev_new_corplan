import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import {
  Autocomplete,
  Card,
  CardContent,
  Chip,
  TextField,
  Paper,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import BarChartExample from 'components/Chart/BarChartExample';
import BarChartBudget from 'components/Chart/BarChartBudget';
import {
  Box,
  Grid,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Payments as PaymentsIcon,
  Assessment as AssessmentIcon,
  HourglassBottom as HourglassIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon,
} from '@mui/icons-material';

// Enhanced StatCard Component
const StatCard = ({
  icon: Icon,
  title,
  value,
  subValue,
  color,
  border,
  trend,
  isLoading,
}) => {
  const theme = useTheme();

  return (
    <Zoom in={true} timeout={500}>
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: border || 'primary.main',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Avatar
                sx={{
                  color: color || 'primary.main',
                  width: 48,
                  height: 48,
                }}
              >
                <Icon fontSize="medium" />
              </Avatar>
              {trend && (
                <Chip
                  icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${Math.abs(trend)}%`}
                  size="small"
                  color={trend > 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
            </Stack>

            {/* Content */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {isLoading ? (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress />
                </Box>
              ) : (
                <Typography
                  variant="h4"
                  fontWeight={600}
                  sx={{ color: color || 'text.primary' }}
                >
                  {value}
                </Typography>
              )}
              {subValue && (
                <Typography variant="caption" color="text.secondary">
                  {subValue}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Enhanced Project Info Card
const ProjectInfoCard = ({ projectSelect, onProjectSelect, projects }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05,
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Project Selection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a project to view detailed analytics
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3}>
          {/* Project Selector */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Autocomplete
                size="medium"
                options={projects?.rows || []}
                getOptionLabel={(option) =>
                  `${option.project_number} | ${option.name}`
                }
                onChange={(e, newValue) => onProjectSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Project"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                )}
              />

              {projectSelect && (
                <Fade in={true}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Project Details
                    </Typography>
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Customer:</strong> {projectSelect?.customer}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Location:</strong> {projectSelect?.location}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Fade>
              )}
            </Stack>
          </Grid>

          {/* Financial Overview */}
          <Grid item xs={12} md={4}>
            {projectSelect && (
              <Fade in={true} timeout={800}>
                <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Financial Overview
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Purchase Order + VAT
                      </Typography>
                      <Typography
                        variant="h6"
                        color="success.main"
                        fontWeight={600}
                      >
                        ฿
                        {projectSelect?.cost
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Budget
                      </Typography>
                      <Typography
                        variant="h6"
                        color="warning.main"
                        fontWeight={600}
                      >
                        ฿
                        {_.sumBy(projectSelect?.budget, 'cost')
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="caption" color="text.secondary">
                          Estimated Profit
                        </Typography>
                        <Chip
                          label={`${
                            ((projectSelect?.cost -
                              _.sumBy(projectSelect?.budget, 'cost')) /
                              projectSelect?.cost) *
                            100
                          }%`}
                          size="small"
                          color={
                            projectSelect?.cost -
                            _.sumBy(projectSelect?.budget, 'cost')
                              ? 'success'
                              : 'error'
                          }
                        />
                      </Stack>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={
                          projectSelect?.cost -
                          _.sumBy(projectSelect?.budget, 'cost')
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        ฿
                        {(
                          projectSelect?.cost -
                          _.sumBy(projectSelect?.budget, 'cost')
                        )
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Grid>

          {/* Project Status */}
          <Grid item xs={12} md={4}>
            {projectSelect && (
              <Fade in={true} timeout={1200}>
                <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Project Status
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        label: 'PO Status',
                        status: projectSelect?.po_status,
                        trueText: 'Received',
                        falseText: 'Waiting',
                      },
                      {
                        label: 'Delivery',
                        status: projectSelect?.deliver_status,
                        trueText: 'Delivered',
                        falseText: 'Pending',
                      },
                      {
                        label: 'Billing',
                        status: projectSelect?.acc_status?.status,
                        trueText: 'Complete',
                        falseText: 'Pending',
                      },
                      {
                        label: 'Payment',
                        status: projectSelect?.payment_status?.status,
                        trueText: 'Complete',
                        falseText: 'Pending',
                      },
                    ].map((item, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{item.label}</Typography>
                        <Chip
                          icon={item.status ? <CheckIcon /> : <ScheduleIcon />}
                          label={item.status ? item.trueText : item.falseText}
                          color={item.status ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function ProjectDashboard({ title, subtitle }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project);
  const budgets = useSelector((state) => state.budget);

  const [projectSelect, setProjectSelect] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const budget = _.sumBy(projectSelect?.budget, (e) => e?.cost);
  const estProfit = projectSelect?.cost - budget;
  const percen =
    (estProfit / (projectSelect?.cost === 0 ? 1 : projectSelect?.cost)) * 100;

  const BudgetFil = _.filter(
    budgets?.rows,
    (e) => e?.project_id === projectSelect?.id,
  );

  useEffect(() => {
    dispatch(actions?.projectAll({}));
    dispatch(actions?.budgetAll({ project_id: projectSelect?.id }));
  }, []);

  useEffect(() => {
    if (projectSelect?.id) {
      setIsLoading(true);
      dispatch(actions?.budgetAll({ project_id: projectSelect?.id }));
      setTimeout(() => setIsLoading(false), 1000); // Simulate loading
    }
  }, [projectSelect]);

  const handleSelect = (data) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setProjectSelect(each);
  };

  const renderStatistics = () => (
    <Fade in={true}>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={MoneyIcon}
            title="Real Profit"
            value={`฿${
              projectSelect?.realprofit
                ?.toFixed(2)
                ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0'
            }`}
            subValue={`${
              projectSelect?.real_percentage?.toFixed(2) || '0'
            }% of total`}
            color={
              projectSelect?.realprofit > 0 ? 'success.main' : 'error.main'
            }
            border={
              projectSelect?.realprofit > 0 ? 'success.main' : 'error.main'
            }
            trend={projectSelect?.real_percentage?.toFixed(2)}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PaymentsIcon}
            title="Total Expenses"
            value={`฿${
              projectSelect?.total_expenses
                ?.toFixed(2)
                ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || '0'
            }`}
            subValue={`${
              projectSelect?.expenses_percentage?.toFixed(2) || '0'
            }% of budget`}
            color="warning.main"
            border="warning.main"
            trend={-projectSelect?.expenses_percentage?.toFixed(2)}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssessmentIcon}
            title="Budget Utilization"
            value={`${
              ((projectSelect?.total_expenses / budget) * 100)?.toFixed(1) ||
              '0'
            }%`}
            subValue="of allocated budget"
            color="info.main"
            border="info.main"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={HourglassIcon}
            title="Remaining Budget"
            value={`฿${(budget - (projectSelect?.total_expenses || 0))
              ?.toFixed(2)
              ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}`}
            subValue="available to spend"
            color="secondary.main"
            border="secondary.main"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Fade>
  );

  const renderCharts = () => (
    <Fade in={true} timeout={1500}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Budget Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detailed breakdown of project expenses
                  </Typography>
                </Box>
              </Stack>
              <BarChartBudget
                projectSelect={projectSelect}
                budgets={BudgetFil}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Project Timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Key milestones and progress
                  </Typography>
                </Box>
              </Stack>

              {/* Timeline Content */}
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Project Progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={75}
                        sx={{ mt: 1, mb: 1 }}
                      />
                      <Typography variant="caption">75% Complete</Typography>
                    </Box>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Start Date</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Jan 15, 2024
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">End Date</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dec 31, 2024
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fade>
  );

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle ||
            'Comprehensive project analytics and performance metrics'}
        </Typography>
      </Box>

      {/* Project Info */}
      <ProjectInfoCard
        projectSelect={projectSelect}
        onProjectSelect={handleSelect}
        projects={projects}
      />

      {/* Statistics */}
      {projectSelect && renderStatistics()}

      {/* Charts */}
      {projectSelect && renderCharts()}
    </Box>
  );
}

ProjectDashboard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
