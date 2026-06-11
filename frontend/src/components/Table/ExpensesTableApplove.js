import React, { useState } from 'react';

import {
  Table,
  TableHead,
  TableContainer,
  Paper,
  TableCell,
  TableRow,
  TableBody,
  Button,
  TablePagination,
  Chip,
  Checkbox,
  Stack,
  Box,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import { PAIDTYPE_STATUS } from 'utils/constants';
import { PAID_STATUS } from 'utils/constants';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import LaunchIcon from '@mui/icons-material/Launch';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function ExpensesTableApplove({
  expenses,
  page,
  size,
  setPage,
  setSize,
  handleEdit,
  handleDelete,
  filter,
  handlePreApprove,
  handleApprove,
  handleApprove1,
  handleApprove2,
  handleApprove3,
  handleSuccess,
  handleBillPickup,
  handleDetail,
  handleOpenPay,
  handleAddMultiPayment,
  selectedRows,
  setSelectedRows,
  handleReject,
  handleReject1,
  handleReject2,
  handleReject3,
  handleHold,
  handleReset,
  handleOpenPrepareModal,
  handlePrepareStatus,
  handleOpenDetailModal,
  me,
  info,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  // Get current user ID
  const currentUserId = me?.userData?._id;

  // Helper function to extract ID (handle both string IDs and objects with _id)
  const getIdValue = (approver) => {
    if (!approver) return null;
    return approver?._id || approver;
  };

  // Check if user is the designated approver at each level
  const canApprove1 =
    currentUserId && getIdValue(info?.expense_approver_1) === currentUserId;
  const canApprove2 =
    currentUserId && getIdValue(info?.expense_approver_2) === currentUserId;
  const canApprove3 =
    currentUserId && getIdValue(info?.expense_approver_3) === currentUserId;
  const canApproveAny = canApprove1 || canApprove2 || canApprove3;

  const approvalMode = info?.expense_approval_mode || 'THREE_STEP';
  const isOneStep = approvalMode === 'ONE_STEP';

  const checkColor = (e) => {
    if (e?.status === 'PENDING')
      return (
        <Chip
          size="small"
          label={isOneStep ? 'Pending' : 'Pending (1st)'}
          color="default"
        />
      );
    if (e?.status === 'APPROVE_1')
      return <Chip size="small" label="1st Approved" color="secondary" />;
    if (e?.status === 'APPROVE_2')
      return <Chip size="small" label="2nd Approved" color="primary" />;
    if (e?.status === 'PREAPPROVE')
      return <Chip size="small" label="Pre-Approved" color="secondary" />;
    if (e?.status === 'APPROVE')
      return (
        <Chip
          size="small"
          label={isOneStep ? 'Approved' : '3rd Approved'}
          color="warning"
        />
      );
    if (e?.status === 'SUCCESS')
      return <Chip size="small" label="Success" color="success" />;
    if (e?.status === 'REJECT')
      return <Chip size="small" label="Rejected" color="error" />;
    if (e?.status === 'HOLD')
      return <Chip size="small" label="Hold" color="error" />;
    if (e?.status === 'PREPARE')
      return <Chip size="small" label="Prepared" color="info" />;
    if (e?.status === 'CANCEL')
      return (
        <Chip
          size="small"
          label="Cancelled"
          sx={{ backgroundColor: 'black', color: 'white' }}
        />
      );
  };

  const handleSelectRow = (data) => {
    setSelectedRows((prev) =>
      prev.some((row) => row?._id === data?._id)
        ? prev?.filter((rowId) => rowId !== data)
        : [...prev, data],
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filter
        .filter((e) => e.status === 'APPROVE' || e.status === 'PREPARE')
        .map((e) => e);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const renderActionButtons = (e) => {
    // One-step mode: simplified approve / reject at PENDING
    if (isOneStep && e?.status === 'PENDING') {
      if (!canApproveAny) {
        return (
          <Tooltip title="ไม่มีสิทธิ์อนุมัติ" placement="top">
            <Box
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              <p>ไม่มีสิทธิ์อนุมัติ</p>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => handleApprove(e._id)}
            fullWidth={isMobile}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => handleReject(e._id)}
            fullWidth={isMobile}
          >
            Reject
          </Button>
        </Stack>
      );
    }

    // Three-step mode: original multi-step behaviour
    if (!isOneStep && e?.status === 'PENDING') {
      // Show 1st Approve button only if user is the designated approver_1
      if (!canApprove1) {
        return (
          <Tooltip
            title="ต้องเป็นผู้อนุมัติระดับ 1 ตามที่ระบุในระบบ"
            placement="top"
          >
            <Box
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              <p>ไม่มีสิทธิ์อนุมัติ</p>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => handleApprove1(e._id)}
            fullWidth={isMobile}
          >
            1st Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => handleReject1(e._id)}
            fullWidth={isMobile}
          >
            Reject
          </Button>
        </Stack>
      );
    }
    if (!isOneStep && e?.status === 'APPROVE_1') {
      // Show 2nd Approve button only if user is the designated approver_2
      if (!canApprove2) {
        return (
          <Tooltip
            title="ต้องเป็นผู้อนุมัติระดับ 2 ตามที่ระบุในระบบ"
            placement="top"
          >
            <Box
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              <p>ไม่มีสิทธิ์อนุมัติ</p>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => handleApprove2(e._id)}
            fullWidth={isMobile}
          >
            2nd Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => handleReject2(e._id)}
            fullWidth={isMobile}
          >
            Reject
          </Button>
        </Stack>
      );
    }
    if (!isOneStep && e?.status === 'APPROVE_2') {
      // Show 3rd Approve button only if user is the designated approver_3
      if (!canApprove3) {
        return (
          <Tooltip
            title="ต้องเป็นผู้อนุมัติระดับ 3 ตามที่ระบุในระบบ"
            placement="top"
          >
            <Box
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              <p>ไม่มีสิทธิ์อนุมัติ</p>
            </Box>
          </Tooltip>
        );
      }
      return (
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => handleApprove3(e._id)}
            fullWidth={isMobile}
          >
            3rd Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={() => handleReject3(e._id)}
            fullWidth={isMobile}
          >
            Reject
          </Button>
        </Stack>
      );
    }
    if (e?.status === 'APPROVE') {
      return (
        <Stack
          direction={isMobile ? 'row' : 'column'}
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => handleOpenPay(e)}
            fullWidth={isMobile}
          >
            Add Payment
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleReset(e._id)}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
        </Stack>
      );
    }
    // if (e?.status === 'PREAPPROVE') {
    //   return (
    //     <Stack
    //       direction={isMobile ? 'row' : 'column'}
    //       spacing={1}
    //       sx={{ width: '100%' }}
    //     >
    //       <Button
    //         variant="contained"
    //         size="small"
    //         color="info"
    //         onClick={() => handlePrepareStatus(e._id)}
    //         fullWidth={isMobile}
    //       >
    //         Prepare
    //       </Button>
    //       <Button
    //         variant="outlined"
    //         size="small"
    //         color="error"
    //         onClick={() => handleReset(e._id)}
    //         fullWidth={isMobile}
    //       >
    //         Cancel
    //       </Button>
    //     </Stack>
    //   );
    // }
    // if (e?.status === 'PREPARE') {
    //   return (
    //     <Button
    //       variant="outlined"
    //       size="small"
    //       color="error"
    //       onClick={() => handleReset(e._id)}
    //       fullWidth={isMobile}
    //     >
    //       Cancel
    //     </Button>
    //   );
    // }
    if (e?.status === 'REJECT') {
      return (
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => handleReset(e._id)}
          fullWidth={isMobile}
        >
          RESET
        </Button>
      );
    }
    if (e?.status === 'HOLD') {
      return (
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => handleReset(e._id)}
          fullWidth={isMobile}
        >
          RESET
        </Button>
      );
    }
    if (e?.status === 'CANCEL') {
      return (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleReset(e._id)}
          fullWidth={isMobile}
        >
          RESET
        </Button>
      );
    }
  };

  return (
    <div>
      <Paper>
        <div className="p-2 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                filter?.length > 0 &&
                filter?.filter(
                  (e) => e.status === 'APPROVE' || e.status === 'PREPARE',
                )?.length > 0 &&
                selectedRows?.length ===
                  filter?.filter(
                    (e) => e.status === 'APPROVE' || e.status === 'PREPARE',
                  )?.length
              }
              indeterminate={
                selectedRows?.length > 0 &&
                selectedRows?.length <
                  filter?.filter(
                    (e) => e.status === 'APPROVE' || e.status === 'PREPARE',
                  )?.length
              }
              onChange={handleSelectAll}
              size="small"
            />
            <div className="text-sm">เลือกทั้งหมด</div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full lg:w-auto">
            {selectedRows?.length !== 0 && (
              <div className="flex-1 sm:flex-initial">
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedRows?.length === 0}
                  onClick={() => handleAddMultiPayment(selectedRows)}
                  fullWidth
                >
                  Add Payment ({selectedRows.length})
                </Button>
              </div>
            )}
            {/* <div className="flex-1 sm:flex-initial">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleOpenPrepareModal()}
                fullWidth
              >
                Prepare
              </Button>
            </div> */}
          </div>
        </div>

        {isMobile ? (
          // Mobile Card View
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {_.isEmpty(filter) ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <p>ไม่มีข้อมูล</p>
              </Box>
            ) : (
              filter.map((e, index) => (
                <Card key={e._id} sx={{ position: 'relative' }}>
                  <CardContent>
                    {/* No. */}
                    <Box
                      sx={{
                        mt: 4,
                        fontWeight: 'bold',
                        color: '#999',
                        fontSize: '0.75rem',
                      }}
                    >
                      #{index + 1}
                    </Box>

                    {/* Date Created & Status */}
                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <div className="text-xs text-gray-500">วันที่สร้าง</div>
                        <div className="font-semibold text-sm">
                          {dayjs(e?.createdAt).format('DD/MM/YYYY')}
                        </div>
                      </Box>
                      <Box>{checkColor(e)}</Box>
                    </Box>

                    {/* Code & Request Date */}
                    <Box sx={{ mb: 2, borderTop: '1px solid #eee', pt: 1 }}>
                      <div className="text-xs text-gray-500">เอกสาร</div>
                      <div className="font-bold text-theme-600 text-sm mb-1">
                        {e?.code}
                      </div>
                      <div className="text-xs text-gray-500">วันที่ขอ</div>
                      <div className="text-sm">
                        {dayjs(e?.date).format('DD/MM/YYYY')}
                      </div>
                    </Box>

                    {/* Type */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">ประเภท</div>
                      {e?.expenses_type === 'PAY' ? (
                        <Chip
                          size="small"
                          label="เบิกเพื่อจ่าย"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      ) : e?.expenses_type === 'REFUND' ? (
                        <Chip
                          size="small"
                          label="เบิกคืน"
                          color="secondary"
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip size="small" label="-" sx={{ mt: 0.5 }} />
                      )}
                    </Box>

                    {/* Project & Budget */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">โครงการ</div>
                      <div className="font-bold text-sm">
                        {e?.project?.project_number || '-'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {e?.budget?.prefix}
                        {e?.budget?.budget_number} {e?.budget?.name || '-'}
                      </div>
                    </Box>

                    {/* Order */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">รายการ</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-sm">{e?.name}</span>
                        <Tooltip title="หน้าดูรายละเอียดและอัปโหลด">
                          <IconButton
                            size="small"
                            onClick={() => handleDetail(e._id)}
                            sx={{ p: 0 }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isMobile && handleOpenDetailModal && (
                          <Tooltip title="ดูรายละเอียดแบบย่อ">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenDetailModal(e)}
                              sx={{ p: 0, ml: 1 }}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </Box>

                    {/* Amount - ยอดจ่ายจริงเท่านั้น */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">ยอดจ่ายจริง</div>
                      <div className="font-bold text-lg text-green-600">
                        ฿
                        {(e?.net_price ?? ((e?.price || 0) - (e?.withholding_tax || 0)))
                          .toFixed(0)
                          .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                      </div>
                    </Box>

                    {/* Payee */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">ผู้รับ</div>
                      <div className="text-sm">
                        <p className="mb-1">
                          <b>ชื่อ:</b> {e?.payee?.name || '-'}
                        </p>
                        <p className="mb-1">
                          <b>ธนาคาร:</b> {e?.payee?.bank || '-'}
                        </p>
                        <p>
                          <b>บัญชี:</b> {e?.payee?.account_number || '-'}
                        </p>
                      </div>
                    </Box>

                   

                    {/* Applicant */}
                    <Box sx={{ mb: 2 }}>
                      <div className="text-xs text-gray-500">ผู้ขอ</div>
                      <div className="text-sm font-semibold">
                        {e?.employee?.firstname} {e?.employee?.lastname}
                      </div>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
                      {renderActionButtons(e)}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          // Desktop Table View
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow className="bg-theme-600">
                  <TableCell align="center"></TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">No.</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">Date Created</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">ID / Request Date</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">Type</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">Project</h1>
                  </TableCell>

                  <TableCell align="center">
                    <h1 className="text-white">Order</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">ยอดจ่ายจริง</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">Payee</h1>
                  </TableCell>
                 
                  <TableCell align="center">
                    <h1 className="text-white">Applicant</h1>
                  </TableCell>
                  <TableCell align="center">
                    <h1 className="text-white">Actions</h1>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_.isEmpty(filter) ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      No items
                    </TableCell>
                  </TableRow>
                ) : (
                  filter.map((e, index) => (
                    <TableRow key={e._id}>
                      <TableCell align="center">
                        <Checkbox
                          checked={selectedRows.some(
                            (row) => row._id === e._id,
                          )}
                          onChange={() => handleSelectRow(e)}
                          disabled={
                            e.status !== 'APPROVE' && e.status !== 'PREPARE'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">
                        <h1>{dayjs(e?.createdAt).format('DD/MM/YYYY')}</h1>
                        <h1>{checkColor(e)}</h1>
                      </TableCell>
                      <TableCell align="center">
                        <h1 className="font-bold text-theme-600">{e?.code}</h1>
                        <h1>{dayjs(e?.date).format('DD/MM/YYYY')}</h1>
                      </TableCell>
                      <TableCell align="center">
                        {e?.expenses_type === 'PAY' ? (
                          <Chip
                            size="small"
                            label="เบิกเพื่อจ่าย"
                            color="primary"
                          />
                        ) : e?.expenses_type === 'REFUND' ? (
                          <Chip
                            size="small"
                            label="เบิกคืน"
                            color="secondary"
                          />
                        ) : (
                          <Chip size="small" label="-" />
                        )}
                      </TableCell>
                      <TableCell>
                        <h1 className="font-bold">
                          {e?.project?.project_number || '-'}
                        </h1>
                        {/* <h1>{e?.project?.name || '-'}</h1> */}
                        <h1 className="font-bold">
                          {e?.budget?.prefix}
                          {e?.budget?.budget_number} {e?.budget?.name || '-'}
                        </h1>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          <h1>{e?.name}</h1>
                          <Tooltip title="หน้าดูรายละเอียดและอัปโหลด">
                            <IconButton
                              size="small"
                              onClick={() => handleDetail(e._id)}
                            >
                              <LaunchIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          {isMobile && handleOpenDetailModal && (
                            <Tooltip title="ดูรายละเอียดแบบย่อ">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenDetailModal(e)}
                              >
                                <InfoOutlinedIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        ฿
                        {(e?.net_price ?? ((e?.price || 0) - (e?.withholding_tax || 0)))
                          .toFixed(2)
                          .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                      </TableCell>
                      <TableCell>
                        <h1>
                          <b>Name: </b>
                          {e?.payee?.name || '-'}
                        </h1>
                        <h1>
                          <b>Bank: </b>
                          {e?.payee?.bank || '-'}
                        </h1>
                        <h1>
                          <b>Account: </b>
                          {e?.payee?.account_number || '-'}
                        </h1>
                      </TableCell>
                     
                      <TableCell align="center">
                        {e?.employee?.firstname} {e?.employee?.lastname}
                      </TableCell>
                      <TableCell>{renderActionButtons(e)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 
        <TablePagination
          rowsPerPageOptions={[30, 70, 100, 500, 1000]}
          component="div"
          count={expenses?.total || 0}
          rowsPerPage={size}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </Paper>
    </div>
  );
}
