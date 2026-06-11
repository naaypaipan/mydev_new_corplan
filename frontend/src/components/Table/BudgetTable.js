import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import _ from 'lodash';
import React from 'react';

export default function BudgetTable({
  budget,
  handleEditBudget,
  handleDeleteBudget,
}) {
  const renderCost = (data) => {
    const fil = _?.filter(data?.expenses, (each) => each?.status === 'SUCCESS');
    const cost1 = _?.sumBy(fil, (e) => e?.price);
    return cost1;
  };

  const renderCostApprove = (data) => {
    const fil = _?.filter(data?.expenses, (each) => each?.status === 'APPROVE');
    const cost1 = _?.sumBy(fil, (e) => e?.price);
    return cost1;
  };

  const renderPercen = (data) => {
    const fil = _?.filter(data?.expenses, (each) => each?.status === 'SUCCESS');
    const cost1 = _?.sumBy(fil, (e) => e?.price);

    const per = (cost1 / (data?.cost === 0 ? 1 : data?.cost)) * 100;

    return per; // Actual percentage value
  };

  const renderTotal = (data) => {
    const a = renderCost(data);
    const b = renderCostApprove(data);
    return data?.cost - a - b;
  };

  const normalizePercentage = (percentage) => {
    return Math.min(percentage, 100); // Normalize to fit within 0–100
  };

  return (
    <div>
      <Paper>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow className={'bg-gray-600'}>
                <TableCell>
                  <div className="text-white">No</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Order</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Budget</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Grand Total</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Percent</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Expected</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">Remaining</div>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className={'bg-gray-100'}>
                <TableCell />
                <TableCell />
                <TableCell>
                  <span style={{ fontWeight: 600 }}>
                    {_.sumBy(budget, (e) => e?.cost || 0)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 600 }}>
                    {_.sumBy(budget, (e) => renderCost(e) || 0)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 600 }}>
                    {(
                      (_.sumBy(budget, (e) => renderCost(e) || 0) /
                        (_.sumBy(budget, (e) => e?.cost || 0) || 1)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 600 }}>
                    {_.sumBy(budget, (e) => renderCostApprove(e) || 0)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontWeight: 600 }}>
                    {_.sumBy(budget, (e) => renderTotal(e) || 0)
                      .toFixed(2)
                      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </span>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {_.isEmpty(budget) ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex justify-center">No items</div>
                  </TableCell>
                </TableRow>
              ) : (
                _?.map(budget, (e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e?.prefix}
                      {e?.budget_number}
                    </TableCell>
                    <TableCell>{e?.name}</TableCell>
                    <TableCell>
                      {e?.cost?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </TableCell>
                    <TableCell>
                      {renderCost(e)
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </TableCell>
                    <TableCell>
                      <Box className="relative w-full">
                        <LinearProgress
                          variant="determinate"
                          value={normalizePercentage(renderPercen(e))}
                          sx={{
                            height: 20,
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                renderPercen(e) > 80
                                  ? '#f44336' // Always Red if > 80
                                  : renderPercen(e) < 50
                                  ? '#4caf50' // Green
                                  : '#ffb300', // Yellow
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          className="absolute inset-0 flex items-center justify-center font-bold"
                        >
                          {renderPercen(e)?.toFixed(2)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {renderCostApprove(e)
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </TableCell>
                    <TableCell>
                      {renderTotal(e)
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="edit"
                        size="small"
                        onClick={() => handleEditBudget(e)}
                      >
                        <ModeEditIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={() => handleDeleteBudget(e)}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
