import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import * as actions from '../../redux/actions';

import Loading from 'components/Loading';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Paper,
  alpha,
  useTheme,
  Switch, // Add Switch
  FormControlLabel, // Add FormControlLabel
} from '@mui/material';

import {
  Edit as ModeEditIcon,
  Business,
  AssignmentInd,
  ReceiptLong,
  Link as LinkIcon,
  LocationOn,
  Phone,
  Email,
  Settings, // Add Settings Icon
  AttachMoney,
} from '@mui/icons-material';

export default function BusinessProfile({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();

  const me = useSelector((state) => state.me);
  const info = useSelector((state) => state.info);
  const info_id = info?._id;

  useEffect(() => {
    dispatch(actions.meGet());
    dispatch(actions.getInformation());
  }, [dispatch]);

  const handleEdit = () => {
    history.push(`/management/business/edit/${info_id}`);
  };

  const BusinessInfoCard = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <Business />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              ข้อมูลบริษัท
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<ModeEditIcon />}
            onClick={handleEdit}
          >
            แก้ไขข้อมูล
          </Button>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  ข้อมูลพื้นฐาน
                </Typography>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ชื่อบริษัท
                    </Typography>
                    <Typography variant="body1">{info?.name || '-'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ชื่อภาษาอังกฤษ
                    </Typography>
                    <Typography variant="body1">
                      {info?.name_eng || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptLong fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        เลขที่ผู้เสียภาษี
                      </Typography>
                    </Stack>
                    <Typography variant="body1">
                      {info?.tax_id || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinkIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        เว็บไซต์
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body1"
                      component="a"
                      href={
                        info?.url?.startsWith('http')
                          ? info?.url
                          : `https://${info?.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {info?.url || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  ข้อมูลติดต่อ
                </Typography>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        ที่อยู่
                      </Typography>
                    </Stack>
                    <Typography variant="body1">
                      {info?.address || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        เบอร์โทรศัพท์
                      </Typography>
                    </Stack>
                    <Typography variant="body1">
                      {info?.phone || '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        อีเมล
                      </Typography>
                    </Stack>
                    <Typography variant="body1">
                      {info?.email || '-'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    );
  };

  const CompanySettingsCard = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <AssignmentInd />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              ข้อมูลเพิ่มเติม
            </Typography>
          </Stack>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    จำนวนพนักงาน
                  </Typography>
                  <Typography variant="body1">
                    {info?.employee_count || '-'} คน
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ประเภทธุรกิจ
                  </Typography>
                  <Typography variant="body1">
                    {info?.business_type || '-'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ปีที่ก่อตั้ง
                  </Typography>
                  <Typography variant="body1">
                    {info?.established_year || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    สาขา
                  </Typography>
                  <Typography variant="body1">
                    {info?.branch_count || '-'} สาขา
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {info?.description && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    รายละเอียดบริษัท
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {info?.description}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Paper>
    );
  };

  // New Card for Social Security Deduction
  const SocialSecurityDeductionCard = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.success.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.success.main }}>
              <AttachMoney />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              การหักประกันสังคม (SSO)
            </Typography>
          </Stack>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    อัตราการหักของพนักงาน
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {info?.setting?.payroll?.sso?.rate_percent || '-'} %
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ยอดเพดานสูงสุด
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {info?.setting?.payroll?.sso?.max_amount
                      ? `${info?.setting?.payroll?.sso?.max_amount.toLocaleString()} บาท`
                      : '-'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    );
  };

  // New Card for System Settings
  const SystemSettingsCard = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <Settings />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              การตั้งค่าระบบ
            </Typography>
          </Stack>
        </Box>

        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  แผ่นงาน Google Sheet (Payout)
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {info?.google_sheet_worksheet || 'ใช้แผ่นแรก (ค่าเริ่มต้น)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ตั้งค่าที่ แก้ไขข้อมูลบริษัท → การตั้งค่า Google Sheet
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                รูปแบบลงเวลา (อ้างอิงโลเคชั่น หรือเลือกโครงการเอง) ตั้งค่าที่รายการพนักงาน → แก้ไขพนักงาน → รูปแบบลงเวลา
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    );
  };

  if (!info?.isLoading && info?.isCompleted) {
    return (
      <Box sx={{ pb: 4 }}>
        <Box sx={{ mt: 3 }}>
          <BusinessInfoCard />
          <CompanySettingsCard />
          <SocialSecurityDeductionCard />
          <SystemSettingsCard /> {/* Add the new System Settings Card */}
        </Box>
      </Box>
    );
  }

  return <Loading isLoading />;
}
