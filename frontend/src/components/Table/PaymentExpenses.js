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
      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: theme.palette.grey[100] }}>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, width: 50, py: 1 }}
                >
                  No.
                </TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1 }}>รายการ</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1 }}>
                  ยอดเงิน
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1 }}>
                  Job budget
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 60, py: 1 }}>
                  D/d
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100, py: 1 }}>
                  Total
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, width: 60, py: 1 }}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" variant="body2">
                      No data
                    </Typography>
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
                    <TableCell align="center" sx={{ py: 1 }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2">{row.name || '-'}</Typography>
                      {row.description && (
                        <Typography variant="caption" color="text.secondary">
                          {row.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={500}
                      >
                        {row?.price?.toLocaleString() || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2">
                        {row.project?.project_number || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2">
                        {row?.type || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.total?.toLocaleString() || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Tooltip title="แก้ไข">
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(row)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
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
