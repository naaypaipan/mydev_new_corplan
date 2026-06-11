import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';

import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Button } from '@mui/material';

import DatePickerCard from 'components/Card/DatePickerCard';
import PaymentListTable from '../../components/Table/PaymentListTable';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import Loading from 'components/Loading';
import { paymentDailyReport, paymentReport } from 'components/PDF';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90vw',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const Payment = ({ title, subtitle }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const payments = useSelector((state) => state.payments);
  const info = useSelector((state) => state.info);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = useState(null);
  const [completePayment, setCompletePayment] = useState(null);
  const [slipImageComplete, setSlipImageComplete] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [openDailyReport, setOpenDailyReport] = useState(false);
  const [reportDate, setReportDate] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenComplete = (payment) => {
    setCompletePayment(payment);
    setSlipImageComplete([]);
  };
  const handleCloseComplete = () => {
    setCompletePayment(null);
    setSlipImageComplete([]);
  };
  const handleSaveComplete = async () => {
    if (!completePayment?._id) return;
    const confirm = window.confirm(
      'ยืนยันจ่ายเงินและสร้างรายการ Payout ตามรายการเบิก? (สถานะ expense จะเป็น SUCCESS)'
    );
    if (!confirm) return;
    setCompleting(true);
    try {
      await dispatch(
        actions.paymentComplete(completePayment._id, {
          slipImage: slipImageComplete,
        })
      );
      await dispatch(actions.paymentAll({ page, size }));
      handleCloseComplete();
    } catch (err) {
      console.error(err);
      window.alert(err?.response?.data?.message || err?.message || 'ดำเนินการไม่สำเร็จ');
    } finally {
      setCompleting(false);
    }
  };

  const handleOnclickDetail = (id) => {
    // history.push(`/finance/payment/${id}`);
  };

  const onClickDelete = async (id) => {
    const confirm = window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?');
    if (confirm) {
      try {
        await dispatch(actions.paymentDelete(id));
        await dispatch(actions.paymentAll({ page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    dispatch(actions.paymentAll({ page, size }));
    return () => {};
  }, [page, size]);

  useEffect(() => {
    dispatch(actions.getInformation());
    return () => {};
  }, []);

  const handlePrintPayment = (payment) => {
    paymentReport(payment, info);
  };
  const handleOpenDailyReport = () => setOpenDailyReport(true);
  const handleCloseDailyReport = () => setOpenDailyReport(false);

  const handlePrintDailyReport = async () => {
    if (!reportDate) return;
    try {
      const result = await dispatch(
        actions.paymentAll({ page: 1, size: 99999, date: reportDate })
      );
      paymentDailyReport(result, { ...info, date: reportDate });
    } finally {
      // restore current table (unfiltered)
      await dispatch(actions.paymentAll({ page, size }));
      handleCloseDailyReport();
    }
  };

  const handleCreatePayment = async () => {
    await dispatch(actions.paymentCreateWithExpenses({ date }));
    await dispatch(actions.paymentAll({ page, size }));
    handleClose();
  };


  const renderAddButton = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
      >
        สร้างรายการจ่ายเงิน
      </Button> */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => history.push('/finance/Payment/add')}
      >
        สร้างรายการเตรียมจ่าย (ตามผู้รับเงิน)
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpenDailyReport}
      >
        พิมพ์รายงานรายวัน (PDF)
      </Button>
    </div>
  );

  const renderModal = () => (
    <Modal
      open={open}
      onClose={handleClose}
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
            onClick={handleClose}
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
  const renderCompleteModal = () => (
    <Modal
      open={!!completePayment}
      onClose={handleCloseComplete}
      aria-labelledby="complete-payment-modal"
    >
      <Box sx={{ ...style, width: 420 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" id="complete-payment-modal">
            จ่ายเงิน — อัปโหลดสลิป
          </Typography>
          {completePayment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              ผู้รับ: {completePayment?.payee?.name} · ฿{(completePayment?.totalAmount || 0).toLocaleString('th-TH')}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 2 }}>
          <ImageUpload
            preview_size="280"
            maxNumber={1}
            images={slipImageComplete}
            setImages={setSlipImageComplete}
            title="เลือกสลิปการโอน"
          />
        </Box>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseComplete} disabled={completing}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveComplete}
            disabled={completing}
          >
            {completing ? 'กำลังดำเนินการ...' : 'ยืนยันจ่ายเงิน'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const renderDailyReportModal = () => (
    <Modal
      open={openDailyReport}
      onClose={handleCloseDailyReport}
      aria-labelledby="daily-payment-report-modal"
    >
      <Box sx={style}>
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
            id="daily-payment-report-modal"
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            พิมพ์รายงานการจ่ายเงินรายวัน
          </Typography>
        </Box>

        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <DatePickerCard setDate={setReportDate} date={reportDate} />
        </Box>

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
          <Button variant="outlined" onClick={handleCloseDailyReport}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!reportDate}
            onClick={handlePrintDailyReport}
          >
            พิมพ์ PDF
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const renderTable = () => (
    <PaymentListTable
      payments={payments}
      page={page}
      setPage={setPage}
      size={size}
      setSize={setSize}
      handleOnclickDetail={handleOnclickDetail}
      onClickDelete={onClickDelete}
      onCompletePayment={handleOpenComplete}
      onPrintPayment={handlePrintPayment}
    />
  );

  return (
    <div>
      {renderModal()}
      {renderCompleteModal()}
      {renderDailyReportModal()}
      <div className="py-1 flex justify-end">{renderAddButton()}</div>
      <div>{renderTable()}</div>
    </div>
  );
};

export default Payment;
