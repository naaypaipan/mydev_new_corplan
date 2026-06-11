import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';

import { useForm, Controller } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import PaymentForm from '../../components/Forms/PaymentForm';
import { CustomerForm } from '../../components/Forms';
import _ from 'lodash';
import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
  Card,
  Paper,
  Grid,
  Divider,
  IconButton,
  Container,
  Chip,
  Alert,
} from '@mui/material';
import PaymentExpenses from '../../components/Table/PaymentExpenses';
import PaymentExpensesForm from '../../components/Forms/PaymentExpensesForm';
import dayjs from 'dayjs';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function NewPayment({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const {
    control: customerControl,
    formState: { errors: customerErrors },
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomer,
    setValue: setCustomerValue,
  } = useForm();

  const {
    control: expensesControl,
    formState: { errors: expensesErrors },
    handleSubmit: handleExpensesSubmit,
    reset: resetExpenses,
    setValue: setExpensesValue,
    watch: watchExpenses,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expensesArray',
  });

  // Selectors
  const customer = useSelector((state) => state.customer);
  const employee = useSelector((state) => state.employee);
  const customerType = useSelector((state) => state.customerType);
  const transectiontype = useSelector((state) => state.transectionTypes);
  const paytype = useSelector((state) => state.paytypes);
  const expenses = useSelector((state) => state.expenses);
  const me = useSelector((state) => state.me);

  // State
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [expensesSelect, setExpensesSelect] = useState([]);
  const [expensesChoose, setExpensesChoose] = useState();
  const [isVatIncluded, setIsVatIncluded] = useState(true);
  const [vat, setVat] = useState(7);
  const [type, setType] = useState('INDIRECT');
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState(false);
  const [editExpenseIndex, setEditExpenseIndex] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const [dateRequest, setDateRequest] = useState(new Date());
  const [datePayment, setDatePayment] = useState(new Date());

  // Load initial data
  useEffect(() => {
    dispatch(actions.customerAll({}));
    dispatch(actions.customerTypeAll({}));
    dispatch(actions.projectAll({}));
    dispatch(actions.expensesAll({}));
    dispatch(actions.employeeAll({}));
    dispatch(actions.paytypeAll({}));
    dispatch(actions.transectiontypeAll({}));
    return () => {};
  }, [page, size]);

  // Handlers for modals
  const handleOpenCustomerModal = () => setOpenCustomerModal(true);
  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    resetCustomer();
  };

  const handleOpenExpenseModal = () => setOpenExpenseModal(true);
  const handleCloseExpenseModal = () => setOpenExpenseModal(false);

  const handleOpenEditExpenseModal = async (row) => {
    const index = expensesSelect?.findIndex((item) => item?._id === row?._id);
    setEditExpenseIndex(index);
    await setExpensesValue(`project`, row?.project?.project_number);
    await setExpensesValue(
      `budget`,
      row?.budget?.prefix + row?.budget?.budget_number,
    );
    await setExpensesValue(`name`, row?.name);
    await setExpensesValue(`price`, row?.price);
    setOpenEditExpenseModal(true);
    setExpensesChoose(row);
  };

  const handleCloseEditExpenseModal = () => {
    setOpenEditExpenseModal(false);
    setEditExpenseIndex(null);
  };

  // Handle customer form submit
  const onSubmitCustomer = async (data) => {
    try {
      await dispatch(actions.customerCreate(data));
      await dispatch(actions.customerAll({}));
      handleCloseCustomerModal();
    } catch (error) {
      // handle error
    }
  };

  // Pass to PaymentForm for "Add Customer" from Autocomplete
  const handleAddCustomerFromPayment = () => {
    handleOpenCustomerModal();
  };

  // Select expense from modal
  const handleSelectExpense = (expense) => {
    setExpensesSelect((prev) => {
      if (prev.find((e) => e._id === expense._id)) return prev;
      return [...prev, expense];
    });
    handleCloseExpenseModal();
  };

  // Handle save edited expense
  const handleSaveEditExpense = (data) => {
    expensesSelect[editExpenseIndex] = {
      ...expensesSelect[editExpenseIndex],
      name: data.name,
      price: data.price,
      type,
      total: getNetTotal(),
    };
    handleCloseEditExpenseModal();
  };

  // Calculate price without VAT
  const getPriceExcludeVat = () => {
    const numPrice = parseFloat(watchExpenses('price')) || 0;
    const numVat = parseFloat(vat) || 0;
    if (!isVatIncluded || !numVat) {
      return numPrice.toFixed(2);
    } else if (numVat === 0) {
      return numPrice.toFixed(2);
    } else {
      return (numPrice / (1 + numVat / 100)).toFixed(2);
    }
  };

  // Calculate price with VAT
  const getPriceIncludeVat = () => {
    const numPrice = parseFloat(watchExpenses('price')) || 0;
    const numVat = parseFloat(vat) || 0;
    if (isVatIncluded || !numVat) return numPrice.toFixed(2);
    return (numPrice * (1 + numVat / 100)).toFixed(2);
  };

  // Calculate net total after tax and social security
  const getNetTotal = () => {
    const base = isVatIncluded
      ? parseFloat(getPriceExcludeVat()) || 0
      : parseFloat(watchExpenses('price')) || 0;
    const tax = parseFloat(watchExpenses('expenses_list.tax')) || 0;
    const sso = parseFloat(watchExpenses('expenses_list.sso')) || 0;
    const afterTax = base - (base * tax) / 100 + base * (vat / 100);
    const net = afterTax - sso;
    return net > 0 ? net.toFixed(2) : '';
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total amount from all selected expenses
  const calculateTotalAmount = () => {
    return expensesSelect.reduce((sum, expense) => {
      return sum + (parseFloat(expense.price) || 0);
    }, 0);
  };

  // Modal components
  const renderEditExpenseModal = () => {
    if (editExpenseIndex === null || !expensesSelect[editExpenseIndex])
      return null;

    return (
      <Modal
        open={openEditExpenseModal}
        onClose={handleCloseEditExpenseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300 }}
      >
        <Fade in={openEditExpenseModal}>
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
              <Typography variant="h6">แก้ไขรายการเบิก</Typography>
              <IconButton
                size="small"
                onClick={handleCloseEditExpenseModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{ p: 3, maxHeight: 'calc(90vh - 64px)', overflowY: 'auto' }}
            >
              <form onSubmit={handleExpensesSubmit(handleSaveEditExpense)}>
                <PaymentExpensesForm
                  Controller={Controller}
                  control={expensesControl}
                  expenses={expensesChoose}
                  setValue={setValue}
                  watch={watchExpenses}
                  isVatIncluded={isVatIncluded}
                  setIsVatIncluded={setIsVatIncluded}
                  vat={vat}
                  setVat={setVat}
                  getNetTotal={getNetTotal}
                  getPriceIncludeVat={getPriceIncludeVat}
                  getPriceExcludeVat={getPriceExcludeVat}
                  type={type}
                  setType={setType}
                />
              </form>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  };

  const renderExpenseModal = () => (
    <Modal
      open={openExpenseModal}
      onClose={handleCloseExpenseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={openExpenseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%', md: 800 },
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
              <ReceiptIcon sx={{ mr: 1 }} />
              <Typography variant="h6">เลือกรายการเบิก</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleCloseExpenseModal}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, maxHeight: 'calc(90vh - 64px)', overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {_?.map(expenses?.rows, (expense, index) => (
                <Grid item xs={12} key={expense?._id || index}>
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        mb: { xs: 2, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {expense?.code || '-'}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {expense?.name || '-'}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            size="small"
                            label={`โครงการ: ${
                              expense?.project?.project_number || '-'
                            }`}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            }}
                          />
                          <Chip
                            size="small"
                            label={`งบประมาณ: ${expense?.budget?.prefix || ''}${
                              expense?.budget?.budget_number || '-'
                            }`}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', sm: 'flex-end' },
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2">
                        ผู้ขอเบิก: {expense?.employee?.firstname || '-'}{' '}
                        {expense?.employee?.lastname || '-'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        วันที่ขอ:{' '}
                        {dayjs(expense?.date).format('DD/MM/YYYY') || '-'}
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleSelectExpense(expense)}
                        sx={{ mt: 0.5 }}
                      >
                        เลือก
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}

              {expenses?.rows?.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    ไม่พบรายการเบิกที่สามารถเลือกได้
                  </Alert>
                </Grid>
              )}
            </Grid>
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

  // Main components
  const renderHeader = () => (
    <Box>
      <Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<CalendarTodayIcon />}
          label={`วันที่: ${dayjs().format('DD/MM/YYYY')}`}
          variant="outlined"
        />

        <Chip
          icon={<ReceiptIcon />}
          label={`รายการ: ${expensesSelect.length}`}
          color={expensesSelect.length > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
      </Box>
    </Box>
  );

  const renderPaymentSummary = () => {
    const totalAmount = calculateTotalAmount();

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AccountBalanceIcon color="primary" />
          สรุปรายการชำระเงิน
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              จำนวนรายการ
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {expensesSelect.length} รายการ
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              ยอดรวมทั้งสิ้น
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              {formatCurrency(totalAmount)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              สถานะ
            </Typography>
            <Chip
              label="รอดำเนินการ"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const onSubmitData = async (data) => {
    const confirm = window.confirm('คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?');
    if (confirm) {
      try {
        const payload = {
          ...data,
          expenses_list: expensesSelect,
          date_request: dateRequest,
          date_payment: datePayment,
          creater: me?.userData?._id,
          payee_id: data.payee,
          payee: {
            name: data?.bank?.account_name,
            bank: data?.bank?.bank_name,
            account_number: data?.bank?.account_number,
          },
        };
        await dispatch(actions.paymentCreate(payload));
        history.goback();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const renderContent = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <DescriptionIcon color="primary" />
              ข้อมูลการชำระเงิน
            </Typography>

            <Divider sx={{ my: 2 }} />

            <PaymentForm
              Controller={Controller}
              control={control}
              employee={employee}
              setValue={setValue}
              customer={customer}
              onAddCustomer={handleAddCustomerFromPayment}
              transectiontype={transectiontype}
              paytype={paytype}
              expenses={expenses}
              dateRequest={dateRequest}
              setDateRequest={setDateRequest}
              datePayment={datePayment}
              setDatePayment={setDatePayment}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {renderPaymentSummary()}
          <form onSubmit={handleSubmit(onSubmitData)}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ReceiptIcon color="primary" />
                  รายการเบิกจ่าย
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenExpenseModal}
                >
                  เพิ่มรายการเบิก
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {expensesSelect.length > 0 ? (
                <PaymentExpenses
                  rows={expensesSelect}
                  onEdit={handleOpenEditExpenseModal}
                />
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    ยังไม่มีรายการเบิกจ่าย
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenExpenseModal}
                    sx={{ mt: 1 }}
                  >
                    เพิ่มรายการเบิก
                  </Button>
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                sx={{ px: 4 }}
              >
                บันทึกรายการ
              </Button>
            </Box>
          </form>
        </Grid>
      </Grid>

      {renderCustomerModal()}
      {renderExpenseModal()}
      {renderEditExpenseModal()}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      {renderHeader()}
      {renderContent()}
    </Container>
  );
}

NewPayment.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
