import React, { useState, useEffect, useCallback } from 'react';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Fade,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  createTheme,
  ThemeProvider,
  Grid,
  Stack,
  Divider,
  IconButton,
  Collapse,
  alpha,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const theme = createTheme({
  palette: {
    primary: { main: '#0ea5e9' }, // sky-500
    secondary: { main: '#f97316' }, // orange-500
    success: { main: '#22c55e' },   // green-500
    warning: { main: '#f59e0b' },   // amber-500
    info: { main: '#0288d1' },
    background: { default: '#f7fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Prompt", "Roboto", sans-serif',
    h4: { fontWeight: 700, letterSpacing: 0.2 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 16px',
          boxShadow: '0 2px 8px rgba(2,136,209,0.12)',
          '&:hover': { transform: 'translateY(-1px)' },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { padding: '12px 16px', fontSize: '0.92rem' } } },
  },
});

function QuotationDetail() {
  const history = useHistory();
  const muiTheme = useTheme();

  const [quotations, setQuotations] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ใหม่: ตัวกรองวันที่
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const inputStyles = {
    '& .MuiInputBase-root': {
      height: 42,
      fontSize: '0.92rem',
      borderRadius: 12,
      backgroundColor: '#fff',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#e5e7eb' },
      '&:hover fieldset': { borderColor: muiTheme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: muiTheme.palette.primary.main, boxShadow: `0 0 0 3px ${alpha(muiTheme.palette.primary.main, 0.12)}` },
    },
  };

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quotations')) || [];
      setQuotations(stored);
    } catch (err) {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล', severity: 'error' });
    }
  }, []);

  const filteredQuotations = useCallback(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    let result = quotations.filter((q) => {
      const bd = q.billingData || {};
      const matchesSearch =
        (bd.billingNumber || '').toLowerCase().includes(searchLower) ||
        (bd.customerName || '').toLowerCase().includes(searchLower) ||
        (bd.project || '').toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'ทั้งหมด' || (bd.paymentStatus || 'รอดำเนินการ') === statusFilter;

      // กรองช่วงวันที่ (ถ้าเลือก)
      const d = bd.date ? dayjs(bd.date) : null;
      const inRange =
        (!dateFrom || (d && d.isAfter(dayjs(dateFrom).startOf('day').subtract(1, 'minute')))) &&
        (!dateTo || (d && d.isBefore(dayjs(dateTo).endOf('day').add(1, 'minute'))));

      return matchesSearch && matchesStatus && inRange;
    });

    // เรียง
    result.sort((a, b) => {
      const bdA = a.billingData || {};
      const bdB = b.billingData || {};
      let valueA, valueB;

      if (sortBy === 'date') {
        valueA = bdA.date ? dayjs(bdA.date).valueOf() : 0;
        valueB = bdB.date ? dayjs(bdB.date).valueOf() : 0;
      } else if (sortBy === 'billingNumber') {
        valueA = (bdA.billingNumber || '').toString();
        valueB = (bdB.billingNumber || '').toString();
      } else if (sortBy === 'total') {
        valueA = Number(a.summary?.total || 0);
        valueB = Number(b.summary?.total || 0);
      }

      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return result;
  }, [quotations, searchTerm, statusFilter, sortBy, sortOrder, dateFrom, dateTo]);

  // เลือกแถว
  const toggleRowSelection = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAllRows = () => {
    const all = filteredQuotations().map((q) => q.id);
    setSelectedRows((prev) => (prev.length === all.length ? [] : all));
  };

  // ไปหน้าสร้าง/ดู/แก้ไข
  const handleCreateFormQuotation = () => history.push('/sale/quotation/create');
  const handleViewDetails = (q) =>
    history.push({ pathname: `/sale/quotation/detail/:id/${q.id}`, state: { billingData: q.billingData, summary: q.summary } });
  const handleEditQuotation = (q) =>
    history.push({ pathname: '/sale/quotation/create', state: { billingData: q.billingData, summary: q.summary } });

  // ลบ
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);
  const handleDeleteQuotation = (ids) => {
    setDeleteIds(Array.isArray(ids) ? ids : [ids]);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteQuotation = () => {
    try {
      const updated = quotations.filter((q) => !deleteIds.includes(q.id));
      localStorage.setItem('quotations', JSON.stringify(updated));
      setQuotations(updated);
      setSelectedRows((prev) => prev.filter((id) => !deleteIds.includes(id)));
      setSnackbar({ open: true, message: `ลบใบเสนอราคา ${deleteIds.length} รายการเรียบร้อยแล้ว`, severity: 'success' });
      setDeleteDialogOpen(false);
      setDeleteIds([]);
    } catch {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการลบ', severity: 'error' });
    }
  };

  // รูปแบบเงิน
  const formatCurrency = (amount, currency) => {
    const symbol = { 'THB - ไทย': '฿', 'USD - US Dollar': '$', 'EUR - Euro': '€' }[currency] || '฿';
    const n = Number(amount) || 0;
    return `${symbol}${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // จัดการตาราง
  const handleSort = (col) => (sortBy === col ? setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') : (setSortBy(col), setSortOrder('asc')));
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const statusColor = (s) => (s === 'ชำระแล้ว' ? 'success' : 'warning');

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
        {/* HEADER */}
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              mx: { xs: 2, sm: 4, lg: 8 },
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
              color: '#fff',
              p: { xs: 3, md: 4 },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
              <Stack direction="row" spacing={2} alignItems="center">
                <DescriptionIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">ใบเสนอราคา</Typography>
                  <Typography sx={{ opacity: 0.85 }}>จัดการเอกสารเสนอราคาของคุณอย่างเป็นระบบ</Typography>
                </Box>
                <Chip
                  label={`ทั้งหมด: ${quotations.length}`}
                  sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', borderColor: alpha('#fff', 0.35) }}
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" color="secondary" onClick={handleCreateFormQuotation} startIcon={<DescriptionIcon />}>
                  สร้างใบเสนอราคา
                </Button>
                {selectedRows.length > 0 && (
                  <Button variant="outlined" color="inherit" onClick={() => handleDeleteQuotation(selectedRows)} startIcon={<DeleteIcon />}>
                    ลบที่เลือก ({selectedRows.length})
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Fade>

        {/* FILTER BAR */}
        <Box sx={{ mx: { xs: 2, sm: 4, lg: 8 }, mb: 4 }}>
          <Paper elevation={1} sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <TextField
                placeholder="ค้นหา (เลขที่, ชื่อลูกค้า, โปรเจกต์)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ color: 'grey.500', mr: 1 }} /> }}
                sx={{ ...inputStyles, width: { xs: '100%', sm: 320 } }}
              />
              <FormControl sx={{ width: { xs: '100%', sm: 180 }, ...inputStyles }}>
                <InputLabel>สถานะ</InputLabel>
                <Select value={statusFilter} label="สถานะ">
                  <MenuItem value="ทั้งหมด" onClick={() => setStatusFilter('ทั้งหมด')}>ทั้งหมด</MenuItem>
                  <MenuItem value="รอดำเนินการ" onClick={() => setStatusFilter('รอดำเนินการ')}>รอดำเนินการ</MenuItem>
                  <MenuItem value="ชำระแล้ว" onClick={() => setStatusFilter('ชำระแล้ว')}>ชำระแล้ว</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1} alignItems="center">
                <DateRangeIcon sx={{ color: 'text.secondary' }} />
                <TextField
                  label="ตั้งแต่"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  sx={{ ...inputStyles, width: 160 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="ถึง"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  sx={{ ...inputStyles, width: 160 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Box sx={{ flex: 1 }} />

              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>เรียงตาม</InputLabel>
                  <Select
                    value={sortBy}
                    label="เรียงตาม"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="date">วันที่</MenuItem>
                    <MenuItem value="billingNumber">เลขที่เอกสาร</MenuItem>
                    <MenuItem value="total">ยอดสุทธิ</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>ทิศทาง</InputLabel>
                  <Select value={sortOrder} label="ทิศทาง" onChange={(e) => setSortOrder(e.target.value)}>
                    <MenuItem value="asc">น้อย → มาก</MenuItem>
                    <MenuItem value="desc">มาก → น้อย</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="text"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ทั้งหมด');
                    setDateFrom('');
                    setDateTo('');
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {/* TABLE CARD */}
        <Box sx={{ mx: { xs: 2, sm: 4, lg: 8 } }}>
          {/* แถบเครื่องมือเมื่อมีการเลือกแถว */}
          <Collapse in={selectedRows.length > 0}>
            <Paper elevation={0} sx={{ mb: 1.5, p: 1.25, bgcolor: alpha(muiTheme.palette.primary.main, 0.06), border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.12)}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography>เลือกแล้ว {selectedRows.length} รายการ</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => handleDeleteQuotation(selectedRows)}>
                    ลบที่เลือก
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Collapse>

          <TableContainer component={Paper} elevation={1} sx={{ overflow: 'hidden' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    '& th': { color: '#fff', fontWeight: 600 },
                    background: `linear-gradient(90deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                  }}
                >
                  <TableCell sx={{ py: 2.2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Checkbox
                        checked={selectedRows.length === filteredQuotations().length && filteredQuotations().length > 0}
                        onChange={toggleAllRows}
                        sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                      />
                      <Box sx={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                        วันที่ {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2.2, cursor: 'pointer' }} onClick={() => handleSort('billingNumber')}>
                    เลขที่เอกสาร {sortBy === 'billingNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell sx={{ py: 2.2 }}>ชื่อลูกค้า / โปรเจกต์</TableCell>
                  <TableCell sx={{ py: 2.2, cursor: 'pointer' }} onClick={() => handleSort('total')}>
                    ยอดสุทธิ {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell sx={{ py: 2.2, display: { xs: 'none', md: 'table-cell' } }}>สถานะ</TableCell>
                  <TableCell sx={{ py: 2.2, display: { xs: 'none', sm: 'table-cell' } }}>การจัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredQuotations().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
                      <Stack alignItems="center" spacing={2}>
                        <DescriptionIcon sx={{ width: 56, height: 56, color: 'grey.400' }} />
                        <Typography variant="h6">ยังไม่มีข้อมูล</Typography>
                        <Typography>เริ่มต้นด้วยการกด “สร้างใบเสนอราคา”</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations()
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((q) => {
                      const bd = q.billingData || {};
                      return (
                        <Fade in key={q.id} timeout={300}>
                          <TableRow
                            hover
                            onClick={() => handleViewDetails(q)}
                            sx={{
                              cursor: 'pointer',
                              '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Checkbox
                                  checked={selectedRows.includes(q.id)}
                                  onChange={() => toggleRowSelection(q.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {bd.date ? dayjs(bd.date).locale('th').format('DD MMM YYYY') : '-'}
                              </Stack>
                            </TableCell>
                            <TableCell>{bd.billingNumber || '-'}</TableCell>
                            <TableCell>{`${bd.customerName || '-'} / ${bd.project || '-'}`}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(q.summary?.total || 0, bd.currency || 'THB - ไทย')}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              <Chip label={bd.paymentStatus || 'รอดำเนินการ'} color={statusColor(bd.paymentStatus || 'รอดำเนินการ')} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="ดูรายละเอียด">
                                  <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); handleViewDetails(q); }}>
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="แก้ไข">
                                  <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditQuotation(q); }}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ลบ">
                                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteQuotation(q.id); }}>
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* FOOTER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 2 }}>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={filteredQuotations().length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="รายการต่อหน้า"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} จาก ${count}`}
              sx={{ borderRadius: 2 }}
            />
            <Tooltip title="แสดงยอดรวมของใบเสนอราคาที่กรองอยู่">
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  const total = filteredQuotations().reduce((sum, q) => sum + Number(q.summary?.total || 0), 0);
                  setSnackbar({ open: true, message: `ยอดรวมที่แสดง: ${formatCurrency(total, 'THB - ไทย')}`, severity: 'info' });
                }}
              >
                แสดงยอดรวม
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* DIALOG ลบ */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>ยืนยันการลบ</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            ต้องการลบใบเสนอราคา {deleteIds.length} รายการหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">ยกเลิก</Button>
            <Button onClick={confirmDeleteQuotation} color="error" variant="contained" startIcon={<DeleteIcon />}>ลบ</Button>
          </DialogActions>
        </Dialog>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default QuotationDetail;
