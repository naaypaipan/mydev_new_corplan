import TimeStampCard from '../../components/Card/TimeStampCard';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import * as actions from '../../redux/actions';
import Loading from 'components/Loading';
import TimeStampType2Card from 'components/Card/TimeStampType2Card';
import { useGeolocated } from 'react-geolocated';
import CalculateGpsByProject from 'utils/functions/CalculateGpsByProject';
import CalculateGps from '../../utils/functions/CalculateGps';
import CalculateSalaryperday from '../../utils/functions/CalculateSalaryperday';
import dayjs from 'dayjs';
import TimeStampGPSCard from '../../components/Card/TimeStampGPSCard';
import {
  Card,
  Button,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  Paper,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import {
  LocationOff as LocationOffIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

export default function CheckIn({ title, subtitle }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.me);
  const project = useSelector((state) => state.project);
  const info = useSelector((state) => state.info);
  const holiday = useSelector((state) => state.holiday);
  const history = useHistory();
  const [imgSrc, setImgSrc] = useState(null);
  const [note, setNote] = useState('');
  const [noteCheckin, setNoteCheckin] = useState('');
  const [projectSelect, setProjectSelect] = useState();
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    positionError,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false, // false = ได้ตำแหน่งเร็วขึ้น (ใช้เครือข่าย/เซลล์)
      timeout: 10000, // รอสูงสุด 10 วินาที
      maximumAge: 5 * 60 * 1000, // ใช้ตำแหน่งแคชได้ถ้าไม่เก่าเกิน 5 นาที (ได้ทันทีถ้ามีแคช)
    },
    userDecisionTimeout: 5000,
  });

  const locationCheckIn = CalculateGps(coords, project?.rows, 1000);
  const isAdmin = !!me?.userData?.permissions?.admin;
  const hasCoords = coords != null;
  const nearest = locationCheckIn?.nearestProject;
  const nearestProject = nearest?.project;
  const nearestDistanceM = nearest?.distance;
  const isWithin1Km = nearest?.isNearby === true;
  const isOutOfLocation = hasCoords && !isWithin1Km;
  const locationLoading =
    isGeolocationEnabled && coords == null && !positionError;

  // Auto select nearest project only when within 1km
  useEffect(() => {
    if (!nearestProject || !isWithin1Km) return;
    if (projectSelect?._id === nearestProject?._id) return;
    setProjectSelect(nearestProject);
  }, [nearestProject?._id, isWithin1Km]);

  useEffect(() => {
    dispatch(actions.meGet({}));
    dispatch(actions.getInformation());
    dispatch(actions.projectAll({ time_tracking_enabled: true }));
    dispatch(actions.holidayAll({ date: dayjs().startOf('date') }));
    return () => {};
  }, []);

  const rate = CalculateSalaryperday(holiday);

  const useLocationMode =
    (me?.userData?.timestamp_use_location != null
      ? !!me.userData.timestamp_use_location
      : !!info?.setting?.timestamp_location);

  const onSubmit = async () => {
    if (useLocationMode && (isOutOfLocation || !isWithin1Km)) {
      alert('อยู่นอกพื้นที่ 1 กม. ไม่สามารถลงเวลาได้ กรุณาติดต่อแอดมิน');
      return;
    }
    if (!projectSelect) {
      alert(useLocationMode ? 'ไม่พบโครงการในระยะ 1 กม.' : 'กรุณาเลือกโครงการ');
    } else {
      const confirm = window.confirm('save');
      if (confirm) {
        setLoading(true);
        const data = {
          check_in_source: 'profile',
          employee: me?.userData?._id,
          employee_firstname: me?.userData?.firstname,
          employee_lastname: me?.userData?.lastname,
          employeeType: me?.userData?.type,
          salary: me?.userData?.salary,
          salary_extra: me?.userData?.salary_extra,
          status_checkIn: true,
          project_in: projectSelect,
          image: imgSrc,
          locationCheckIn: useLocationMode ? locationCheckIn : undefined,
          rate,
          out_of_location: useLocationMode ? isOutOfLocation : false,
          note: noteCheckin,
        };
        await dispatch(actions.timestampCreate(data));
        // await dispatch(actions.timestampAll({}));
        setLoading(false);
        history.goBack();
      }
    }
  };

  const renderCard = () => (
    <div>
      {info?.setting?.timestamp_image ? (
        <div>
          <TimeStampGPSCard
            me={me}
            date={new Date()}
            imgSrc={imgSrc}
            setImgSrc={setImgSrc}
            noteCheckin={noteCheckin}
            setNoteCheckin={setNoteCheckin}
            project={project}
            projectSelect={projectSelect}
            setProjectSelect={setProjectSelect}
            onSubmit={onSubmit}
            locationCheck={locationCheckIn}
            autoProject
          />
        </div>
      ) : (
        <TimeStampType2Card
          me={me}
          date={new Date()}
          imgSrc={imgSrc}
          setImgSrc={setImgSrc}
          noteCheckin={noteCheckin}
          setNoteCheckin={setNoteCheckin}
          project={project}
          projectSelect={projectSelect}
          setProjectSelect={setProjectSelect}
          onSubmit={onSubmit}
          autoProject
          locationCheck={locationCheckIn}
        />
      )}
    </div>
  );

  const renderTimeStampCardWithOutLocation = () => (
    <div>
      {!approved ? (
        <>
          <Box
            sx={{
              minHeight: '100vh',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Card
              variant="outlined"
              sx={{
                maxWidth: 400,
                width: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                bgcolor: 'background.paper',
              }}
            >
              {/* Header Section */}
              <Box
                sx={{
                  background:
                    'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  p: 3,
                  textAlign: 'center',
                  color: 'white',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <LocationOffIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  นอกพื้นที่ทำงาน
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  ตำแหน่งปัจจุบันของท่านอยู่นอกเขตพื้นที่ปฏิบัติงาน
                </Typography>
              </Box>
              {/* Content Section */}
              <Box sx={{ p: 3 }}>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                    },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700 }}>
                    การลงเวลานอกสถานที่
                  </AlertTitle>
                  กรุณาแนบหลักฐานหรือเหตุผลในการทำงานนอกสถานที่
                  เพื่อให้ผู้บริหารสามารถตรวจสอบและอนุมัติได้
                </Alert>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    borderStyle: 'dashed',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    📋 ตัวอย่างหลักฐาน
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    • รูปถ่ายสถานที่ปฏิบัติงาน
                    <br />
                    • ใบงาน หรือหนังสือนัดหมาย
                    <br />• คำอธิบายสั้นๆ เกี่ยวกับงาน
                  </Typography>
                </Paper>

                {/* Action Buttons */}
                <Stack spacing={2}>
                  {isAdmin ? (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => setApproved(true)}
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background:
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #43a3f5 0%, #00d4e6 100%)',
                        },
                      }}
                    >
                      ดำเนินการลงเวลา (แอดมิน)
                    </Button>
                  ) : (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: '1.5rem' },
                      }}
                    >
                      <AlertTitle sx={{ fontWeight: 700 }}>
                        ไม่สามารถลงเวลาได้
                      </AlertTitle>
                      การลงเวลานอกโลเคชั่นถูกปิดสำหรับผู้ใช้ทั่วไป
                      กรุณาติดต่อแอดมินเพื่อดำเนินการให้
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => history.goBack()}
                    startIcon={<CancelIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: 'grey.300',
                      color: 'text.secondary',
                    }}
                  >
                    ย้อนกลับ
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<WarningIcon fontSize="small" />}
                    label={
                      isAdmin
                        ? 'อนุญาตเฉพาะแอดมิน'
                        : 'กรุณาติดต่อแอดมินเพื่ออนุมัติ'
                    }
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              </Box>{' '}
            </Card>
          </Box>
        </>
      ) : (
        <Box>
          <TimeStampCard
            me={me}
            date={new Date()}
            imgSrc={imgSrc}
            setImgSrc={setImgSrc}
            noteCheckin={noteCheckin}
            setNoteCheckin={setNoteCheckin}
            project={project}
            projectSelect={projectSelect}
            setProjectSelect={setProjectSelect}
            onSubmit={onSubmit}
            locationCheck={locationCheckIn}
            alert={true}
          />
        </Box>
      )}
    </div>
  );
  const renderOldCard = () => (
    <div>
      {info?.setting?.timestamp_image ? (
        <TimeStampCard
          me={me}
          date={new Date()}
          imgSrc={imgSrc}
          setImgSrc={setImgSrc}
          noteCheckin={noteCheckin}
          setNoteCheckin={setNoteCheckin}
          project={project}
          projectSelect={projectSelect}
          setProjectSelect={setProjectSelect}
          onSubmit={onSubmit}
          locationCheck={locationCheckIn}
          useLocationCheck={false}
        />
      ) : (
        <TimeStampType2Card
          me={me}
          date={new Date()}
          imgSrc={imgSrc}
          setImgSrc={setImgSrc}
          noteCheckin={noteCheckin}
          setNoteCheckin={setNoteCheckin}
          project={project}
          projectSelect={projectSelect}
          setProjectSelect={setProjectSelect}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );

  const renderLocationLoading = () => (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 380,
          width: '100%',
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary" gutterBottom>
          กำลังหาตำแหน่ง...
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          เปิดการเข้าถึงตำแหน่งให้แอปแล้วรอสักครู่
          (ใช้ตำแหน่งแคชถ้ามี จะได้เร็วขึ้น)
        </Typography>
      </Card>
    </Box>
  );

  const renderCheckPageCheckin = () => (
    <div>
      {locationLoading
        ? renderLocationLoading()
        : isOutOfLocation
        ? renderTimeStampCardWithOutLocation()
        : renderCard()}
    </div>
  );

  if (
    !project?.isLoading &&
    project?.isCompleted &&
    !info?.isLoading &&
    info?.isCompleted
  ) {
    return (
      <div>
        {useLocationMode ? (
          loading ? (
            <Loading loading />
          ) : (
            renderCheckPageCheckin()
          )
        ) : loading ? (
          <Loading loading />
        ) : (
          renderOldCard()
        )}
      </div>
    );
  }
  return <Loading isLoading />;
}
