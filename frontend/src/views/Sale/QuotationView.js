import React, { useState, useEffect } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material'; // นำเข้า Alert จาก @mui/material
import { Description as DescriptionIcon, ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

// ตั้งค่า dayjs
dayjs.locale('th');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

const QuotationView = () => {
  const history = useHistory();
  const { id } = useParams();
  const { state } = useLocation();
  const theme = useTheme();
  const [quotation, setQuotation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // โหลดข้อมูลใบเสนอราคา
  useEffect(() => {
    try {
      if (state && state.billingData && state.summary) {
        setQuotation({ billingData: state.billingData, summary: state.summary });
      } else {
        const storedQuotations = JSON.parse(localStorage.getItem('quotations')) || [];
        const foundQuotation = storedQuotations.find((q) => q.id === id);
        if (foundQuotation) {
          setQuotation(foundQuotation);
        } else {
          setSnackbar({
            open: true,
            message: 'ไม่พบข้อมูลใบเสนอราคา',
            severity: 'error',
          });
          history.push('/sale/quotation');
        }
      }
    } catch (error) {
      console.error('Error loading quotation:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        severity: 'error',
      });
      history.push('/sale/quotation');
    }
  }, [id, state, history]);

  // ฟังก์ชันจัดรูปแบบสกุลเงิน
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      'THB - ไทย': '฿',
      'USD - US Dollar': '$',
      'EUR - Euro': '€',
    };
    const parsedAmount = parseFloat(amount);
    return isNaN(parsedAmount)
      ? `${currencySymbols[currency] || ''}0.00`
      : `${currencySymbols[currency] || ''}${parsedAmount.toFixed(2)}`;
  };

  // ฟังก์ชันกลับไปหน้ารายการ
  const handleBack = () => {
    history.push('/sale/quotation');
  };

  // ฟังก์ชันแก้ไขใบเสนอราคา
  const handleEdit = () => {
    history.push({
      pathname: '/sale/quotation/create',
      state: { billingData: quotation.billingData, summary: quotation.summary },
    });
  };

  if (!quotation) {
    return null; // หรือสามารถแสดงหน้าโหลดได้
  }

  const { billingData, summary } = quotation;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
          mb: 4,
          mx: { xs: 2, sm: 4, lg: 8 },
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 4, lg: 6 }, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700} color="primary.main">
                รายละเอียดใบเสนอราคา: {billingData.billingNumber}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: '12px', textTransform: 'none' }}
              >
                กลับ
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                startIcon={<EditIcon />}
                sx={{ borderRadius: '12px', textTransform: 'none' }}
              >
                แก้ไข
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: '7xl', mx: 'auto', px: { xs: 2, sm: 4, lg: 6 }, py: 4 }}>
        <Grid container spacing={3}>
          {/* ข้อมูลทั่วไป */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                ข้อมูลทั่วไป
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">เลขที่เอกสาร:</Typography>
                  <Typography>{billingData.billingNumber || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">วันที่:</Typography>
                  <Typography>{billingData.date ? dayjs(billingData.date).format('DD/MM/YYYY') : '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">ครบกำหนด:</Typography>
                  <Typography>{billingData.dueDate ? dayjs(billingData.dueDate).format('DD/MM/YYYY') : '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">ชื่อลูกค้า:</Typography>
                  <Typography>{billingData.customerName || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">โปรเจกต์:</Typography>
                  <Typography>{billingData.project || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">สถานะ:</Typography>
                  <Chip
                    label={billingData.paymentStatus || 'รอดำเนินการ'}
                    color={billingData.paymentStatus === 'ชำระแล้ว' ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontSize: '0.85rem', borderRadius: '12px' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ข้อมูลสรุป */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                สรุปยอดเงิน
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">รวมเป็นเงิน:</Typography>
                  <Typography>{formatCurrency(summary.subtotal, billingData.currency)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">ส่วนลด:</Typography>
                  <Typography>{formatCurrency(summary.discount, billingData.currency)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">ราคาหลังหักส่วนลด:</Typography>
                  <Typography>{formatCurrency(summary.afterDiscount, billingData.currency)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">ภาษีมูลค่าเพิ่ม ({billingData.vatRate}%):</Typography>
                  <Typography>{formatCurrency(summary.vat, billingData.currency)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" fontWeight={700}>ยอดสุทธิ:</Typography>
                  <Typography fontWeight={700}>{formatCurrency(summary.total, billingData.currency)}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* รายการสินค้า */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                รายการสินค้า
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>ลำดับ</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>ชื่อสินค้า/รายละเอียด</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>จำนวน</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>หน่วย</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>ราคาต่อหน่วย</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>ราคารวม</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billingData.items && billingData.items.length > 0 ? (
                      billingData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.description || '-'}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{Number(item.quantity).toFixed(2)}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{item.unit || '-'}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{formatCurrency(item.pricePerUnit, billingData.currency)}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>{formatCurrency(item.total, billingData.currency)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">ไม่มีรายการสินค้า</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* หมายเหตุ */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                หมายเหตุ
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>{billingData.notes || '-'}</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 3, mb: 2 }}>
                โน้ตภายในบริษัท
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography>{billingData.internalNotes || '-'}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12pt;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .print-header {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 16px;
            border-bottom: 1px solid #ddd;
            background-color: #fff;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            padding: 16px;
            border-top: 1px solid #ddd;
            background-color: #fff;
          }
        }
      `}</style>
      <div className="print-header no-print hidden">
        <Typography variant="h4" fontWeight={700}>รายละเอียดใบเสนอราคา</Typography>
        <Typography variant="body1">บริษัท ตัวอย่าง จำกัด</Typography>
        <Typography variant="body1">123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10100</Typography>
        <Typography variant="body1">เลขประจำตัวผู้เสียภาษี: 0123456789012</Typography>
      </div>
      <div className="print-footer no-print hidden">
        <Typography variant="body1">
          ติดต่อ: บริษัท ตัวอย่าง จำกัด | โทร: 02-123-4567 | อีเมล: contact@example.com
        </Typography>
        <Typography variant="body1">ขอบคุณที่ไว้วางใจในบริการของเรา</Typography>
      </div>
    </Box>
  );
};

export default QuotationView;