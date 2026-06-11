import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Box,
  Typography,
  Chip,
  Card,
  Avatar,
  Divider,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';

function Row({ row, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
          '&:hover': { backgroundColor: '#e3f2fd' },
          cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {row.employee?.firstname_th} {row.employee?.lastname_th}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ผู้ทำรายการ
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {row.payee?.name || 'ไม่ระบุ'}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {row.payee?.bank || 'ไม่ระบุธนาคาร'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.payee?.account_number || '-'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={row.type === 'REFUND' ? 'เงินคืน' : row.type}
            color="primary"
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={row.paidType === 'TRANSFER' ? 'โอน' : row.paidType}
            color="success"
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" fontWeight="bold">
            {row.count} รายการ
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="h6" color="primary" fontWeight="bold">
            {row.totalAmount?.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ฿
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{ mb: 2 }}
              >
                รายละเอียดรายการเบิก ({row.expenses?.length} รายการ)
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: '1px solid #e0e0e0' }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>
                        <strong>รหัส</strong>
                      </TableCell>
                      <TableCell>
                        <strong>รายการ</strong>
                      </TableCell>
                      <TableCell>
                        <strong>โครงการ</strong>
                      </TableCell>
                      <TableCell>
                        <strong>งบประมาณ</strong>
                      </TableCell>
                      <TableCell>
                        <strong>สถานะ</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>จำนวนเงิน</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.expenses?.map((expense, idx) => (
                      <TableRow
                        key={expense._id}
                        sx={{
                          '&:hover': { backgroundColor: '#fafafa' },
                          backgroundColor: idx % 2 === 0 ? 'white' : '#f9f9f9',
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight="500"
                          >
                            {expense.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {expense.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">
                            {expense.project?.project_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">
                            {expense.budget?.budget_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              expense.status === 'APPROVE'
                                ? 'อนุมัติ'
                                : expense.status
                            }
                            color={
                              expense.status === 'APPROVE'
                                ? 'success'
                                : 'warning'
                            }
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.main"
                          >
                            {expense.price?.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            ฿
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ExpensesDailyTable({ expenses }) {
  const data = expenses?.rows || [];

  if (!data || data.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <ReceiptIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          ไม่พบข้อมูลรายการเบิก
        </Typography>
      </Card>
    );
  }

  const totalAmount = data.reduce(
    (sum, row) => sum + (row.totalAmount || 0),
    0,
  );
  const totalItems = data.reduce((sum, row) => sum + (row.count || 0), 0);

  return (
    <Box>
      <Card sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                จำนวนผู้รับเงิน
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {data.length} คน
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" color="text.secondary">
                จำนวนรายการทั้งหมด
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {totalItems} รายการ
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              ยอดรวมทั้งหมด
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {totalAmount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              ฿
            </Typography>
          </Box>
        </Box>
      </Card>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E65F04' }}>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                ผู้ทำรายการ
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                ผู้รับเงิน
              </TableCell>

              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                ธนาคาร / บัญชี
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                ประเภท
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                วิธีจ่าย
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                จำนวนรายการ
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                ยอดรวม
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <Row key={index} row={row} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
