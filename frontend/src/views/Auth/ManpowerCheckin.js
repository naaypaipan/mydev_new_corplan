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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import * as actions from '../../redux/actions';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import PlaceIcon from '@mui/icons-material/Place';
import Cameras from 'components/Camera/Cameras';
import Loading from 'components/Loading';
import CameraIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
import SaveIcon from '@mui/icons-material/Save';
import { useGeolocated } from 'react-geolocated';
import CalculateGps from 'utils/functions/CalculateGps';
import CalculateGpsByProject from 'utils/functions/CalculateGpsByProject';
import { da } from 'date-fns/locale';

dayjs.locale('th');
dayjs.extend(relativeTime);

export default function ManpowerCheckin() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const employee = useSelector((state) => state.employee);
  const project = useSelector((state) => state.project);
  const timestamp = useSelector((state) => state.timestamp);

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );
  const [openScan, setOpenScan] = useState(true);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openEmployeeListModal, setOpenEmployeeListModal] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [emSelect, setEmSelect] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);

  const getTimeStamp = () => {
    dispatch(
      actions.timestampManpower({
        project_id: id,
        status_checkIn: true,
        dateStart: dayjs().startOf('date').toISOString(),
        dateEnd: dayjs().endOf('date').toISOString(),
      }),
    );
  };

  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    },
    userDecisionTimeout: 5000,
  });

  const locationCheckIn = CalculateGpsByProject(coords, project, 1000);

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
    getTimeStamp();
  }, [dispatch, id]);

  const handleScan = async (data) => {
    if (data) {
      await dispatch(actions.employeeTimestamp({ em: data }));
      setOpenScan(false);
    }
  };

  const handleRescan = async () => {
    await dispatch(actions.employeeReset());
    setOpenScan(true);
    setShowCamera(false);
    setImgSrc(null);
  };

  const handleButtonClick = () => {
    if (_.isEmpty(emSelect)) {
      alert('กรุณากรอกรหัสพนักงาน');
    } else {
      dispatch(actions.employeeTimestamp({ em: emSelect }));
      setOpenScan(false);
    }
  };

  const onSubmit = async (data) => {
    if (!imgSrc) {
      alert('กรุณาถ่ายรูปก่อนบันทึก');
    } else {
      const confirm = window.confirm('ยืนยันการบันทึกข้อมูล?');
      if (confirm) {
        setLoading(true);
        const dataSubmit = {
          check_in_source: 'manpower_link',
          employee: data?._id,
          employeekey: data?.check_key,
          employee_firstname: data?.firstname,
          employee_lastname: data?.lastname,
          employeeType: data?.type,
          salary: data?.salary,
          salary_extra: data?.salary_extra,
          status_checkIn: true,
          project_in: project,
          image: imgSrc,
        };
        await dispatch(actions.timestampCreate(dataSubmit));
        setLoading(false);
        setImgSrc(null);
        handleRescan();
        getTimeStamp();
      }
    }
  };

  const handleChange = (event) => {
    setEmSelect(event.target.value);
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
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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
          background: 'linear-gradient(to bottom, #ffffff, #f5f8ff)',
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
        }}
      >
        <Typography
          variant="h4"
          className="font-bold text-center mb-2"
          sx={{ color: '#1976d2' }}
        >
          ลงเวลาเข้างาน
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography
          variant="h6"
          className="text-center mb-1"
          sx={{ color: '#1976d2' }}
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
                <QrCodeScannerIcon color="primary" sx={{ mr: 1 }} />
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
                      sx={{ borderRadius: 2 }}
                    >
                      ค้นหา
                    </Button>
                  </Box>
                </Paper>
              </Box>
              <div className="flex  mt-4">
                <Badge
                  badgeContent={timestamp?.rows?.length || 0}
                  color="error"
                  max={999}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<GroupsIcon />}
                    onClick={() => setOpenEmployeeListModal(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    รายชื่อพนักงานลงเวลาประจำวัน
                  </Button>
                </Badge>
              </div>
            </Box>
          </Fade>
        )}
      </Paper>
    </Container>
  );

  const renderEmployeeListModal = () => (
    <Dialog
      open={openEmployeeListModal}
      onClose={() => setOpenEmployeeListModal(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? '100vh' : '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#43a047',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center">
          <GroupsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            พนักงานลงเวลา - {dayjs().format('DD/MM/YYYY')}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setOpenEmployeeListModal(false)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {_.isEmpty(timestamp?.rows) ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <GroupsIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6">ยังไม่มีพนักงานลงเวลา</Typography>
            <Typography variant="body2">
              ข้อมูลจะแสดงเมื่อมีพนักงานลงเวลาเข้างาน
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {_.map(timestamp?.rows, (item, index) => (
              <React.Fragment key={item._id || index}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <CheckCircleIcon
                          sx={{
                            color: '#43a047',
                            fontSize: 20,
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      }
                    >
                      <Avatar
                        src={item?.image?.url}
                        sx={{
                          width: isMobile ? 48 : 56,
                          height: isMobile ? 48 : 56,
                          border: '2px solid #43a047',
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item?.employee_firstname} {item?.employee_lastname}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          mt={0.5}
                        >
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(item?.createdAt).format('HH:mm น.')}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({dayjs(item?.createdAt).fromNow()})
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Stack spacing={0.5}>
                          {item?.out_of_location && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOnIcon fontSize="small" color="error" />
                              <Typography variant="body2" color="error">
                                อยู่นอกพื้นที่โครงการ
                              </Typography>
                            </Box>
                          )}

                          {item?.employeeType?.name && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ประเภท: {item?.employeeType?.name}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>

                {index < timestamp?.rows?.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box
          sx={{
            p: 2,
            bgcolor: '#f5f5f5',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            รวมทั้งหมด <strong>{timestamp?.rows?.length || 0}</strong> คน
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const renderEmployeeList = () => (
    <Container maxWidth="sm" sx={{ mb: 4 }}>
      {_.isEmpty(employee?.rows)
        ? !openScan && (
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
                <ClearIcon fontSize="large" />
              </IconButton>
            </Paper>
          )
        : _.map(employee?.rows, (row, index) => (
            <Fade in={true} key={row._id || index} timeout={500}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  mb: 2,
                  background: 'linear-gradient(to bottom, #ffffff, #f7f9fc)',
                }}
              >
                <Box className="flex justify-between items-start mb-3">
                  <Box className="flex items-center">
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: '#1976d2' }}
                      >
                        {row?.firstname} {row?.lastname}
                      </Typography>
                      <Box className="flex items-center">
                        <GroupsIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 0.5 }}
                        />
                        <Typography variant="body1" color="textSecondary">
                          ทีม: {row?.team || '-'}
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
                    {project?.time_tracking_link_enabled !== false ? (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => onSubmit(row)}
                        startIcon={<SaveIcon />}
                        sx={{
                          borderRadius: 3,
                          py: 1,
                          px: 4,
                          boxShadow: 2,
                          background:
                            'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                        }}
                      >
                        บันทึกข้อมูล
                      </Button>
                    ) : (
                      <div>ไม่อยู่ในช่วงเวลาที่สามารถบันทึกได้</div>
                    )}
                  </Box>
                )}
              </Paper>
            </Fade>
          ))}
    </Container>
  );

  return (
    <Box className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {loading ? (
        <Loading loading />
      ) : (
        <Box className="flex flex-col">
          {renderFormEmployee()}
          {renderEmployeeList()}
          {renderEmployeeListModal()}
        </Box>
      )}
    </Box>
  );
}
