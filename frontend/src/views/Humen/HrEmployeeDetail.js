import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import * as actions from '../../redux/actions';
import dayjs from 'dayjs';
import {
    Avatar,
    Box,
    Card,
    Chip,
    Divider,
    Grid,
    Skeleton,
    Stack,
    Typography,
    Container,
    alpha,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Work as WorkIcon,
    DateRange as DateIcon,
    AttachMoney as SalaryIcon,
    Badge as BadgeIcon,
    QrCode as QrCodeIcon,
} from '@mui/icons-material';

import QRCode from 'react-qr-code';

// -------------------- helpers --------------------
const formatTHB = (n) =>
    typeof n === 'number'
        ? n
            .toLocaleString('th-TH', {
                style: 'currency',
                currency: 'THB',
                maximumFractionDigits: 0,
            })
            .replace('THB', '')
            .trim()
        : '-';

// -------------------- component --------------------
export default function HrEmployeeDetail({
    title = 'โปรไฟล์พนักงาน',
    subtitle = 'ข้อมูลผู้ใช้',
}) {
    const dispatch = useDispatch();
    const { id } = useParams();
    const employee = useSelector((state) => state.employee);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // โหลดข้อมูลครั้งแรก
    useEffect(() => {
        if (id) {
            dispatch(actions.employeeGet(id));
        } else {
            dispatch(actions.meGet());
        }
    }, [dispatch, id]);

    const renderEmployeeCard = () => (
        <div className='flex justify-center lg:px-20'>
            <Card
                elevation={8}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',

                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        p: { xs: 3, sm: 4 },
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: alpha('#fff', 0.1),
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: alpha('#fff', 0.05),
                        }
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            mb: 1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        บัตรประจำตัวพนักงาน
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            opacity: 0.9,
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        Employee ID Card
                    </Typography>
                </Box>

                {/* Main Content */}
                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                        {/* Left Column - Photo & Basic Info */}
                        <Grid item xs={12} md={6}>
                            <Stack alignItems="center" spacing={3}>
                                {/* Avatar */}
                                {employee?.isLoading ? (
                                    <Skeleton variant="circular" width={140} height={140} />
                                ) : (
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                inset: -8,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                zIndex: -1,
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={employee?.image?.url || ''}
                                            sx={{
                                                width: 140,
                                                height: 140,
                                                border: '4px solid #fff',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                                bgcolor: 'grey.200',
                                            }}
                                        />
                                    </Box>
                                )}

                                {/* Name & Role */}
                                {employee?.isLoading ? (
                                    <>
                                        <Skeleton width={200} height={32} />
                                        <Skeleton width={120} height={28} />
                                    </>
                                ) : (
                                    <>
                                        <Box textAlign="center">
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                                sx={{
                                                    mb: 1,
                                                    // background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                                    // backgroundClip: 'text',
                                                    // WebkitBackgroundClip: 'text',
                                                    // color: 'transparent',
                                                }}
                                            >
                                                {employee?.firstname} {employee?.lastname}
                                            </Typography>
                                            <Chip
                                                icon={<BadgeIcon />}
                                                label={employee?.role?.name || '-'}
                                                color="primary"
                                                variant="filled"
                                                sx={{
                                                    borderRadius: 3,
                                                    fontWeight: 600,
                                                    px: 2,
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                }}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </Grid>

                        {/* Right Column - QR Code & Details */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={3} alignItems="center">
                                {/* QR Code */}
                                {employee?.isLoading ? (
                                    <Skeleton variant="rounded" width={160} height={160} />
                                ) : (
                                    <Box textAlign="center">
                                        <Box
                                            sx={{
                                                bgcolor: '#fff',
                                                p: 2,
                                                borderRadius: 3,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                border: '1px solid',
                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                position: 'relative',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    inset: -2,
                                                    borderRadius: 3,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                                                    zIndex: -1,
                                                }
                                            }}
                                        >
                                            <QRCode value={String(employee?.check_key ?? '')} size={128} />
                                        </Box>
                                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                                            {/* <QrCodeIcon color="action" fontSize="small" /> */}
                                            {/* <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Check Key: {String(employee?.check_key ?? '') || '—'}
                      </Typography> */}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Details Section */}
                    <Divider sx={{ my: 4, borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                    <Grid container spacing={3}>
                        {[
                            {
                                icon: PhoneIcon,
                                label: 'เบอร์โทรศัพท์',
                                value: employee?.phone_number || '-',
                                color: theme.palette.success.main
                            },
                            {
                                icon: WorkIcon,
                                label: 'แผนก',
                                value: employee?.department?.name || '-',
                                color: theme.palette.info.main
                            },
                            {
                                icon: SalaryIcon,
                                label: 'เงินเดือน',
                                value: employee?.salary?.month ? `${formatTHB(employee?.salary.month)} บาท` : '-',
                                color: theme.palette.warning.main
                            },
                            {
                                icon: DateIcon,
                                label: 'วันที่เริ่มงาน',
                                value: employee?.start_date ? dayjs(employee?.start_date).format('DD/MM/YYYY') : '-',
                                color: theme.palette.error.main
                            }
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: alpha(item.color, 0.2),
                                        background: alpha(item.color, 0.03),
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: alpha(item.color, 0.4),
                                            background: alpha(item.color, 0.08),
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 8px 24px ${alpha(item.color, 0.15)}`,
                                        }
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                background: alpha(item.color, 0.1),
                                                color: item.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <item.icon fontSize="small" />
                                        </Box>
                                        <Box flex={1}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                fontWeight={600}
                                                sx={{ mb: 0.5, display: 'block' }}
                                            >
                                                {item.label}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {employee?.isLoading ? <Skeleton width="80%" /> : item.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        background: alpha(theme.palette.grey[900], 0.05),
                        p: 2,
                        textAlign: 'center',
                        borderTop: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        ออกบัตรเมื่อ: {dayjs().format('DD/MM/YYYY HH:mm')} น.
                    </Typography>
                </Box>
            </Card>
        </div>
    );

    // -------------------- render --------------------
    return (
        <Box >

            <Box sx={{ mt: 3 }}>
                {renderEmployeeCard()}
            </Box>
        </Box>
    );
}