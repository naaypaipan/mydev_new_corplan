// import React, { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Box,
//   Chip,
//   IconButton,
//   Tooltip,
//   TablePagination,
//   useTheme,
//   alpha,
//   Card,
//   Stack,
//   Avatar,
// } from '@mui/material';
// import {
//   Visibility as ViewIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Download as DownloadIcon,
//   Print as PrintIcon,
//   Receipt as ReceiptIcon,
//   TrendingUp as TrendingUpIcon,
// } from '@mui/icons-material';
// import dayjs from 'dayjs';

// export default function SalesListTable({ sales = [] }) {
//   const theme = useTheme();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   // Mock data สำหรับตัวอย่าง
//   const mockSalesData = [
//     {
//       _id: '1',
//       invoiceNumber: 'INV-2024-001',
//       customerName: 'บริษัท ABC จำกัด',
//       customerContact: 'คุณสมชาย',
//       saleDate: '2024-01-15',
//       dueDate: '2024-02-14',
//       totalAmount: 125000,
//       paidAmount: 125000,
//       remainingAmount: 0,
//       status: 'paid',
//       paymentMethod: 'transfer',
//       salesPerson: 'คุณสุรีย์',
//       items: 5,
//       createdAt: '2024-01-15T10:30:00Z',
//       updatedAt: '2024-01-20T14:15:00Z',
//     },
//     {
//       _id: '2',
//       invoiceNumber: 'INV-2024-002',
//       customerName: 'ร้านค้าปลีก XYZ',
//       customerContact: 'คุณนารี',
//       saleDate: '2024-01-16',
//       dueDate: '2024-02-15',
//       totalAmount: 75000,
//       paidAmount: 0,
//       remainingAmount: 75000,
//       status: 'pending',
//       paymentMethod: 'cash',
//       salesPerson: 'คุณมานะ',
//       items: 3,
//       createdAt: '2024-01-16T09:15:00Z',
//       updatedAt: '2024-01-16T09:15:00Z',
//     },
//     {
//       _id: '3',
//       invoiceNumber: 'INV-2024-003',
//       customerName: 'บริษัท DEF จำกัด',
//       customerContact: 'คุณสมหญิง',
//       saleDate: '2024-01-17',
//       dueDate: '2024-02-16',
//       totalAmount: 200000,
//       paidAmount: 50000,
//       remainingAmount: 150000,
//       status: 'partial',
//       paymentMethod: 'credit',
//       salesPerson: 'คุณสุรีย์',
//       items: 8,
//       createdAt: '2024-01-17T11:45:00Z',
//       updatedAt: '2024-01-25T16:20:00Z',
//     },
//   ];

