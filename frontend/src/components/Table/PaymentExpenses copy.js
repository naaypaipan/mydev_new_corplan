import React from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export default function PaymentExpenses({ rows = [], onEdit }) {
  const theme = useTheme();

  return (
    <Box>
      <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: theme.palette.grey[100] }}>
                <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                  No.
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>รายการ</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  ยอดเงิน
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  Job budget
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 80 }}>
                  D/d
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 80 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No data</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow
                    key={row._id || idx}
                    hover
                    sx={{
                      '&:hover': {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {row.name || '-'}
                      </Typography>
                      {row.description && (
                        <Typography variant="caption" color="text.secondary">
                          {row.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography color="primary" fontWeight={500}>
                        {row.amount?.toLocaleString() || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.project?.project_number || '-'}</TableCell>
                    <TableCell>{row.dd || '-'}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {row.total?.toLocaleString() || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="แก้ไข">
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(row)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
