import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import * as actions from '../../redux/actions';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';

import Loading from 'components/Loading';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ExpensesApplyForm from '../../components/Forms/ExpensesApplyForm';
import {
  Box,
  Button,
  Card,
  Fade,
  IconButton,
  Modal,
  Typography,
  Backdrop,
} from '@mui/material';
import { BackButton } from 'components/Button';
import dayjs from 'dayjs';
import { CustomerForm } from 'components/Forms';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function EditExpenses({ title, subtitle }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const expenses = useSelector((state) => state.expenses);
  const projects = useSelector((state) => state.project);
  const budget = useSelector((state) => state.budget);
  const customer = useSelector((state) => state.customer);
  const customerType = useSelector((state) => state.customerType);

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

  const [date, setDate] = useState(expenses?.date);

  const [projectSelect, setProjectSelect] = useState('');
  const [budgetSelect, setBudgetSelect] = useState('');
  const [bank, setBank] = useState();
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [customerSelect, setCustomerSelect] = useState();

  const eachBudget = _.find(budget?.rows, { _id: budgetSelect?._id });

  useEffect(() => {
    dispatch(actions.expensesGet(id));
    dispatch(actions.projectAll({}));
    return () => {};
  }, []);

  useEffect(() => {
    setValue('name', expenses?.name);
    setValue('price', expenses?.price);
    setValue('code', expenses?.code);
    setValue('withholding_tax', expenses?.withholding_tax);
    setValue('withholding_tax_rate', expenses?.withholding_tax_rate || 3);
    setValue('includes_vat', expenses?.includes_vat);
    setValue('vat_amount', expenses?.vat_amount);
    setValue('base_amount', expenses?.base_amount ?? (expenses?.includes_vat ? (expenses?.price - (expenses?.vat_amount || 0)) : (expenses?.net_price ?? expenses?.price)));
    setValue('net_price', expenses?.net_price ?? (expenses?.price - (expenses?.withholding_tax || 0)));
    setValue('customer', expenses?.customer);
    setValue('payee.name', expenses?.payee?.name);
    setValue('payee.account_number', expenses?.payee?.account_number);
    setValue('payee.bank', expenses?.payee?.bank);
    setValue(`project`, expenses?.project?._id);
    setValue('budget', expenses?.budget?._id);
    setValue('description', expenses?.description);
    setValue('customer', expenses?.customer?._id);
    setValue('expenses_type', expenses?.expenses_type || 'REFUND');
    setDate(expenses?.date);
    setBank(expenses?.payee?.bank);
    setCustomerSelect(expenses?.customer);
    return () => {};
  }, [expenses]);

  useEffect(() => {
    dispatch(actions.budgetAll({ project_id: projectSelect?.id }));
    dispatch(actions.customerAll({}));
    dispatch(actions.customerTypeAll({}));
    return () => {};
  }, [projectSelect]);

  useEffect(() => {
    // หา project object จาก list แล้วตั้งเป็นค่าในฟอร์ม
    const projectObj = projects?.rows?.find(
      (p) => p._id === expenses?.project?._id,
    );
    if (projectObj) {
      setValue('project', projectObj);
      setProjectSelect(projectObj);
    } else {
      setValue('project', null);
      setProjectSelect(null);
    }

    // สำหรับ budget ถ้าต้องการให้แสดงด้วย ก็หา budget object จาก projectObj.budget
    const budgetObj = projectObj?.budget?.find(
      (b) => b._id === expenses?.budget?._id,
    );
    if (budgetObj) {
      setValue('budget', budgetObj);
      setBudgetSelect(budgetObj);
    } else {
      setValue('budget', null);
      setBudgetSelect(null);
    }

    // ...อื่นๆ (ชื่อ, price, date ฯลฯ)
  }, [expenses, projects]);



  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        bank,
        date: dayjs(date).endOf('day').toISOString(),
        budgetSelect: eachBudget,
        projectSelect,
        note: true,
        applie: expenses?.employee,
        customer: customerSelect,
        status: 'PENDING',
      };
      await dispatch(actions.expensesPut(id, dataSubmit));
      await dispatch(actions.expensesAll({}));
      history.goBack();
    }
  };

  const handleOpenCustomerModal = () => setOpenCustomerModal(true);
  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    resetCustomer();
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

  const renderForm = () => (
    <Card>
      <div className="p-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ExpensesApplyForm
            expenses={expenses}
            control={control}
            Controller={Controller}
            date={date}
            setDate={setDate}
            bank={bank}
            setBank={setBank}
            projects={projects}
            setProjectSelect={setProjectSelect}
            projectSelect={projectSelect}
            budgetSelect={budgetSelect}
            setBudgetSelect={setBudgetSelect}
            setValue={setValue}
            customer={customer}
            customerSelect={customerSelect}
            setCustomerSelect={setCustomerSelect}
            watch={watch}
          />
        </form>
      </div>
    </Card>
  );

  if (!expenses?.isLoading && expenses?.isCompleted && projects?.isCompleted) {
    return (
      <div>
        <BackButton />
        {renderForm()}
        {renderCustomerModal()}
      </div>
    );
  }
  return <Loading isLoading />;
}
