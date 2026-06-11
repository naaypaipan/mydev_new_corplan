import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { useSocket } from '../../contexts/SocketContext';

import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  Modal,
  Typography,
  Backdrop,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
// import expensesForm from 'components/Forms/expensesForm';
import ExpensesTable from '../../components/Table/ExpensesTable';
import ExpensesApplyForm from '../../components/Forms/ExpensesApplyForm';
import FilterPersornalExpenses from '../../components/Card/FilterPersornalExpenses';
import { CustomerForm } from 'components/Forms';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import Loading from 'components/Loading';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import FileUpload from '../../components/FileUpload/FileUpload';
import _ from 'lodash';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function PersonalExpenses({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const expenses = useSelector((state) => state.expenses);
  const projects = useSelector((state) => state.project);
  const budget = useSelector((state) => state.budget);
  const me = useSelector((state) => state.me);
  const customer = useSelector((state) => state.customer);
  const customerType = useSelector((state) => state.customerType);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = useState(dayjs().add(1, 'day').toDate());
  const [paidType, setPaidType] = useState('TRANSFER');
  const [projectSelect, setProjectSelect] = useState('');
  const [budgetSelect, setBudgetSelect] = useState('');
  const [findProject, setFindProject] = useState();
  const [search, setSearch] = useState('');
  const [bank, setBank] = useState();
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [customerSelect, setCustomerSelect] = useState('');
  const [addedImage, setAddedImage] = useState([]);

  // Socket.IO real-time listeners
  const socket = useSocket();

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

  const eachBudget = _.find(budget?.rows, { _id: budgetSelect?._id });

  const fetchExpensesPage = useCallback(() => {
    if (!me?.userData?.id) return Promise.resolve();
    return dispatch(
      actions.expensesAll({
        me: me.userData.id,
        search,
        findProject: findProject?._id,
        page,
        size,
      }),
    );
  }, [dispatch, me?.userData?.id, search, findProject?._id, page, size]);

  useEffect(() => {
    dispatch(actions.meGet());

    return () => {};
  }, []);

  useEffect(() => {
    dispatch(actions.customerAll({}));
    dispatch(actions.customerTypeAll({}));
  }, []);

  useEffect(() => {
    fetchExpensesPage();
  }, [fetchExpensesPage]);

  useEffect(() => {
    dispatch(actions.projectAll({ status_deliver: true }));
  }, []);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const refresh = () => {
      fetchExpensesPage();
    };

    socket.on('expenses:created', refresh);
    socket.on('expenses:updated', refresh);
    socket.on('expenses:deleted', refresh);

    return () => {
      socket.off('expenses:created', refresh);
      socket.off('expenses:updated', refresh);
      socket.off('expenses:deleted', refresh);
    };
  }, [socket, fetchExpensesPage]);

  useEffect(() => {
    dispatch(actions.budgetAll({ project_id: projectSelect?.id }));

    return () => {};
  }, [projectSelect]);

  const filter = _.filter(
    expenses?.rows,
    (e) => e?.employee?._id === me?.userData?.id,
  );

  const handleDelete = async (id) => {
    const confirm = window.confirm('ยกเลิกรายการ');
    if (confirm) {
      try {
        await dispatch(actions.expensesPut(id, { status: 'CANCEL' }));
        fetchExpensesPage();
      } catch (error) {}
    }
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

  // Pass to PaymentForm for "Add Customer" from Autocomplete
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

  const handleEdit = (id) => {
    history.push(`/expenses/edit/${id}`);
  };

  const onSubmit = async (data) => {
    // --- เพิ่มการตรวจสอบ ---
    if (!projectSelect) {
      alert('กรุณาเลือกโครงการ');
      return; // หยุดการทำงาน
    }
    if (!budgetSelect) {
      alert('กรุณาเลือกงบประมาณ');
      return; // หยุดการทำงาน
    }

    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        paidType,
        date: dayjs(date).endOf('day').toDate(),
        employee: me?.userData?._id,
        employee_data: me?.userData
          ? {
              firstname: me.userData.firstname,
              lastname: me.userData.lastname,
            }
          : undefined,
        budgetSelect: eachBudget
          ? {
              name: eachBudget.name,
              remain: eachBudget.remain,
            }
          : eachBudget,
        projectSelect: projectSelect
          ? {
              project_number: projectSelect.project_number,
              name: projectSelect.name,
            }
          : projectSelect,
        customer: customerSelect,
        images: addedImage,
      };
      await dispatch(actions.expensesCreate(dataSubmit));
      // รายการอัปเดตผ่าน socket `expenses:created` → fetchExpensesPage (ไม่ดึงซ้ำที่นี่)
      // รีเซ็ตฟอร์ม
      reset();
      handleClose();
      setAddedImage([]);
      setProjectSelect('');
      setBudgetSelect('');
      setDate(dayjs().add(1, 'day').toDate());
      setPaidType('TRANSFER');
      setCustomerSelect('');
    }
  };

  const renderModal = () => (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
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
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // container hides overflow, body will scroll
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <b className="py-2">รายการเบิกจ่าย</b>
          </Typography>
          <IconButton size="small" onClick={handleClose} aria-label="ปิด">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body (scrollable) */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1 }}>
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
              personalMode={true}
              watch={watch}
            />

            {/* Bill Image Upload Section */}
            <Box sx={{ px: 3, pb: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                📎 แนบรูปบิล / PDF
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: 'action.hover',
                  textAlign: 'center',
                }}
              >
                <FileUpload
                  maxNumber={10}
                  files={addedImage}
                  setFiles={setAddedImage}
                  title={'เลือกรูปบิล / PDF'}
                  accept="image/*,.pdf"
                />
                {addedImage.length === 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    รองรับสูงสุด 10 ไฟล์
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Sticky Submit Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Button variant="outlined" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button variant="contained" type="submit">
              บันทึก
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );

  const renderTable = () => (
    <ExpensesTable
      expenses={expenses}
      page={page}
      size={size}
      setPage={setPage}
      setSize={setSize}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      filter={filter}
    />
  );

  const renderAddButton = () => (
    <div className="flex  justify-between ">
      <div className="w-2/3">
        <FilterPersornalExpenses
          project={projects}
          setFindProject={setFindProject}
          setSearch={setSearch}
        />
      </div>
      <div className="flex py-1">
        <Button variant="contained" size="small" onClick={handleOpen}>
          Add Expenses
        </Button>
      </div>
    </div>
  );

  if (expenses.isLoading || !expenses.isCompleted) {
    return <Loading isLoading />;
  }
  return (
    <div>
      {renderAddButton()}
      {renderTable()}
      {renderModal()}
      {renderCustomerModal()}
    </div>
  );
}
