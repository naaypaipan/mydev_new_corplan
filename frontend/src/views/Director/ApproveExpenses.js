import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';

import DirectApproveExpensesTable from 'components/Table/DirectApproveExpensesTable';

import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  Grid,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import dayjs from 'dayjs';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const _ = require('lodash');

function ApproveExpenses({
  title = 'อนุมัติเบิกจ่าย',
  subtitle = 'อนุมัติรายการเบิกจ่ายที่รอการอนุมัติ',
}) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const expenses = useSelector((state) => state.expenses);
  const me = useSelector((state) => state.me);

  const [selectedRows, setSelectedRows] = useState([]);
  // const [dateStart, setDateStart] = useState([new Date(), new Date()]);

  // Fetch เฉพาะ PREAPPROVE expenses
  const fetchApproveExpenses = async () => {
    await dispatch(
      actions.expensesAll({
        search: '',
        status: 'PREAPPROVE,APPROVE,HOLD',
      }),
    );
  };

  useEffect(() => {
    fetchApproveExpenses();
    dispatch(actions.meGet());
  }, []);

  useEffect(() => {
    fetchApproveExpenses();
  }, []);

  // Filter เฉพาะ PREAPPROVE status
  const preapproveExpenses =
    expenses?.rows?.filter(
      (e) =>
        e.status === 'PREAPPROVE' ||
        e.status === 'APPROVE' ||
        e.status === 'HOLD',
    ) || [];

  const handleSelectRow = (data) => {
    setSelectedRows((prev) =>
      prev.some((row) => row?._id === data?._id)
        ? prev?.filter((rowId) => rowId !== data)
        : [...prev, data],
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows([...preapproveExpenses]);
    } else {
      setSelectedRows([]);
    }
  };

  const handleApprove = async (id) => {
    const confirm = window.confirm('อนุมัติรายการนี้?');
    if (confirm) {
      await dispatch(
        actions.expensesPut(id, {
          status: 'APPROVE',
          approval_actor: me?.userData?.id,
          approval_actor_name: `${me?.userData?.firstname || ''} ${
            me?.userData?.lastname || ''
          }`.trim(),
        }),
      );
      fetchApproveExpenses();
    }
  };

  const handleApproveMultiple = async () => {
    const confirm = window.confirm(
      `อนุมัติรายการ ${selectedRows.length} รายการ?`,
    );
    if (confirm) {
      try {
        for (const expense of selectedRows) {
          await dispatch(
            actions.expensesPut(expense._id, {
              status: 'APPROVE',
              approval_actor: me?.userData?.id,
              approval_actor_name: `${me?.userData?.firstname || ''} ${
                me?.userData?.lastname || ''
              }`.trim(),
            }),
          );
        }
        fetchApproveExpenses();
        setSelectedRows([]);
      } catch (error) {
        console.error('Error approving expenses:', error);
      }
    }
  };

  const handleHold = async (id) => {
    const confirm = window.confirm('คงไว้รายการนี้?');
    if (confirm) {
      try {
        await dispatch(
          actions.expensesPut(id, {
            status: 'HOLD',
          }),
        );
        fetchApproveExpenses();
      } catch (error) {
        console.error('Error holding expense:', error);
      }
    }
  };

  const handleReset = async (id) => {
    const confirm = window.confirm('รีเซ็ตรายการนี้เป็น PENDING?');
    if (confirm) {
      try {
        await dispatch(actions.expensesPut(id, { status: 'PENDING' }));
        fetchApproveExpenses();
      } catch (error) {
        console.error('Error resetting expense:', error);
      }
    }
  };

  const checkColor = (status) => {
    if (status === 'PENDING')
      return <Chip size="small" label="Pending" color="default" />;
    if (status === 'PREAPPROVE')
      return <Chip size="small" label="Pre-Approved" color="secondary" />;
    if (status === 'APPROVE')
      return <Chip size="small" label="Approved" color="warning" />;
    if (status === 'HOLD')
      return <Chip size="small" label="Hold" color="error" />;
  };

  // Summary Statistics
  const totalAmount = preapproveExpenses.reduce(
    (sum, expense) => sum + (expense?.price || 0),
    0,
  );
  const totalCount = preapproveExpenses.length;

  const renderSummaryCard = () => (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={6} sm={6} md={4}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptLongIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  รอการอนุมัติ
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ lineHeight: 1.2 }}
                >
                  {totalCount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={4}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.06),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: theme.palette.warning.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CurrencyExchangeIcon
                  sx={{ color: 'white', fontSize: '1.2rem' }}
                />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  ยอดรวม
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="warning.main"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  ฿
                  {totalAmount
                    .toFixed(0)
                    .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={4}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.06),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: theme.palette.success.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  เลือกแล้ว
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ lineHeight: 1.2 }}
                >
                  {selectedRows.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  const renderExpenseTable = () => (
    <DirectApproveExpensesTable
      expenses={preapproveExpenses}
      selectedRows={selectedRows}
      onSelectRow={handleSelectRow}
      onSelectAll={handleSelectAll}
      onApprove={handleApprove}
      onApproveMultiple={handleApproveMultiple}
      onHold={handleHold}
      onReset={handleReset}
      checkColor={checkColor}
    />
  );

  return (
    <div>
      <Box sx={{ mb: 3 }}>
        
      </Box>

      {renderSummaryCard()}
      {renderExpenseTable()}
    </div>
  );
}

export default ApproveExpenses;