//   const salesData = sales.length > 0 ? sales : mockSalesData;

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('th-TH', {
//       style: 'currency',
//       currency: 'THB',
//       minimumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const formatDate = (date) => {
//     if (!date) return '-';
//     return dayjs(date).format('DD/MM/YYYY');
//   };

//   const formatDateTime = (date) => {
//     if (!date) return '-';
//     return dayjs(date).format('DD/MM/YYYY HH:mm');
//   };

//   const getStatusChip = (status) => {
//     const statusConfig = {
//       draft: { label: 'ร่าง', color: 'default' },
//       pending: { label: 'รอชำระ', color: 'warning' },
//       partial: { label: 'ชำระบางส่วน', color: 'info' },
//       paid: { label: 'ชำระแล้ว', color: 'success' },
//       overdue: { label: 'เกินกำหนด', color: 'error' },
//       cancelled: { label: 'ยกเลิก', color: 'error' },
//     };

//     const config = statusConfig[status] || {
//       label: 'ไม่ทราบ',
//       color: 'default',
//     };

//     return (
//       <Chip
//         label={config.label}
//         color={config.color}
//         size="small"
//         variant="outlined"
//       />
//     );
//   };

//   const getPaymentMethodChip = (method) => {
//     const methodConfig = {
//       cash: { label: 'เงินสด', color: 'success' },
//       transfer: { label: 'โอนเงิน', color: 'primary' },
//       credit: { label: 'เครดิต', color: 'info' },
//       cheque: { label: 'เช็ค', color: 'warning' },
//     };

//     const config = methodConfig[method] || {
//       label: 'อื่นๆ',
//       color: 'default',
//     };

//     return (
//       <Chip
//         label={config.label}
//         color={config.color}
//         size="small"
//         variant="filled"
//       />
//     );
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const paginatedData = salesData.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage,
//   );

//   const renderTableHeader = () => (
//     <Box sx={{ mb: 3 }}>
//       <Typography variant="h5" fontWeight={600} gutterBottom>
//         รายการขาย
//       </Typography>
//       <Typography variant="body2" color="text.secondary">
//         แสดงข้อมูลการขายสินค้าและบริการ
//       </Typography>
//     </Box>
//   );

//   if (salesData.length === 0) {
//     return (
//       <Card variant="outlined">
//         <Box sx={{ py: 6, textAlign: 'center' }}>
//           <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
//           <Typography variant="h6" color="text.secondary" gutterBottom>
//             ไม่พบข้อมูลการขาย
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             ยังไม่มีการบันทึกข้อมูลการขายในระบบ
//           </Typography>
//         </Box>
//       </Card>
//     );
//   }

//   return (
//     <Box>
//       {renderTableHeader()}

//       <Card variant="outlined" sx={{ borderRadius: 2 }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow
//                 sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
//               >
//                 <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>
//                   ลำดับ
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>
//                   เลขที่ใบแจ้งหนี้
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
//                   ลูกค้า
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>
//                   วันที่ขาย
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>
//                   กำหนดชำระ
//                 </TableCell>
//                 <TableCell
//                   align="right"
//                   sx={{ fontWeight: 600, minWidth: 140 }}
//                 >
//                   ยอดรวม
//                 </TableCell>
//                 <TableCell
//                   align="right"
//                   sx={{ fontWeight: 600, minWidth: 140 }}
//                 >
//                   คงเหลือ
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 600, minWidth: 120 }}
//                 >
//                   การชำระ
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 600, minWidth: 120 }}
//                 >
//                   สถานะ
//                 </TableCell>
//                 <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
//                   พนักงานขาย
//                 </TableCell>
//                 <TableCell
//                   align="center"
//                   sx={{ fontWeight: 600, minWidth: 150 }}
//                 >
//                   จัดการ
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedData.map((row, index) => (
//                 <TableRow
//                   key={row._id}
//                   sx={{
//                     '&:hover': {
//                       bgcolor: alpha(theme.palette.primary.main, 0.02),
//                     },
//                   }}
//                 >
//                   {/* ลำดับ */}
//                   <TableCell>
//                     <Typography variant="body2" fontWeight={500}>
//                       {page * rowsPerPage + index + 1}
//                     </Typography>
//                   </TableCell>

//                   {/* เลขที่ใบแจ้งหนี้ */}
//                   <TableCell>
//                     <Box>
//                       <Typography variant="body2" fontWeight={600} color="primary.main">
//                         {row.invoiceNumber}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         รายการ: {row.items} รายการ
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* ลูกค้า */}
//                   <TableCell>
//                     <Box>
//                       <Typography variant="body2" fontWeight={500}>
//                         {row.customerName}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         ติดต่อ: {row.customerContact}
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* วันที่ขาย */}
//                   <TableCell>
//                     <Typography variant="body2">
//                       {formatDate(row.saleDate)}
//                     </Typography>
//                   </TableCell>

//                   {/* กำหนดชำระ */}
//                   <TableCell>
//                     <Typography 
//                       variant="body2"
//                       color={dayjs(row.dueDate).isBefore(dayjs()) && row.status !== 'paid' ? 'error.main' : 'text.primary'}
//                       fontWeight={dayjs(row.dueDate).isBefore(dayjs()) && row.status !== 'paid' ? 600 : 400}
//                     >
//                       {formatDate(row.dueDate)}
//                     </Typography>
//                   </TableCell>

