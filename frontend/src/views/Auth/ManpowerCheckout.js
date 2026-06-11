import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  Box,
  IconButton,
  Typography,
  Container,
  Paper,
  Divider,
  Avatar,
  Fade,
} from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import * as actions from '../../redux/actions';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CloseIcon from '@mui/icons-material/Close';
import CameraIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import Cameras from 'components/Camera/Cameras';
import Loading from 'components/Loading';
import CalculateSalaryperday from 'utils/functions/CalculateSalaryperday';
import CalculateSalaryOtperday from 'utils/functions/CalculateSalaryOtperday';
import dayjs from 'dayjs';

export default function ManpowerCheckout() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const employee = useSelector((state) => state.employee);
  const timestamp = useSelector((state) => state.timestamp);
  const project = useSelector((state) => state.project);
  const holiday = useSelector((state) => state.holiday);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );
  const [inputText, setInputText] = useState('');
  const [openScan, setOpenScan] = useState(true);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // ให้เวลา scanner เตรียมพร้อม
    const scannerTimer = setTimeout(() => {
      setScannerReady(true);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(scannerTimer);
    };
  }, []);

  useEffect(() => {
    dispatch(actions.projectGet(id));
    dispatch(actions.holidayAll({ date: dayjs().startOf('date') }));
  }, [dispatch, id]);

  const handleScan = async (data) => {
    if (data) {
      await dispatch(actions.timestampCheckin({ checkoutem: data }));
      setOpenScan(false);
    }
  };

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleButtonClick = () => {
    if (_.isEmpty(inputText)) {
      alert('กรุณากรอกรหัสพนักงาน');
    } else {
      dispatch(actions.timestampCheckin({ checkoutem: inputText }));
      setOpenScan(false);
    }
  };

  const handleRescan = async () => {
    await dispatch(actions.timestampReset());
    setOpenScan(true);
    setShowCamera(false);
    setImgSrc(null);
  };

  const extra = CalculateSalaryperday(holiday);
  const extra_ot = CalculateSalaryOtperday(holiday);

  const onSubmit = async (data) => {
    if (!imgSrc) {
      alert('กรุณาถ่ายรูปก่อนบันทึก');
    } else {
      const confirm = window.confirm('ยืนยันการบันทึกข้อมูล?');
      if (confirm) {
        setLoading(true);
        const dataSubmit = {
          employee: data?.employee?._id,
          employee_firstname: data?.employee?.firstname,
          employee_lastname: data?.employee?.lastname,
          salary: data?.employee?.salary,
          salary_extra: data?.employee?.salary_extra,
          status_checkOut: true,
          project_in: timestamp?.project_in?._id,
          project_out: project,
          checkIn: timestamp?.checkIn,
          image_out: imgSrc,
          extra,
          extra_ot,
          salary: data?.employee?.salary,
          ot_approve: timestamp?.ot_status?.status === 'APPROVE' ? true : false,
        };
        await dispatch(actions.timestampPut(timestamp?._id, dataSubmit));
        setLoading(false);
        setImgSrc(null);
        handleRescan();
      }
    }
  };

  const QRReader = () => (
    <Box className="flex justify-center my-4">
      <Paper
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 2,
          width: { xs: 280, sm: 320 },
          overflow: 'hidden',
        }}
      >
        <Fade in={scannerReady}>
          <Box>
            {scannerReady && (
              <Scanner
                onScan={(results) => {
                  handleScan(results?.[0]?.rawValue);
                }}
                allowMultiple
                containerStyle={{
                  width: '100%',
                  height: '100%',
                  paddingTop: '5px',
                }}
              />
            )}
          </Box>
        </Fade>
      </Paper>
    </Box>
  );

  const renderCameraButton = () => (
    <Box className="flex justify-center my-4">
      <Button
        variant="contained"
        size="large"
        startIcon={<CameraIcon />}
        onClick={() => setShowCamera(true)}
        sx={{
          borderRadius: 3,
          py: 1.5,
          px: 3,
          boxShadow: 3,
          background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
        }}
      >
        เปิดกล้องถ่ายรูป
      </Button>
    </Box>
  );

  const renderImage = () => (
    <Box>
      {!showCamera ? (
        renderCameraButton()
      ) : (
        <Paper
          elevation={2}
          sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
        >
          <Box className="flex justify-center">
            <Cameras imgSrc={imgSrc} setImgSrc={setImgSrc} />
          </Box>
        </Paper>
      )}
    </Box>
  );

  const renderFormEmployee = () => (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(to bottom, #ffffff, #fff8e1)',
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
        }}
      >
        <Typography
          variant="h4"
          className="font-bold text-center mb-2"
          sx={{ color: '#f57c00' }}
        >
          ลงเวลาออกงาน
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box className="flex justify-center items-center mb-3">
          <Avatar
            sx={{
              bgcolor: '#fff3e0',
              width: 56,
              height: 56,
              mb: 1,
            }}
          >
            <LogoutIcon fontSize="large" color="warning" />
          </Avatar>
        </Box>

        <Typography
          variant="h6"
          className="text-center mb-1"
          sx={{ color: '#f57c00' }}
        >
          โครงการ {project?.name}
        </Typography>

        <Typography
          variant="h5"
          className="text-center mb-4 font-bold"
          sx={{ color: '#333' }}
        >
          {currentTime}
        </Typography>

        {openScan && (
          <Fade in={true}>
            <Box>
              <Box className="flex justify-center items-center my-2">
                <QrCodeScannerIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">สแกน QR code</Typography>
              </Box>

              {QRReader()}

              <Box sx={{ mt: 3 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    หรือค้นหาด้วยรหัสพนักงาน
                  </Typography>
                  <Box className="flex gap-2">
                    <TextField
                      variant="outlined"
                      label="ชื่อ/รหัสพนักงาน"
                      size="small"
                      onChange={handleChange}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleButtonClick}
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#ff9800',
                        '&:hover': {
                          bgcolor: '#f57c00',
                        },
                      }}
                    >
                      ค้นหา
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Fade>
        )}
      </Paper>
    </Container>
  );

  const renderEmployeeList = () => (
    <Container maxWidth="sm" sx={{ mb: 4 }}>
      {!timestamp?._id ? (
        !openScan && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 4,
              textAlign: 'center',
              bgcolor: '#f9f9f9',
            }}
          >
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              ไม่มีข้อมูลพนักงาน
            </Typography>
            <IconButton
              onClick={handleRescan}
              sx={{
                color: '#f44336',
                bgcolor: '#ffebee',
                '&:hover': { bgcolor: '#ffcdd2' },
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
          </Paper>
        )
      ) : (
        <Fade in={true} timeout={500}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              mb: 2,
              background: 'linear-gradient(to bottom, #ffffff, #fff8e1)',
            }}
          >
            <Box className="flex justify-between items-start mb-3">
              <Box className="flex items-center">
                <PersonIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#f57c00' }}
                  >
                    {timestamp?.employee?.firstname}{' '}
                    {timestamp?.employee?.lastname}
                  </Typography>
                  <Box className="flex items-center">
                    <GroupsIcon
                      fontSize="small"
                      color="action"
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body1" color="textSecondary">
                      ทีม: {timestamp?.employee?.team || '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={handleRescan}
                size="small"
                sx={{
                  color: '#f44336',
                  bgcolor: '#ffebee',
                  '&:hover': { bgcolor: '#ffcdd2' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {renderImage()}

            {imgSrc && (
              <Box className="flex justify-center mt-2">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => onSubmit(timestamp)}
                  startIcon={<SaveIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1,
                    px: 4,
                    boxShadow: 2,
                    background:
                      'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                  }}
                >
                  บันทึกข้อมูล
                </Button>
              </Box>
            )}
          </Paper>
        </Fade>
      )}
    </Container>
  );

  return (
    <Box className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      {loading ? (
        <Loading loading />
      ) : (
        <Box className="flex flex-col">
          {renderFormEmployee()}
          {renderEmployeeList()}
        </Box>
      )}
    </Box>
  );
}
