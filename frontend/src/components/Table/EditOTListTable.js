import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Paper,
  Stack,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import _ from 'lodash';
import React from 'react';
import dayjs from 'dayjs';

export default function EditOTListTable({
  otRequestOrder,
  handleEdit,
  handleDeletePerson,
}) {
  const theme = useTheme();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(value || 0);
  };

  const getRateChip = (rate) => {
    const rateConfig = {
      1: { label: 'X1', color: 'primary' },
      1.5: { label: 'X1.5', color: 'warning' },
      3: { label: 'X3', color: 'error' },
    };
    const config = rateConfig[rate] || rateConfig[1];
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  if (!otRequestOrder?.ot_lists || otRequestOrder.ot_lists.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body1">ไม่มีข้อมูล OT</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // คำนวณยอดรวม
  const totalHours = _.sumBy(
    otRequestOrder.ot_lists,
    (item) => item?.total_hours || 0,
  );
  const totalAmount = _.sumBy(
    otRequestOrder.ot_lists,
    (item) => item?.total_price || 0,
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>พนักงาน</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  เวลาเริ่ม
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  เวลาสิ้นสุด
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  จำนวนชั่วโมง
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  อัตรา
                </TableCell>

                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.map(otRequestOrder.ot_lists, (row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {row?.employee_name || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row?.department || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {row?.startTime
                        ? dayjs(row?.startTime).format('HH:mm')
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {row?.endTime ? dayjs(row?.endTime).format('HH:mm') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row?.total_hours?.toFixed(2) || 0} ชม.`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">{getRateChip(row?.rate)}</TableCell>

                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                    >
                      <Tooltip title="แก้ไข">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePerson(row?._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