//                   {/* ยอดรวม */}
//                   <TableCell align="right">
//                     <Typography
//                       variant="body1"
//                       fontWeight={600}
//                       color="primary.main"
//                     >
//                       {formatCurrency(row.totalAmount)}
//                     </Typography>
//                     {row.paidAmount > 0 && (
//                       <Typography variant="caption" color="success.main" display="block">
//                         ชำระแล้ว: {formatCurrency(row.paidAmount)}
//                       </Typography>
//                     )}
//                   </TableCell>

//                   {/* คงเหลือ */}
//                   <TableCell align="right">
//                     <Typography
//                       variant="body1"
//                       fontWeight={600}
//                       color={row.remainingAmount > 0 ? 'warning.main' : 'success.main'}
//                     >
//                       {formatCurrency(row.remainingAmount)}
//                     </Typography>
//                   </TableCell>

//                   {/* การชำระ */}
//                   <TableCell align="center">
//                     {getPaymentMethodChip(row.paymentMethod)}
//                   </TableCell>

//                   {/* สถานะ */}
//                   <TableCell align="center">
//                     {getStatusChip(row.status)}
//                   </TableCell>

//                   {/* พนักงานขาย */}
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Avatar
//                         sx={{
//                           width: 24,
//                           height: 24,
//                           fontSize: 12,
//                           bgcolor: 'primary.main',
//                         }}
//                       >
//                         {row.salesPerson?.charAt(2) || 'S'}
//                       </Avatar>
//                       <Typography variant="body2">
//                         {row.salesPerson}
//                       </Typography>
//                     </Box>
//                   </TableCell>

//                   {/* ปุ่มจัดการ */}
//                   <TableCell align="center">
//                     <Stack
//                       direction="row"
//                       spacing={0.5}
//                       justifyContent="center"
//                     >
//                       <Tooltip title="ดูรายละเอียด">
//                         <IconButton
//                           size="small"
//                           color="primary"
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.primary.main, 0.1),
//                             },
//                           }}
//                         >
//                           <ViewIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>

//                       <Tooltip title="แก้ไข">
//                         <IconButton
//                           size="small"
//                           color="warning"
//                           disabled={row.status === 'cancelled'}
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.warning.main, 0.1),
//                             },
//                           }}
//                         >
//                           <EditIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>

//                       <Tooltip title="ใบเสร็จ">
//                         <IconButton
//                           size="small"
//                           color="info"
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.info.main, 0.1),
//                             },
//                           }}
//                         >
//                           <ReceiptIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>

//                       <Tooltip title="พิมพ์">
//                         <IconButton
//                           size="small"
//                           color="info"
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.info.main, 0.1),
//                             },
//                           }}
//                         >
//                           <PrintIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>

//                       <Tooltip title="ดาวน์โหลด">
//                         <IconButton
//                           size="small"
//                           color="success"
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.success.main, 0.1),
//                             },
//                           }}
//                         >
//                           <DownloadIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>

//                       <Tooltip title="ลบ">
//                         <IconButton
//                           size="small"
//                           color="error"
//                           disabled={row.status === 'paid'}
//                           sx={{
//                             '&:hover': {
//                               bgcolor: alpha(theme.palette.error.main, 0.1),
//                             },
//                           }}
//                         >
//                           <DeleteIcon fontSize="small" />
//                         </IconButton>
//                       </Tooltip>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <TablePagination
//           component="div"
//           count={salesData.length}
//           page={page}
//           onPageChange={handleChangePage}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           labelRowsPerPage="แสดงต่อหน้า:"
//           labelDisplayedRows={({ from, to, count }) =>
//             `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
//           }
//         />
//       </Card>
//     </Box>
//   );
// }