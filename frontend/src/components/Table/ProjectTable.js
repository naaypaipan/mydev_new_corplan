import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Box,
  Tooltip,
  alpha,
  useTheme,
  Skeleton,
  Stack,
  Divider,
} from '@mui/material';
import _ from 'lodash';
import React from 'react';

// Icons
import LaunchIcon from '@mui/icons-material/Launch';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import ConstructionIcon from '@mui/icons-material/Construction';
import dayjs from 'dayjs';

export default function ProjectTable({
  projects,
  handleOnclickDetail,
  page,
  setPage,
  size,
  setSize,
}) {
  const theme = useTheme();

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  // ฟังก์ชันสำหรับแปลงสถานะเป็นภาษาไทย
  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'รอดำเนินการ';
      case 'IN_PROGRESS':
        return 'กำลังดำเนินการ';
      case 'COMPLETED':
        return 'เสร็จสิ้น';
      default:
        return 'ไม่ระบุ';
    }
  };

  // ฟังก์ชันสำหรับกำหนดสีตามสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  // จัดรูปแบบตัวเลขเงิน
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // แสดงสถานะว่างเปล่าเมื่อไม่มีข้อมูล
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={5} sx={{ p: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่พบข้อมูลโครงการ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีโครงการในระบบหรือไม่พบโครงการตามเงื่อนไขการค้นหา
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  // แสดงสถานะกำลังโหลดข้อมูล
  const renderLoadingState = () =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`loading-${index}`}>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={200} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={120} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rounded" width={90} height={24} />
          </TableCell>
        </TableRow>
      ));

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow className="bg-theme-500 text-white">
              <TableCell
                width="15%"
                sx={{ textAlign: 'center', color: 'white' }}
              >
                Project ID
              </TableCell>
              <TableCell
                width="40%"
                sx={{ textAlign: 'center', color: 'white' }}
              >
                Project Name
              </TableCell>
              <TableCell
                width="15%"
                sx={{ textAlign: 'center', color: 'white' }}
              >
                Value
              </TableCell>
              <TableCell
                width="15%"
                sx={{ textAlign: 'center', color: 'white' }}
              >
                Customer
              </TableCell>
              <TableCell
                width="15%"
                sx={{ textAlign: 'center', color: 'white' }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects?.isLoading
              ? renderLoadingState()
              : _.isEmpty(projects?.rows)
              ? renderEmptyState()
              : projects?.rows?.map((project, index) => (
                  <TableRow
                    key={project._id}
                    sx={{
                      cursor: 'pointer',
                      height: 70,
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(theme.palette.action.hover, 0.03),
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => handleOnclickDetail(project._id)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={project?.project_number || '-'}
                          size="small"
                          color="primary"
                          sx={{
                            mr: 1,

                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={500}>
                            {project?.name || '-'}
                          </Typography>
                          {project?.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: 300 }}
                            >
                              {project?.description}
                            </Typography>
                          )}
                        </Stack>
                        <Tooltip title="ดูรายละเอียด">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOnclickDetail(project._id);
                            }}
                            sx={{
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                              width: 28,
                              height: 28,
                            }}
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon
                          fontSize="small"
                          color="success"
                          sx={{ mr: 0.5, opacity: 0.7 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(project?.cost)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 0.5, opacity: 0.7 }}
                        />
                        <Typography variant="body2">
                          {project?.customer || '-'}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          size="small"
                          label={getStatusLabel(project?.operation_status)}
                          color={getStatusColor(project?.operation_status)}
                          sx={{ fontWeight: 500, minWidth: 90 }}
                        />

                        {project?.deliver_status?.status ? (
                          <Chip
                            size="small"
                            label="ส่งมอบแล้ว"
                            color="success"
                            variant="outlined"
                            sx={{ minWidth: 90 }}
                          />
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 50, 100]}
        component="div"
        count={projects?.total || 0}
        rowsPerPage={size}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="แถวต่อหน้า:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} จาก ${count}`
        }
        sx={{
          '& .MuiTablePagination-toolbar': {
            height: 56,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            margin: 0,
          },
        }}
      />
    </Paper>
  );
}
