import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

export default function TimestampProjectCost({ timestamp }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="py-2">
      <Card elevation={2}>
        <div className="p-4">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={10}
                  align="center"
                  sx={{
                    bgcolor: '#f97316',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  ค่าแรงพนักงาน (ไม่หักภาษีและประกันสังคม)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  โครงการ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  ค่าแรง
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  OT
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  ปกส.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  หักสาย
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  หัก ณ ที่จ่าย และอื่นๆ
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  ค่าแรงหลังหัก ปกส
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  เบี้ยเลี้ยง
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  เงินได้อื่นๆ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#fff7ed',
                    fontWeight: 600,
                    color: '#9a3412',
                    borderBottom: '2px solid #fed7aa',
                  }}
                >
                  รวม
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timestamp?.dashboard?.length > 0 ? (
                <>
                  {timestamp.dashboard.map((row, index) => (
                    <TableRow
                      key={row.id || index}
                      sx={{
                        '&:hover': {
                          bgcolor: '#fff7ed',
                        },
                      }}
                    >
                      <TableCell sx={{ borderBottom: '1px solid #fed7aa' }}>
                        {row?.project_number}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_salary)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_ot)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_sso)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_late)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_tax)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.amount)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_allowance)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_bonus)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ borderBottom: '1px solid #fed7aa' }}
                      >
                        {formatCurrency(row?.total_spent)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* สรุปรวมทุกโปรเจค */}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      รวมทั้งหมด
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_salary || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_ot || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_sso || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_late || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_tax || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.amount || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_allowance || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_bonus || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        bgcolor: '#ffedd5',
                        color: '#9a3412',
                        borderTop: '2px solid #f97316',
                      }}
                    >
                      {formatCurrency(
                        timestamp.dashboard.reduce(
                          (sum, row) => sum + (row?.total_spent || 0),
                          0,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{
                      color: 'text.secondary',
                      py: 6,
                      fontSize: '0.95rem',
                    }}
                  >
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
