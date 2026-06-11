import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Typography,
  Stack,
  Divider,
  Paper,
  Grid,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  TextField,
} from '@mui/material';
import {
  Login as LoginIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
  Place as PlaceIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

// import ImageUpload from '../../components/ImageUpload/ImageUpload';
import Cameras from '../Camera/Cameras';

export default function TimeStampGPSCard({
  me,
  date,
  imgSrc,
  setImgSrc,
  setNoteCheckin,
  project,
  projectSelect,
  setProjectSelect,
  onSubmit,
  locationCheck,
  autoProject = false,
}) {
  const [ctime, setTime] = useState(new Date().toLocaleTimeString());
  const [note, setNote] = useState('');
  const theme = useTheme();

  // เพิ่มตัวตรวจสอบขนาดหน้าจอ
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const cancel = () => {
    setImgSrc('');
  };

  const nearestProject = locationCheck?.nearestProject?.project;
  const distanceText = locationCheck?.nearestProject?.distanceText || '';
  const nearestSiteName =
    locationCheck?.nearestProject?.nearestSite?.name || '';
  const distanceChipLabel =
    [nearestSiteName, distanceText].filter(Boolean).join(' · ') ||
    distanceText ||
    '-';
  const isWithin1Km = locationCheck?.nearestProject?.isNearby === true;
  const selected = projectSelect || nearestProject;
  const canCheckIn = isWithin1Km && selected;

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        {/* ส่วนข้อมูลพนักงาน - ซ่อนในโหมดมือถือ */}
        {!isMobile && (
          <Grid item xs={12} md={4} lg={3}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexGrow: 1,
                }}
              >
                <Avatar
                  src={me?.userData?.image?.url}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="primary.main"
                  textAlign="center"
                >
                  {me?.userData?.firstname} {me?.userData?.lastname}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  {me?.userData?.department?.name || '-'} •{' '}
                  {me?.userData?.role?.name || '-'}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    width: '100%',
                  }}
                >
                  <TimerIcon color="primary" fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    วันนี้: {ctime}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ส่วนบันทึกเวลาเข้างาน - ปรับขนาดให้เต็มจอในโหมดมือถือ */}
        <Grid item xs={12} md={isMobile ? 12 : 8} lg={isMobile ? 12 : 7}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {/* ส่วนหัวการเช็คอิน - ปรับให้เหมาะสมกับมือถือ */}
              <Grid container>
                <Grid item xs={isMobile ? 4 : 12} sm={4}>
                  <Box
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      bgcolor: theme.palette.primary.main,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'white',
                          width: isMobile ? 24 : 32,
                          height: isMobile ? 24 : 32,
                        }}
                      >
                        <LoginIcon
                          fontSize={isMobile ? 'small' : 'medium'}
                          sx={{ color: theme.palette.primary.main }}
                        />
                      </Avatar>
                      <Typography
                        variant={isMobile ? 'body2' : 'subtitle1'}
                        fontWeight={600}
                        color="white"
                      >
                        Check-In
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={isMobile ? 8 : 12} sm={8}>
                  <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={isMobile ? 1 : 3}
                      divider={
                        !isMobile && <Divider orientation="vertical" flexItem />
                      }
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            วันที่
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {dayjs(date).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            เวลา
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {ctime}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider />

              {/* แสดงข้อมูลพนักงานแบบย่อในโหมดมือถือ */}
              {isMobile && (
                <Box
                  sx={{
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      src={me?.userData?.image?.url}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={500}>
                        {me?.userData?.firstname} {me?.userData?.lastname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {me?.userData?.department?.name || '-'} •{' '}
                        {me?.userData?.role?.name || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* ส่วนโปรเจค (คำนวณอัตโนมัติ) */}
              <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}
                >
                  โครงการที่อยู่ใกล้ที่สุด (ภายใน 1 กม.)
                </Typography>

                {selected ? (
                  <>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ...(!isWithin1Km && {
                          bgcolor: alpha(theme.palette.error.main, 0.06),
                          borderColor: alpha(theme.palette.error.main, 0.3),
                        }),
                      }}
                    >
                      <PlaceIcon
                        fontSize="small"
                        sx={{ color: isWithin1Km ? 'action' : 'error.main' }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>
                          {selected?.project_number
                            ? `${selected.project_number}`
                            : 'ไม่ระบุเลขโครงการ'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {selected?.name || '-'}
                        </Typography>
                      </Box>
                      <Chip label={distanceChipLabel} size="small" />
                    </Card>
                    {!isWithin1Km && (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{
                          mt: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          border: '1px solid',
                          borderColor: 'error.main',
                        }}
                      >
                        <WarningIcon color="error" fontSize="small" />
                        <Typography variant="body2" color="error" fontWeight={600}>
                          เกิน 1 กม. ไม่สามารถลงเวลาได้ กรุณาติดต่อแอดมิน
                        </Typography>
                      </Stack>
                    )}
                  </>
                ) : (
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      borderColor: alpha(theme.palette.error.main, 0.3),
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WarningIcon color="error" fontSize="small" />
                      <Typography variant="body2" color="error" fontWeight={600}>
                        อยู่นอกโลเคชั่นการลงเวลา (ไม่พบโครงการในระยะ 1 กม.)
                      </Typography>
                    </Stack>
                  </Card>
                )}
              </Box>

              {/* ส่วนกล้องถ่ายรูป - แสดงเฉพาะเมื่ออยู่ภายใน 1 กม. */}
              {canCheckIn && (
                <Box sx={{ p: isMobile ? 1.5 : 2, pt: 0 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderStyle: 'dashed',
                      p: isMobile ? 1.5 : 2,
                      bgcolor: 'transparent',
                    }}
                  >
                    <Typography
                      variant={isMobile ? 'body2' : 'subtitle2'}
                      fontWeight={500}
                      gutterBottom
                      sx={{ mb: 1 }}
                    >
                      {isMobile ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <PhotoCameraIcon fontSize="small" />
                          <span>ถ่ายภาพยืนยันตัวตน</span>
                        </Stack>
                      ) : (
                        'ถ่ายภาพยืนยันตัวตน'
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Cameras imgSrc={imgSrc} setImgSrc={setImgSrc} />
                    </Box>
                  </Paper>
                </Box>
              )}
            </CardContent>

            {/* ปุ่มบันทึก/ยกเลิก - แสดงเฉพาะเมื่ออยู่ภายใน 1 กม. และถ่ายรูปแล้ว */}
            {canCheckIn && imgSrc && (
              <Box
                sx={{
                  p: isMobile ? 1.5 : 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {!isMobile && (
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    บันทึกการเข้างาน
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    p: isMobile ? 1 : 1.5,
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                  }}
                >
                  <WarningIcon color="warning" fontSize="small" />
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    หากตรวจพบการทุจริต การเข้างานครั้งนี้จะถูกยกเลิกทันที
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={cancel}
                    startIcon={!isMobile && <CancelIcon />}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onSubmit}
                    startIcon={!isMobile && <SaveIcon />}
                  >
                    บันทึก
                  </Button>
                </Stack>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
