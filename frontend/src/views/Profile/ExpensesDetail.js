import { React, useRef, useState, useEffect } from 'react';
import {
  useHistory,
  useParams,
} from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import { useSocket } from '../../contexts/SocketContext';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Modal,
  Slider,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import AddpayoutForm from '../../components/Forms/AddpayoutForm';
import _ from 'lodash';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
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
import { Chat } from '@mui/icons-material';
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

    const refreshExpenses = () => dispatch(actions.expensesGet(id));
    const refreshPayout = () => dispatch(actions.payoutAll({ ex: id }));
    const refreshChat = () => fetchChatExpenses();

    socket.on('expenses:updated', refreshExpenses);
    socket.on('expenses:deleted', refreshExpenses);
    socket.on('payout:created', refreshPayout);
    socket.on('payout:updated', refreshPayout);
    socket.on('payout:deleted', refreshPayout);
    socket.on('chat:created', refreshChat);

    return () => {
      socket.off('expenses:updated', refreshExpenses);
      socket.off('expenses:deleted', refreshExpenses);
      socket.off('payout:created', refreshPayout);
      socket.off('payout:updated', refreshPayout);
      socket.off('payout:deleted', refreshPayout);
      socket.off('chat:created', refreshChat);
    };
  }, [socket, id]);

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
      };
      await dispatch(actions.payoutCreate(dataSubmit));
      await dispatch(actions.payoutAll({ ex: id }));
      dispatch(actions.expensesPut(id, { status: 'SUCCESS' }));
      dispatch(actions.expensesAll({}));
      reset();
      handleClose();
    }
  };

  const handleOpen = () => setOpen(true);
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
    const confirm = window.confirm('ลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.expensesDelete(id));
        dispatch(actions.expensesAll({}));
        history.goBack();
      } catch (error) {}
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
        >
          Expense Detail: {expenses?.code}
        </Typography>
        {/* --- เพิ่มปุ่มลบถาวรเมื่อสถานะเป็น CANCEL --- */}
        {expenses?.status === 'CANCEL' && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(id)}
          >
            ลบถาวร
          </Button>
        )}
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

          <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 0.5 }} />

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
        {expenses?.bill_image && (!expenses?.bill_images || expenses?.bill_images?.length === 0) && (
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

  const renderPayment = () => (
    <div>
      <div className="p-2 flex ">
        <div className="text-xl">
          {' '}
          <b className="text-theme-600">Payment</b>
        </div>
      </div>

      {!_.isEmpty(payout?.rows) ? (
        _.map(payout?.rows, (e) => (
          <div className="px-1 py-1">
            <Card>
              <div className="flex">
                <div className="p-2">
                  <div>Payment Date {dayjs(e?.date).format('DD/MM/YYYY')}</div>
                  <div>
                    Paid{' '}
                    {e?.price?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </div>
                  <div>Method : {e?.paidType}</div>
                  <div>Remark : {e?.remark || '-'}</div>
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
      <div>{renderDetail()}</div>
      <div className="py-2">{renderBillImage()}</div>
      <div className="py-2">{renderPayment()}</div>
      <div className="py-2">{renderChatSection()}</div>
    </div>
  );
}
