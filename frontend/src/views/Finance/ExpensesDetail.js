import { React, useRef, useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import {
  useHistory,
  useParams,
} from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Modal,
  Slider,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import AddpayoutForm from '../../components/Forms/AddpayoutForm';
import _ from 'lodash';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import FileUpload from '../../components/FileUpload/FileUpload';
import ChatCard from 'components/Card/ChatCard';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',

  bgcolor: 'background.paper',

  boxShadow: 24,
  p: 4,
};

export default function ExpensesDetail({ title, subtitle }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const expenses = useSelector((state) => state.expenses);
  const me = useSelector((state) => state.me);
  const payout = useSelector((state) => state.payout);
  const chatExpenses = useSelector((state) => state.chatExpenses);
  const budget = useSelector((state) => state.budget);
  const project = useSelector((state) => state.project);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [paidType, setPaidType] = useState('TRANSFER');
  const [addedImage, setAddedImage] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [bigImage, setBigImage] = useState('');
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerRotate, setViewerRotate] = useState(0);
  const viewerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const [upSlip, setUpSlip] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [slipImage, setSlipImage] = useState([]);
  const [uploadSlipPayoutId, setUploadSlipPayoutId] = useState(null);
  const [uploadSlipImage, setUploadSlipImage] = useState([]);
  const [openSlipModal, setOpenSlipModal] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();
  const fetchChatExpenses = async () => {
    await dispatch(actions.chatExpensesAll({ ex: id }));
  };

  useEffect(() => {
    dispatch(actions.expensesGet(id));
    dispatch(actions.payoutAll({ ex: id }));
    fetchChatExpenses();
    return () => {};
  }, []);

  // Socket.IO real-time listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      dispatch(actions.expensesGet(id));
      dispatch(actions.payoutAll({ ex: id }));
    };
    const refreshChat = () => fetchChatExpenses();

    socket.on('expenses:updated', refresh);
    socket.on('payout:created', refresh);
    socket.on('payout:updated', refresh);
    socket.on('payout:deleted', refresh);
    socket.on('chat:created', refreshChat);

    return () => {
      socket.off('expenses:updated', refresh);
      socket.off('payout:created', refresh);
      socket.off('payout:updated', refresh);
      socket.off('payout:deleted', refresh);
      socket.off('chat:created', refreshChat);
    };
  }, [socket, id]);

  // Fetch budget data with computed fields (remain, percentage, totalStatus)
  useEffect(() => {
    if (expenses?.budget?.project_id) {
      dispatch(actions.budgetAll({ project_id: expenses?.budget?.project_id }));
    }
    if (expenses?.project?._id) {
      dispatch(actions.projectGet(expenses?.project?._id));
    }
  }, [expenses?.budget?.project_id, expenses?.project?._id]);

  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        paidType,
        date,
        employee: me?.userData?._id,
        expenses: id,
        budget: expenses?.budget?._id,
        slipImage: slipImage,
      };
      await dispatch(actions.payoutCreate(dataSubmit));
      await dispatch(actions.payoutAll({ ex: id }));
      dispatch(actions.expensesPut(id, { status: 'SUCCESS' }));
      dispatch(actions.expensesAll({}));
      reset();
      setSlipImage([]);
      handleClose();
    }
  };

  const handleOpen = () => {
    const net =
      expenses?.net_price != null
        ? Number(expenses.net_price)
        : (Number(expenses?.price) || 0) -
          (Number(expenses?.withholding_tax) || 0);
    setValue('price', net > 0 ? net : '');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleOpenModal = (image) => {
    setOpenModal(true);
    setBigImage(image);
    setViewerScale(1);
    setViewerRotate(0);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setBigImage('');
    setViewerScale(1);
    setViewerRotate(0);
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const zoomBy = (delta) => {
    setViewerScale((prev) => clamp(Number(prev) + delta, 0.2, 5));
  };
  const rotateBy = (delta) => {
    setViewerRotate((prev) => {
      const next = (Number(prev) + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  };
  const resetViewer = () => {
    setViewerScale(1);
    setViewerRotate(0);
  };
  const getFilenameFromUrl = (url) => {
    try {
      const cleaned = String(url || '').split('?')[0];
      const name = cleaned.substring(cleaned.lastIndexOf('/') + 1) || 'image';
      return decodeURIComponent(name);
    } catch (e) {
      return 'image';
    }
  };
  const handleDownloadBigImage = () => {
    if (!bigImage) return;
    const a = document.createElement('a');
    a.href = bigImage;
    a.download = getFilenameFromUrl(bigImage);
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('ยกเลิกรายการ');
    if (confirm) {
      try {
        await dispatch(actions.expensesPut(id, { status: 'CANCEL' }));
        dispatch(actions.expensesGet(id));
      } catch (error) {}
    }
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
    dispatch(actions.expensesGet(id));
  };

  const handlePermanentDelete = async (id) => {
    const confirm = window.confirm(
      'คุณต้องการลบใบเบิกนี้อย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
    );
    if (confirm) {
      try {
        await dispatch(actions.expensesDelete(id));
        dispatch(actions.expensesAll({}));
        history.goBack();
      } catch (error) {
        console.error('Failed to permanently delete expense:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleDeletePay = async (id) => {
    const confirm = window.confirm('ลบข้อมูล');
    if (confirm) {
      await dispatch(actions.payoutDelete(id));
      await dispatch(actions.payoutAll({ ex: id }));
    }
  };

  const handleEdit = (id) => {
    history.push(`/finance/expenses/edit/${id}`);
  };

  const handleApprove = async () => {
    const confirm = window.confirm('อนุมัติรายการเบิกนี้?');
    if (confirm) {
      try {
        await dispatch(
          actions.expensesPut(id, {
            status: 'APPROVE',
            approval_actor: me?.userData?.id,
            approval_actor_name: `${me?.userData?.firstname || ''} ${
              me?.userData?.lastname || ''
            }`.trim(),
          }),
        );
        dispatch(actions.expensesGet(id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      APPROVE: 'info',
      SUCCESS: 'success',
      CANCEL: 'error',
      REJECT: 'error',
      HOLD: 'default',
      PREAPPROVE: 'info',
      PREPARE: 'warning',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      PENDING: 'รอการอนุมัติ',
      APPROVE: 'อนุมัติแล้ว',
      SUCCESS: 'จ่ายแล้ว',
      CANCEL: 'ยกเลิก',
      REJECT: 'ปฏิเสธ',
      HOLD: 'ระงับ',
      PREAPPROVE: 'ก่อนอนุมัติ',
      PREPARE: 'เตรียม',
    };
    return statusLabels[status] || status;
  };

  const renderDetail = () => (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
          >
            Expense Detail: {expenses?.code}
          </Typography>
          <Chip
            label={getStatusLabel(expenses?.status)}
            color={getStatusColor(expenses?.status)}
            variant="outlined"
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Approve / Success buttons based on status */}
          {expenses?.status === 'PENDING' && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleApprove}
            >
              อนุมัติ
            </Button>
          )}

          {expenses?.status !== 'APPROVE' &&
            expenses?.status !== 'SUCCESS' &&
            expenses?.status !== 'REJECT' && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleReject(id)}
              >
                ปฏิเสธ
              </Button>
            )}
          {expenses?.status !== 'CANCEL' && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={() => handleDelete(id)}
            >
              ยกเลิก
            </Button>
          )}
          {/* Edit */}
          {expenses?.status !== 'CANCEL' && expenses?.status === 'REJECT' && (
            <IconButton
              aria-label="edit"
              size="small"
              color="primary"
              onClick={() => handleEdit(id)}
            >
              <ModeEditIcon />
            </IconButton>
          )}
          {/* ลบถาวร - แสดงเมื่อสถานะเป็น CANCEL */}
          {expenses?.status === 'CANCEL' && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => handlePermanentDelete(id)}
            >
              ลบถาวร
            </Button>
          )}
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="mb-2">
            <Typography variant="subtitle2" color="textSecondary">
              ประวัติการอนุมัติ
            </Typography>
            {Array.isArray(expenses?.approval_logs) &&
            expenses?.approval_logs?.length > 0 ? (
              <Box className="mt-1">
                {[...expenses.approval_logs]
                  .sort(
                    (a, b) =>
                      new Date(a?.acted_at || 0).getTime() -
                      new Date(b?.acted_at || 0).getTime(),
                  )
                  .map((log, idx) => (
                    <Box
                      key={`${log?._id || idx}`}
                      className="flex flex-wrap items-center gap-2 py-1"
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          log?.step
                            ? `ขั้นที่ ${log?.step}`
                            : log?.action || 'ACTION'
                        }
                      />
                      <Typography variant="body2">
                        {log?.status || '-'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        โดย {log?.actor_name || '-'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {log?.acted_at
                          ? dayjs(log.acted_at).format('DD/MM/YYYY HH:mm')
                          : '-'}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                ยังไม่มีประวัติการอนุมัติ
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Date
          </Typography>
          <Typography variant="body1">
            {dayjs(expenses?.date).format('DD/MM/YYYY')}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Project
          </Typography>
          <Typography variant="body1">
            {expenses?.project?.name || '-'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Number
          </Typography>
          <Typography variant="body1">
            {expenses?.invoice_number || '-'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Customer
          </Typography>
          <Typography variant="body1">
            {expenses?.customer?.name || '-'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Budget
          </Typography>
          <Typography variant="body1">
            {expenses?.budget?.prefix}
            {expenses?.budget?.budget_number} {expenses?.budget?.name}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Applicant
          </Typography>
          <Typography variant="body1">
            {expenses?.employee?.firstname} {expenses?.employee?.lastname}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Order
          </Typography>
          <Typography variant="body1">{expenses?.name}</Typography>
        </Grid>
        {expenses?.includes_vat && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Total (รวม VAT)
            </Typography>
            <Typography variant="body1" className="font-bold text-blue-600">
              ฿{expenses?.price?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
            </Typography>
          </Grid>
        )}
        {expenses?.includes_vat && expenses?.vat_amount != null && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              VAT 7% (รวมอยู่ในยอด Total)
            </Typography>
            <Typography variant="body1" className="font-bold text-blue-400">
              ฿{expenses?.vat_amount?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
            </Typography>
          </Grid>
        )}
        {expenses?.withholding_tax != null && Number(expenses.withholding_tax) > 0 && (
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              หัก ณ ที่จ่าย
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="warning.main">
              - ฿{Number(expenses.withholding_tax).toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="textSecondary">
            ยอดจ่ายจริง
          </Typography>
          <Typography variant="h6" className="font-bold text-green-600">
            ฿{(expenses?.net_price ?? ((expenses?.price || 0) - (expenses?.withholding_tax || 0))).toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
          </Typography>
        </Grid>
        {/* Payee Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Payee
          </Typography>
          <Typography variant="body1">
            <b>Name:</b> {expenses?.payee?.name || '-'}
          </Typography>
          <Typography variant="body1">
            <b>Bank:</b> {expenses?.payee?.bank || '-'}
          </Typography>
          <Typography variant="body1">
            <b>Account Number:</b> {expenses?.payee?.account_number || '-'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );

  // Budget & Project Analysis
  const budgetData = _.find(
    budget?.rows,
    (b) => String(b?._id) === String(expenses?.budget?._id),
  );

  // // DEBUG: Remove after fixing
  // console.log('=== BUDGET ANALYSIS DEBUG ===');
  // console.log('expenses?.budget?._id:', expenses?.budget?._id);
  // console.log('expenses?.budget?.project_id:', expenses?.budget?.project_id);
  // console.log('expenses?.project?._id:', expenses?.project?._id);
  // console.log('budget?.rows:', budget?.rows);
  // console.log('budgetData (matched):', budgetData);
  // console.log('project state:', project);
  // console.log('=== END DEBUG ===');

  // Project-level data from backend (projectGet pipeline computes total_budget, total_expenses, etc.)
  const projectTotalBudget = project?.total_budget || 0;
  const projectTotalExpenses = project?.total_expenses || 0;
  const projectRemain = projectTotalBudget - projectTotalExpenses;
  const projectPct = project?.expenses_percentage || 0;

  const getProgressColor = (pct) => {
    if (pct >= 90) return 'error';
    if (pct >= 70) return 'warning';
    return 'success';
  };

  const formatMoney = (val) =>
    (val || 0)?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,');

  const MiniStat = ({ label, value, color = 'text.primary' }) => (
    <Box sx={{ textAlign: 'center', px: 1 }}>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold" color={color}>
        ฿{formatMoney(value)}
      </Typography>
    </Box>
  );

  // คำนวณงบแบบเดียวกับ BudgetTable: Grand Total = SUCCESS, Expected = APPROVE, Remaining = cost - SUCCESS - APPROVE
  const getNet = (e) =>
    Number(e?.net_price ?? (e?.price || 0) - (e?.withholding_tax || 0)) || 0;
  const getBudgetTableValues = (data) => {
    if (!data) return { budget: 0, grandTotal: 0, percent: 0, expected: 0, remaining: 0 };
    const successList = _.filter(data?.expenses, (e) => e?.status === 'SUCCESS');
    const approveList = _.filter(data?.expenses, (e) => e?.status === 'APPROVE');
    const grandTotal = _.sumBy(successList, getNet);
    const expected = _.sumBy(approveList, getNet);
    const cost = Number(data?.cost) || 0;
    const remaining = cost - grandTotal - expected;
    const percent = cost ? (grandTotal / cost) * 100 : 0;
    return { budget: cost, grandTotal, percent, expected, remaining };
  };

  const renderBudgetAnalysis = () => {
    const budgetValues = getBudgetTableValues(budgetData);
    const budgetPct = budgetValues.percent;

    return (
      <Grid container spacing={2}>
        {/* Project Summary */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📊 โครงการ: {expenses?.project?.name || '-'}
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Box
                className="flex justify-between items-center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" color="textSecondary">
                  ใช้งบไป
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color={getProgressColor(projectPct) + '.main'}
                >
                  {projectPct?.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(projectPct, 100)}
                color={getProgressColor(projectPct)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <MiniStat
                  label="งบประมาณ"
                  value={projectTotalBudget}
                  color="primary"
                />
              </Grid>
              <Grid item xs={4}>
                <MiniStat
                  label="ใช้ไป"
                  value={projectTotalExpenses}
                  color="error"
                />
              </Grid>
              <Grid item xs={4}>
                <MiniStat
                  label="คงเหลือ"
                  value={projectRemain}
                  color={projectRemain < 0 ? 'error' : 'success.main'}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Budget Summary — ตรงกับตาราง Budget (Budget / Grand Total / Percent / Expected / Remaining) */}
        {budgetData && (
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                💰 งบ: {budgetData?.prefix}
                {budgetData?.budget_number} — {budgetData?.name}
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Box
                  className="flex justify-between items-center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="caption" color="textSecondary">
                    Percent
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={getProgressColor(Math.min(budgetPct, 100)) + '.main'}
                  >
                    {budgetPct?.toFixed(2)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(budgetPct, 100)}
                  color={getProgressColor(Math.min(budgetPct, 100))}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <MiniStat label="Budget" value={budgetValues.budget} color="primary" />
                </Grid>
                <Grid item xs={4}>
                  <MiniStat label="Grand Total" value={budgetValues.grandTotal} color="error" />
                </Grid>
                <Grid item xs={4}>
                  <MiniStat label="Expected" value={budgetValues.expected} color="warning.main" />
                </Grid>
                <Grid item xs={12}>
                  <MiniStat
                    label="Remaining"
                    value={budgetValues.remaining}
                    color={budgetValues.remaining < 0 ? 'error' : 'success.main'}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };
  const handleSaveImage = async () => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      if (!_.isEmpty(addedImage)) {
        await dispatch(actions.expensesPut(id, { images: addedImage }));
        setAddedImage([]);
        await dispatch(actions.expensesGet(id));
      }
    }
  };

  const handleRemoveImage = async (imageId) => {
    const confirm = window.confirm('ลบรูปนี้?');
    if (confirm) {
      await dispatch(actions.expensesRemoveImage(id, imageId));
      await dispatch(actions.expensesGet(id));
    }
  };

  const renderModal = () => (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', md: '90vw' },
          height: { xs: '90vh', md: '90vh' },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 0,
          borderRadius: 2,
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            px: { xs: 0.5, sm: 1 },
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <IconButton size="small" onClick={() => zoomBy(-0.2)} aria-label="zoom out">
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Box sx={{ width: { xs: 110, sm: 160 }, px: 1 }}>
            <Slider
              size="small"
              value={Math.round(viewerScale * 100)}
              min={20}
              max={500}
              onChange={(e, v) => setViewerScale(Number(v) / 100)}
              aria-label="zoom"
            />
          </Box>
          <IconButton size="small" onClick={() => zoomBy(0.2)} aria-label="zoom in">
            <ZoomInIcon fontSize="small" />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <IconButton size="small" onClick={() => rotateBy(-90)} aria-label="rotate left">
            <RotateLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => rotateBy(90)} aria-label="rotate right">
            <RotateRightIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={resetViewer} aria-label="reset view">
            <RestartAltIcon fontSize="small" />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="small"
            onClick={handleDownloadBigImage}
            disabled={!bigImage}
            aria-label="download"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadBigImage}
            disabled={!bigImage}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            ดาวน์โหลด
          </Button>
          <IconButton size="small" onClick={handleCloseModal} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Viewer */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            cursor: viewerScale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
          }}
          ref={viewerRef}
          onWheel={(e) => {
            // Ctrl+wheel on Windows often zooms browser; we handle normal wheel
            if (e.ctrlKey) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            zoomBy(delta);
          }}
          onMouseDown={(e) => {
            if (viewerScale <= 1) return;
            const el = viewerRef.current;
            if (!el) return;
            setIsPanning(true);
            panStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              left: el.scrollLeft,
              top: el.scrollTop,
            };
          }}
          onMouseMove={(e) => {
            if (!isPanning) return;
            const el = viewerRef.current;
            if (!el) return;
            const dx = e.clientX - panStartRef.current.x;
            const dy = e.clientY - panStartRef.current.y;
            el.scrollLeft = panStartRef.current.left - dx;
            el.scrollTop = panStartRef.current.top - dy;
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
          onTouchStart={(e) => {
            if (viewerScale <= 1) return;
            const el = viewerRef.current;
            if (!el) return;
            const t = e.touches?.[0];
            if (!t) return;
            setIsPanning(true);
            panStartRef.current = {
              x: t.clientX,
              y: t.clientY,
              left: el.scrollLeft,
              top: el.scrollTop,
            };
          }}
          onTouchMove={(e) => {
            if (!isPanning) return;
            const el = viewerRef.current;
            if (!el) return;
            const t = e.touches?.[0];
            if (!t) return;
            const dx = t.clientX - panStartRef.current.x;
            const dy = t.clientY - panStartRef.current.y;
            el.scrollLeft = panStartRef.current.left - dx;
            el.scrollTop = panStartRef.current.top - dy;
          }}
          onTouchEnd={() => setIsPanning(false)}
        >
          {bigImage ? (
            <Box
              component="img"
              src={bigImage}
              alt="Bill Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${viewerScale}) rotate(${viewerRotate}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 120ms ease',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              ไม่มีรูปที่จะแสดง
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );

  const isPdfUrl = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  const renderBillImage = () => (
    <div className="p-2 ">
      <div className="text-xl">
        <b className="text-theme-600 py-2">Bill Images / Files</b>
      </div>
      {/* Display existing bill_images array */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Backward compatibility: show old single bill_image if no bill_images */}
        {expenses?.bill_image &&
          (!expenses?.bill_images || expenses?.bill_images?.length === 0) && (
            <Grid item xs={6} sm={4} md={3}>
              <Box
                sx={{
                  position: 'relative',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 },
                }}
                onClick={() => handleOpenModal(expenses.bill_image.url)}
              >
                <img
                  src={expenses.bill_image.url}
                  alt="Bill Image"
                  style={{ width: '100%', height: 150, objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          )}
        {/* Display bill_images array — images and PDFs */}
        {expenses?.bill_images?.map((img, index) => (
          <Grid item xs={6} sm={4} md={3} key={img._id || index}>
            <Box
              sx={{
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {isPdfUrl(img.url) ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 150,
                    cursor: 'pointer',
                    bgcolor: 'grey.50',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  onClick={() => window.open(img.url, '_blank')}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    เปิดไฟล์ PDF
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }} />
                </Box>
              ) : (
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOpenModal(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`Bill ${index + 1}`}
                    style={{ width: '100%', height: 150, objectFit: 'cover' }}
                  />
                </Box>
              )}
              <IconButton
                size="small"
                color="error"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                }}
                onClick={() => handleRemoveImage(img._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
      {/* Upload new images / PDFs */}
      <div className="py-2">
        <FileUpload
          maxNumber={10}
          files={addedImage}
          setFiles={setAddedImage}
          title={'อัปโหลดรูปบิล / PDF'}
          accept="image/*,.pdf"
        />
        <div>
          {!_.isEmpty(addedImage) && (
            <div className="flex justify-center mt-2">
              <Button variant="contained" onClick={() => handleSaveImage()}>
                บันทึก
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleUploadSlip = (payoutId) => {
    setUploadSlipPayoutId(payoutId);
    setUploadSlipImage([]);
    setOpenSlipModal(true);
  };

  const handleSaveSlip = async () => {
    if (!uploadSlipPayoutId || _.isEmpty(uploadSlipImage)) return;
    const confirmSave = window.confirm('บันทึกสลิป');
    if (confirmSave) {
      await dispatch(
        actions.payoutPut(uploadSlipPayoutId, {
          slipImage: uploadSlipImage,
        }),
      );
      setOpenSlipModal(false);
      setUploadSlipImage([]);
      setUploadSlipPayoutId(null);
      await dispatch(actions.payoutAll({ ex: id }));
    }
  };

  const renderSlipUploadModal = () => (
    <Modal
      open={openSlipModal}
      onClose={() => setOpenSlipModal(false)}
      aria-labelledby="slip-upload-modal"
    >
      <Box sx={style}>
        <Typography variant="h6" className="mb-2">
          อัปโหลดสลิปการโอน
        </Typography>
        <ImageUpload
          preview_size="300"
          maxNumber={1}
          images={uploadSlipImage}
          setImages={setUploadSlipImage}
          title={'เลือกสลิป'}
        />
        {!_.isEmpty(uploadSlipImage) && (
          <div className="flex justify-center mt-3">
            <Button variant="contained" onClick={handleSaveSlip}>
              บันทึกสลิป
            </Button>
          </div>
        )}
      </Box>
    </Modal>
  );

  const renderPayment = () => (
    <div>
      <div className="p-2 flex ">
        <div className="text-xl">
          {' '}
          <b className="text-theme-600">Payment</b>
        </div>
        <div className="px-4">
          <Button size="small" variant="contained" onClick={() => handleOpen()}>
            Add payment
          </Button>
        </div>
      </div>

      {!_.isEmpty(payout?.rows) ? (
        _.map(payout?.rows, (e) => (
          <div className="px-1 py-1" key={e._id}>
            <Card>
              <div className="flex">
                <div className="p-2 flex-1">
                  <div>Payment Date {dayjs(e?.date).format('DD/MM/YYYY')}</div>
                  <div>
                    Paid{' '}
                    {e?.price?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </div>
                  <div>Method : {e?.paidType}</div>
                  <div>Remark : {e?.remark || '-'}</div>
                  {/* Slip Image */}
                  {e?.slip?.url ? (
                    <div className="mt-2">
                      <Typography variant="caption" color="textSecondary">
                        สลิปการโอน
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'inline-block',
                          '&:hover': { boxShadow: 3 },
                        }}
                        onClick={() => handleOpenModal(e.slip.url)}
                      >
                        <img
                          src={e.slip.url}
                          alt="Slip"
                          style={{
                            width: 150,
                            height: 150,
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => handleUploadSlip(e._id)}
                      >
                        อัปโหลดสลิป
                      </Button>
                    </div>
                  )}
                </div>
                <div className="py-1">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => handleDeletePay(e._id)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
            </Card>
          </div>
        ))
      ) : (
        <div className="px-1 py-1">
          <Card>
            <div className="p-2">Waiting for payment</div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderModalAddPayment = () => (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          ></Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AddpayoutForm
              control={control}
              Controller={Controller}
              date={date}
              setDate={setDate}
              paidType={paidType}
              slipImage={slipImage}
              setSlipImage={setSlipImage}
              expenseData={expenses}
            />
          </form>
        </Box>
      </Modal>
    </div>
  );

  const onSubmitChat = () => {
    const dataSubmit = {
      sender: me?.userData?._id,
      message: chatMessage,
      expenses_id: id,
    };
    dispatch(actions.chatExpensesCreate(dataSubmit)).then(() => {
      setChatMessage('');
      fetchChatExpenses();
    });
  };

  const renderChatSection = () => (
    <ChatCard
      me={me}
      chatExpenses={chatExpenses}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      onSubmitChat={onSubmitChat}
    />
  );

  return (
    <div>
      {renderModalAddPayment()}
      {renderModal()}
      {renderSlipUploadModal()}
      <div>{renderDetail()}</div>
      <div className="py-2">{renderBudgetAnalysis()}</div>
      <div className="py-2">{renderBillImage()}</div>
      <div className="py-2">{renderPayment()}</div>
      <div className="py-2">{renderChatSection()}</div>
    </div>
  );
}
