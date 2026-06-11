import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import _ from 'lodash';
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import Loading from 'components/Loading';
import { BackButton } from 'components/Button';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const payeeKey = (e) => {
  const p = e?.payee || {};
  const name = (p.name || '').toString().trim();
  const bank = (p.bank || '').toString().trim();
  const acc = (p.account_number || '').toString().trim();
  return `${name}|${bank}|${acc}`;
};

export default function NewPayment({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const expenses = useSelector((state) => state.expenses);
  const me = useSelector((state) => state.me);

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(actions.expensesAll({ status: 'APPROVE', size: 99999, page: 1 }));
    return () => {};
  }, [dispatch]);

  const groupedByPayee = useMemo(() => {
    const rows = expenses?.rows || [];
    if (!rows.length) return [];
    const groups = _.groupBy(rows, payeeKey);
    return Object.entries(groups).map(([key, list]) => {
      const first = list[0];
      const payee = first?.payee || { name: '', bank: '', account_number: '' };
      const totalAmount = _.sumBy(
        list,
        (e) => Number(e?.net_price) || Number(e?.price) || 0
      );
      return {
        key,
        payee: {
          name: payee.name || '-',
          bank: payee.bank || '-',
          account_number: payee.account_number || '-',
        },
        count: list.length,
        totalAmount,
        expenses: list,
      };
    });
  }, [expenses?.rows]);

  const formatMoney = (val) =>
    (val || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

  const handleCreatePrepare = async () => {
    if (groupedByPayee.length === 0) {
      setMessage({ type: 'warning', text: 'ไม่มีรายการที่อนุมัติแล้ว (APPROVE) เพื่อสร้างรายการเตรียมจ่าย' });
      return;
    }
    const confirm = window.confirm(
      `ต้องการสร้างรายการเตรียมจ่าย ${groupedByPayee.length} รายการ (ตามผู้รับเงิน) ใช่หรือไม่?`
    );
    if (!confirm) return;
    setCreating(true);
    setMessage(null);
    try {
      const result = await dispatch(
        actions.paymentPrepareByPayee({
          creater: me?.userData?._id,
          create_by: me?.userData?.firstname || '',
        })
      );
      setMessage({
        type: 'success',
        text: `สร้างรายการเตรียมจ่ายแล้ว ${result?.created || 0} รายการ`,
      });
      dispatch(actions.paymentAll({ page: 1, size: 20 }));
      setTimeout(() => {
        history.push('/finance/Payment');
      }, 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.message || 'สร้างรายการไม่สำเร็จ',
      });
    } finally {
      setCreating(false);
    }
  };

  const isLoading = expenses?.isLoading && !expenses?.rows?.length;
  if (isLoading) return <Loading isLoading />;

  return (
    <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton />
          <Typography variant="h6" fontWeight={600}>
            สร้างรายการเตรียมจ่าย (ตามผู้รับเงิน)
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          disabled={creating || groupedByPayee.length === 0}
          startIcon={creating ? null : <PlaylistAddCheckIcon />}
          onClick={handleCreatePrepare}
        >
          {creating ? 'กำลังสร้าง...' : 'สร้างรายการเตรียมจ่ายทั้งหมด'}
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {creating && <LinearProgress sx={{ mb: 2 }} />}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptLongIcon color="primary" />
            รายการเบิกที่อนุมัติแล้ว (APPROVE) — สรุปตามผู้รับเงิน
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            กดปุ่ม &quot;สร้างรายการเตรียมจ่ายทั้งหมด&quot; เพื่อสร้างรายการจ่ายเงินรายผู้รับเงิน และเปลี่ยนสถานะเบิกเป็น &quot;เตรียมจ่าย&quot;
          </Typography>

          {groupedByPayee.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              ไม่มีรายการเบิกที่อนุมัติแล้ว (APPROVE) ในขณะนี้
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell sx={{ fontWeight: 600 }}>ลำดับ</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ชื่อผู้รับเงิน</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ธนาคาร</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>เลขบัญชี</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>จำนวนรายการ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>ยอดรวม (บาท)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedByPayee.map((row, index) => (
                    <TableRow key={row.key} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" color="action" />
                          {row.payee.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccountBalanceIcon fontSize="small" color="action" />
                          {row.payee.bank}
                        </Box>
                      </TableCell>
                      <TableCell>{row.payee.account_number}</TableCell>
                      <TableCell align="right">
                        <Chip label={`${row.count} รายการ`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ฿{formatMoney(row.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

NewPayment.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
