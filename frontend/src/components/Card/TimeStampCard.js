import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Work as WorkIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import _ from 'lodash';

// import ImageUpload from '../../components/ImageUpload/ImageUpload';
import Cameras from '../Camera/Cameras';

export default function TimeStampCard({
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
  alert = false,
  noteCheckin,
  autoProject = false,
  useLocationCheck = true,
}) {
  const [ctime, setTime] = useState(new Date().toLocaleTimeString());
  const [note, setNote] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
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

  const handleCheckLevel = (event) => {
    const projectId = event.target.value;
    const selectedProj = _.find(project.rows, { _id: projectId });
    setSelectedProject(selectedProj);
    setProjectSelect(selectedProj);
  };

  const cancel = () => {
    setProjectSelect(null);
    setImgSrc('');
    setSelectedProject(null);
  };

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

              {/* ปุ่มบันทึก/ยกเลิก สำหรับหน้าจอใหญ่ */}
              {imgSrc && (
                <Box
                  sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    บันทึกการเข้างาน
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1.5,
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

                  {/* <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      onClick={cancel}
                      startIcon={<CancelIcon />}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={onSubmit}
                      startIcon={<SaveIcon />}
                    >
                      บันทึก
                    </Button>
                  </Stack> */}
                </Box>
              )}
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
              {alert && (
                <Box>
                  <div className="bg-red-600 text-xl text-white text-center p-2 ">
                    กำลังลงเวลานอกสถานที่
                  </div>
                </Box>
              )}

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

              {/* ส่วนโปรเจค: โหมดอ้างอิงโลเคชั่น = แสดงโครงการใกล้สุด, โหมดเก่า = เลือกโครงการเอง */}
              <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                {useLocationCheck ? (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      โครงการที่อยู่ใกล้ที่สุด (ภายใน 1 กม.)
                    </Typography>
                    {projectSelect ? (
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <PlaceIcon color="action" fontSize="small" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700 }}>
                            {projectSelect?.project_number
                              ? `${projectSelect.project_number}`
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
                            {projectSelect?.name || '-'}
                          </Typography>
                        </Box>
                        <Chip
                          label={
                            [
                              locationCheck?.nearestProject?.nearestSite?.name,
                              locationCheck?.nearestProject?.distanceText,
                            ]
                              .filter(Boolean)
                              .join(' · ') ||
                            locationCheck?.nearestProject?.distanceText ||
                            '-'
                          }
                          size="small"
                        />
                      </Card>
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
                  </>
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      เลือกโครงการ
                    </Typography>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="project-select-label">เลือกโปรเจค</InputLabel>
                      <Select
                        labelId="project-select-label"
                        id="project-select"
                        value={projectSelect ? projectSelect._id : ''}
                        onChange={handleCheckLevel}
                        label="เลือกโปรเจค"
                        renderValue={(selected) => {
                          if (!selected) return '';
                          const sel = _.find(project?.rows, { _id: selected });
                          if (!sel) return '';
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <Typography noWrap sx={{ fontWeight: 600 }}>
                                {`${sel.project_number} - ${sel.customer || '-'} | ${sel.location || '-'}`}
                              </Typography>
                              <Typography noWrap variant="caption" color="text.secondary">
                                {`${sel.name || '-'}`}
                              </Typography>
                            </Box>
                          );
                        }}
                      >
                        <MenuItem value="" disabled>กรุณาเลือกโปรเจค</MenuItem>
                        {project?.rows?.map((row) => (
                          <MenuItem key={row._id} value={row._id} sx={{ alignItems: 'flex-start', py: 1 }}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }} title={`${row.project_number} - ${row.name}`}>
                                {`${row.project_number} - ${row.name}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {`${row.customer || '-'} · ${row.location || '-'}`}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}
              </Box>

              {/* ส่วนแสดงตำแหน่งที่อยู่ใกล้ที่สุด */}

              {/* ส่วนกล้องถ่ายรูป - ทำให้กระชับในโหมดมือถือ */}
              {projectSelect && (
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

            {/* ปุ่มบันทึก/ยกเลิก - แสดงเสมอในโหมดมือถือ */}
            {imgSrc && (
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
                <div className="py-2">
                  <TextField
                    label="หมายเหตุ (จำเป็น)"
                    variant="outlined"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    onChange={(e) => setNoteCheckin(e.target.value)}
                  />
                </div>

                {/* {noteCheckin.trim() !== '' && alert && ( */}
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
                {/* )} */}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
