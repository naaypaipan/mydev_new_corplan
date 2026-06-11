import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import * as actions from '../../redux/actions';

import {
  Box,
  Button,
  Modal,
  Typography,
  Stack,
  Paper,
  Grid,
  Divider,
  Chip,
  useTheme,
  alpha,
  Card,
  Container,
  Tooltip,
  IconButton,
  Backdrop,
  Fade,
  LinearProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import ExpensesApplyForm from '../../components/Forms/ExpensesApplyForm';
import { ExpensesTableApplove } from '../../components/Table';
import ExpensesHrApplyForm from '../../components/Forms/ExpensesHrApplyForm';
import AddpayoutForm from '../../components/Forms/AddpayoutForm';
import { expensesReport } from 'components/PDF';
import FilterFinanceExpenses from '../../components/Card/FilterFinanceExpenses';
import FinanceExcel from '../../components/Excel/FinanceExcel';
import { ButtonGroup } from 'components/Button';
import dayjs from 'dayjs';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import GetAppIcon from '@mui/icons-material/GetApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { CustomerForm } from 'components/Forms';
import DatePickerCard from 'components/Card/DatePickerCard';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: '60%' },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  maxHeight: '90vh',
  overflow: 'auto',
};

function AllExpensesList({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();

  const expenses = useSelector((state) => state.expenses);
  const projects = useSelector((state) => state.project);
  const customer = useSelector((state) => state.customer);
  const customerType = useSelector((state) => state.customerType);
  const me = useSelector((state) => state.me);
  const info = useSelector((state) => state.info);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [paidType, setPaidType] = useState('TRANSFER');
  const [projectSelect, setProjectSelect] = useState('');
  const [budgetSelect, setBudgetSelect] = useState('');
  const [openPay, setOpenPay] = useState(false);
  const [datePay, setDatePay] = useState(new Date());
  const [exSelect, setExSelect] = useState('');
  const [bank, setBank] = useState();
  const [findProject, setFindProject] = useState('');
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState([new Date(), new Date()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [customerSelect, setCustomerSelect] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openPrepareModal, setOpenPrepareModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleOpenDetailModal = (data) => {
    setDetailData(data);
    setOpenDetailModal(true);
  };
  
  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setDetailData(null);
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm();

  const {
    control: customerControl,
    formState: { errors: customerErrors },
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomer,
    setValue: setCustomerValue,
  } = useForm();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenCustomerModal = () => setOpenCustomerModal(true);
  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    resetCustomer();
  };

  const handleOpenPrepareModal = () => setOpenPrepareModal(true);
  const handleClosePrepareModal = () => setOpenPrepareModal(false);

  const handleExport = () => {
    const { exportToExcel } = FinanceExcel({
      data: expenses?.rows || [],
      fileName: 'expenses_report',
    });
    exportToExcel();
  };

  const handleOpenPay = (e) => {
    setOpenPay(true);
    setExSelect(e);
    const net =
      e?.net_price != null
        ? Number(e.net_price)
        : (Number(e?.price) || 0) - (Number(e?.withholding_tax) || 0);
    setValue('price', net > 0 ? net : '');
  };

  const handleClosePay = () => setOpenPay(false);

  const fetchExpenses = async () => {
    const ds = dayjs(dateStart?.[0]);
    const de = dayjs(dateStart?.[1]);
    if (!ds.isValid() || !de.isValid()) return;

    setIsRefreshing(true);
    await dispatch(
      actions.expensesAll({
        search,
        findProject: findProject?._id,
        dateStart: ds.startOf('day').toDate(),
        dateEnd: de.endOf('day').toDate(),
      }),
    );
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchExpenses();

    return () => {};
  }, [page, size, search, findProject, dateStart]);

  // Socket.IO real-time listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchExpenses();

    socket.on('expenses:created', refresh);
    socket.on('expenses:updated', refresh);
    socket.on('expenses:deleted', refresh);
    socket.on('payout:created', refresh);

    return () => {
      socket.off('expenses:created', refresh);
      socket.off('expenses:updated', refresh);
      socket.off('expenses:deleted', refresh);
      socket.off('payout:created', refresh);
    };
  }, [socket, page, size, search, findProject, dateStart]);

  useEffect(() => {
    dispatch(actions.projectAll({}));
    dispatch(actions.customerAll({}));
    dispatch(actions.meGet());
    dispatch(actions.getInformation({}));
    dispatch(actions.customerAll({}));
    dispatch(actions.customerTypeAll({}));
    return () => {};
  }, []);

  useEffect(() => {
    dispatch(actions.budgetAll({ project_id: projectSelect?.id }));
    return () => {};
  }, [projectSelect]);

  const filter = expenses?.rows;

  const handleDelete = async (id) => {
    const confirm = window.confirm('ลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.expensesPut(id, { status: 'CANCEL' }));
        fetchExpenses();
      } catch (error) {}
    }
  };

  const handleEdit = (id) => {
    history.push(`/finance/expenses/edit/${id}`);
  };

  const handleDetail = (id) => {
    history.push(`/finance/expenses/detail/${id}`);
  };

  const handlePreApprove = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'PREAPPROVE',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleApprove1 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'APPROVE_1',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleApprove2 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'APPROVE_2',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleApprove3 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'APPROVE',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleApprove = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'APPROVE',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleSuccess = async (id) => {
    await dispatch(actions.expensesPut(id, { status: 'SUCCESS' }));
    fetchExpenses();
  };

  const handleReject1 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'REJECT',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleReject2 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'REJECT_2',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleReject3 = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'REJECT_3',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleReject = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'REJECT',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };

  const handleHold = async (id) => {
    await dispatch(actions.expensesPut(id, { status: 'HOLD' }));
    fetchExpenses();
  };

  const handleBillPickup = async (id) => {
    await dispatch(actions.expensesPut(id, { bill_pickup: true }));
    fetchExpenses();
  };

  const handleReset = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'PENDING',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    fetchExpenses();
  };
  const handlePrepareStatus = async (id) => {
    await dispatch(actions.expensesPut(id, { status: 'PREPARE' }));
    fetchExpenses();
  };

  const handlePrint = async () => {
    // ส่งเฉพาะรายการที่ไม่รวม Reject/Cancel/Hold เข้า PDF
    expensesReport(
      { ...expenses, rows: filteredExpenses },
      { ...info, date: dateStart[0] },
    );
  };
  const onSubmitCustomer = async (data) => {
    try {
      data.bank = {
        bank_name: bank,
        account_name: data?.bank?.account_name,
        account_number: data?.bank?.account_number,
      };
      await dispatch(actions.customerCreate(data));
      await dispatch(actions.customerAll({}));
      handleCloseCustomerModal();
    } catch (error) {
      // handle error
    }
  };
  const handleAddCustomerFromPayment = () => {
    handleOpenCustomerModal();
  };

  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        paidType,
        date: dayjs(date).endOf('day').toISOString(),
        employee: me?.userData?._id,
        employee_data: me?.userData,
        budgetSelect: budgetSelect?._id,
        projectSelect,
        customer: customerSelect,
      };
      await dispatch(actions.expensesCreateWithOutNotify(dataSubmit));
      fetchExpenses();
      reset();
      handleClose();
    }
  };

  const onSubmitPay = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        paidType,
        date: datePay,
        employee: me?.userData?._id,
        expenses: exSelect?.id,
        budget: exSelect?.budget?._id,
      };
      await dispatch(actions.payoutCreate(dataSubmit));
      await dispatch(actions.payoutAll({}));
      await dispatch(actions.expensesPut(exSelect?._id, { status: 'SUCCESS' }));
      fetchExpenses();
      reset();
      handleClosePay();
    }
  };

  const handleAddMultiPayment = async () => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      await dispatch(actions.payoutCreate(selectedRows));
      await fetchExpenses();
      setSelectedRows([]);
    }
  };

  const handleCreatePayment = async () => {
    await dispatch(actions.paymentCreateWithExpenses({ date: date }));
    history.push('/finance/payment');
    handleClosePrepareModal();
  };

  const handleClick = () => {
    if (selectedIndex === 0) {
      handleOpen();
    }
    if (selectedIndex === 1) {
      handlePrint();
    }
    if (selectedIndex === 2) {
      handleExport();
    }
  };

  // คำนวณข้อมูลสรุป — ยอดจ่ายจริง (net) ให้ตรงกับคอลัมน์ในตาราง
  const getNet = (expense) => {
    const raw =
      expense?.net_price != null
        ? Number(expense.net_price)
        : (expense?.price || 0) - (expense?.withholding_tax || 0);
    return Number.isFinite(raw) ? raw : 0;
  };

  // คำนวณข้อมูลสรุป (ไม่รวมรายการที่ Reject, Cancel, Hold)
  const rejectedStatuses = ['REJECT', 'REJECT_2', 'REJECT_3', 'CANCEL', 'HOLD'];
  const filteredExpenses =
    filter?.filter(
      (item) => !rejectedStatuses.includes(item?.status),
    ) || [];

  const totalCount = filteredExpenses?.length || 0;
  const totalAmount =
    filteredExpenses?.reduce((sum, expense) => sum + getNet(expense), 0) || 0;
  const pendingCount =
    filteredExpenses?.filter((item) =>
      ['PENDING', 'APPROVE_1', 'APPROVE_2'].includes(item.status),
    ).length || 0;
  const pendingAmount =
    filteredExpenses
      ?.filter((item) =>
        ['PENDING', 'APPROVE_1', 'APPROVE_2'].includes(item.status),
      )
      .reduce((sum, expense) => sum + getNet(expense), 0) || 0;
  const approvedCount =
    filteredExpenses?.filter((item) => item.status === 'APPROVE').length || 0;
  const approvedAmount =
    filteredExpenses
      ?.filter((item) => item.status === 'APPROVE')
      .reduce((sum, expense) => sum + getNet(expense), 0) || 0;
  const successCount =
    filteredExpenses?.filter((item) => item.status === 'SUCCESS').length || 0;
  const successAmount =
    filteredExpenses
      ?.filter((item) => item.status === 'SUCCESS')
      .reduce((sum, expense) => sum + getNet(expense), 0) || 0;

  const renderModalAddPayment = () => (
    <Modal
      open={openPay}
      onClose={handleClosePay}
      aria-labelledby="modal-payment-title"
      closeAfterTransition
    >
      <Fade in={openPay}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" className="mb-4">
            เพิ่มข้อมูลการชำระเงิน
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form onSubmit={handleSubmit(onSubmitPay)}>
            <AddpayoutForm
              control={control}
              Controller={Controller}
              date={datePay}
              setDate={setDatePay}
              paidType={paidType}
              expenseData={exSelect}
            />
          </form>
        </Box>
      </Fade>
    </Modal>
  );

  const renderPrepareModal = () => (
    <Modal
      open={openPrepareModal}
      onClose={handleClosePrepareModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            สร้างรายการจ่ายเงิน
          </Typography>
        </Box>

        {/* Content */}
        <Box
          id="modal-modal-description"
          sx={{
            p: 3,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <DatePickerCard setDate={setDate} date={date} />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            bgcolor: 'grey.50',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClosePrepareModal}
            sx={{ minWidth: 100 }}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ minWidth: 100 }}
            onClick={handleCreatePayment}
          >
            สร้างรายการ
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const renderModal = () => (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-expense-title"
      closeAfterTransition
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" className="mb-4">
            เพิ่มรายการเบิกจ่าย
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ExpensesApplyForm
              control={control}
              Controller={Controller}
              date={date}
              setDate={setDate}
              paidType={paidType}
              setPaidType={setPaidType}
              projects={projects}
              setProjectSelect={setProjectSelect}
              projectSelect={projectSelect}
              setValue={setValue}
              budgetSelect={budgetSelect}
              setBudgetSelect={setBudgetSelect}
              bank={bank}
              setBank={setBank}
              customer={customer}
              onAddCustomer={handleAddCustomerFromPayment}
              setCustomerSelect={setCustomerSelect}
              watch={watch}
            />
          </form>
        </Box>
      </Fade>
    </Modal>
  );

  const renderApprovalsInfo = () => {
    const approvalMode = info?.expense_approval_mode || 'THREE_STEP';
    const isOneStep = approvalMode === 'ONE_STEP';

    return (
      <Box
        sx={{
          mb: 2,
          px: 1.5,
          py: 1,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          <span
            style={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            รูปแบบการอนุมัติ:
          </span>{' '}
          <span>
            {isOneStep ? '1 ขั้นตอน (อนุมัติครั้งเดียว)' : '3 ขั้น (ไล่ระดับ)'}
          </span>
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.85rem', mt: 0.5 }}
        >
          <span
            style={{ fontWeight: 600, color: theme.palette.text.secondary }}
          >
            ผู้อนุมัติ:
          </span>{' '}
          {isOneStep ? (
            <span>
              {info?.expense_approver_1?.firstname}{' '}
              {info?.expense_approver_1?.lastname || '-'}
            </span>
          ) : (
            <span>
              ({info?.expense_approver_1?.firstname}{' '}
              {info?.expense_approver_1?.lastname || '-'} →{' '}
              {info?.expense_approver_2?.firstname}{' '}
              {info?.expense_approver_2?.lastname || '-'} →{' '}
              {info?.expense_approver_3?.firstname}{' '}
              {info?.expense_approver_3?.lastname || '-'})
            </span>
          )}
        </Typography>
      </Box>
    );
  };

  const renderSummary = () => (
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
          <Grid item xs={6} sm={6} md={3}>
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
                  รายการทั้งหมด
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

          <Grid item xs={6} sm={6} md={3}>
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
                  color="success.main"
                  sx={{ lineHeight: 1.2 }}
                >
                  ฿
                  {totalAmount
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
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
                <TrendingUpIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  รออนุมัติ
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="warning.main"
                  sx={{ lineHeight: 1.2 }}
                >
                  ฿
                  {pendingAmount
                    .toFixed(2)
                    .replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.06),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: theme.palette.info.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EventNoteIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  ช่วงวันที่
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}
                >
                  {dayjs(dateStart[0]).format('DD/MM')}-
                  {dayjs(dateStart[1]).format('DD/MM')}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  const renderTable = () => (
    <ExpensesTableApplove
      expenses={expenses}
      page={page}
      size={size}
      setPage={setPage}
      setSize={setSize}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      filter={filter}
      handlePreApprove={handlePreApprove}
      handleApprove={handleApprove}
      handleApprove1={handleApprove1}
      handleApprove2={handleApprove2}
      handleApprove3={handleApprove3}
      handleReject1={handleReject1}
      handleReject2={handleReject2}
      handleReject3={handleReject3}
      handleSuccess={handleSuccess}
      handleBillPickup={handleBillPickup}
      handleDetail={handleDetail}
      handleOpenPay={handleOpenPay}
      handleAddMultiPayment={handleAddMultiPayment}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      handleReject={handleReject}
      handleHold={handleHold}
      handleReset={handleReset}
      handleOpenPrepareModal={handleOpenPrepareModal}
      handlePrepareStatus={handlePrepareStatus}
      handleOpenDetailModal={handleOpenDetailModal}
      me={me}
      info={info}
    />
  );

  const options = ['CREATE EXPENSE', 'PRINT REPORT', 'EXPORT TO EXCEL'];

  const renderFiltersAndActions = () => (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <FilterFinanceExpenses
            project={projects}
            setFindProject={setFindProject}
            setSearch={setSearch}
            dateStart={dateStart}
            setDateStart={setDateStart}
          />
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: 'flex', md: 'flex' }, flexShrink: 0 }}
        >
        
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ borderRadius: 1.5 }}
          >
            พิมพ์
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="success"
            startIcon={<GetAppIcon />}
            onClick={handleExport}
            sx={{ borderRadius: 1.5 }}
          >
            Excel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );

  const renderDetailModal = () => (
    <Modal
      open={openDetailModal}
      onClose={handleCloseDetailModal}
      aria-labelledby="modal-detail-title"
      closeAfterTransition
    >
      <Fade in={openDetailModal}>
        <Box sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" fontWeight="bold">
              รายละเอียดรายการเบิกจ่ายแบบย่อ
            </Typography>
            <IconButton onClick={handleCloseDetailModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {detailData && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">รหัสเอกสาร</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">{detailData?.code}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">วันที่ขอเบิก</Typography>
                <Typography variant="body1">{dayjs(detailData?.date).format('DD/MM/YYYY')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">โครงการ</Typography>
                <Typography variant="body1">{detailData?.project?.name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">งบประมาณ</Typography>
                <Typography variant="body1">
                  {detailData?.budget?.prefix}{detailData?.budget?.budget_number} {detailData?.budget?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">ผู้ขอเบิก</Typography>
                <Typography variant="body1">{detailData?.employee?.firstname} {detailData?.employee?.lastname}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">ยอดจ่ายจริง</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ฿{(detailData?.net_price ?? ((detailData?.price || 0) - (detailData?.withholding_tax || 0))).toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">รายการเบิก</Typography>
                <Typography variant="body1">{detailData?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">ผู้รับเงิน</Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, mt: 0.5 }}>
                  <Typography variant="body2"><b>ชื่อ:</b> {detailData?.payee?.name || '-'}</Typography>
                  <Typography variant="body2"><b>ธนาคาร:</b> {detailData?.payee?.bank || '-'}</Typography>
                  <Typography variant="body2"><b>เลขบัญชี:</b> {detailData?.payee?.account_number || '-'}</Typography>
                </Box>
              </Grid>
              {detailData?.budget && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>การใช้งบประมาณ</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ flexGrow: 1 }}>
                      ใช้งบไปแล้ว (ประเมินคร่าวๆ)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(((detailData?.budget?.total_expenses || 0) + detailData?.price) / (detailData?.budget?.cost || 1) * 100, 100) || 0} 
                    color={((detailData?.budget?.total_expenses || 0) + detailData?.price) / (detailData?.budget?.cost || 1) * 100 > 90 ? 'error' : 'primary'}
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">งบตั้งต้น</Typography>
                      <Typography variant="body2" color="primary">฿{(detailData?.budget?.cost || 0).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">ใช้ไปแล้ว</Typography>
                      <Typography variant="body2" color="error">฿{(detailData?.budget?.total_expenses || 0).toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">คงเหลือ</Typography>
                      <Typography variant="body2" color="success.main">฿{(detailData?.budget?.remain || 0).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="outlined" onClick={handleCloseDetailModal}>
              ปิด
            </Button>
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => {
              const id = detailData?._id;
              handleCloseDetailModal();
              history.push(`/finance/expenses/detail/${id}`);
            }}>
              ดูรายละเอียดแบบเต็ม
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderCustomerModal = () => (
    <Modal
      open={openCustomerModal}
      onClose={handleCloseCustomerModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={openCustomerModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%', md: 700 },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography variant="h6">เพิ่มลูกค้าใหม่</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleCloseCustomerModal}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, maxHeight: 'calc(90vh - 64px)', overflowY: 'auto' }}>
            <form onSubmit={handleCustomerSubmit(onSubmitCustomer)}>
              <CustomerForm
                Controller={Controller}
                control={customerControl}
                errors={customerErrors}
                customerType={customerType}
                bank={bank}
                setBank={setBank}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 3,
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCloseCustomerModal}
                  startIcon={<CloseIcon />}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<CheckCircleIcon />}
                >
                  บันทึกข้อมูล
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  return (
    <div>
      {/* {renderTitle()} */}
      <div className="flex justify-end">{renderFiltersAndActions()}</div>
      {renderSummary()}
      {/* {renderApprovalsInfo()} */}
      {renderTable()}
      {renderModal()}
      {renderDetailModal()}
      {renderModalAddPayment()}
      {renderCustomerModal()}
      {renderPrepareModal()}
    </div>
  );
}

export default AllExpensesList;
