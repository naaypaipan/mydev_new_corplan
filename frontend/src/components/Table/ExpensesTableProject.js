import React from 'react';

import {
  Table,
  TableHead,
  TableContainer,
  Paper,
  TableCell,
  TableRow,
  TableBody,
  Button,
  TablePagination,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import { PAIDTYPE_STATUS } from 'utils/constants';
import { PAID_STATUS } from 'utils/constants';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

export default function ExpensesTableProject({
  expenses,
  page,
  size,
  setPage,
  setSize,
  handleEdit,
  handleDelete,
  filter,
  handleApprove,
  handleSuccess,
}) {
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    // console.log("page ", page);
  };
  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const checkColor = (e) => {
    if (e?.status === 'PENDING')
      return (
        <Chip label={`${PAID_STATUS?.[e?.status]?.description}`} size="small" />
      );
    if (e?.status === 'APPROVE')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description}`}
          color="warning"
          size="small"
        />
      );
    if (e?.status === 'SUCCESS')
      return (
        <Chip
          label={`${PAID_STATUS?.[e?.status]?.description}`}
          color="success"
          size="small"
        />
      );
  };

  return (
    <div>
      <Paper>
        <TableContainer component={Paper}>
          <Table size="small">
            {/* <colgroup>
                <col width="90%" />
                <col width="10%" />
              </colgroup> */}
            <TableHead>
              <TableRow className={'bg-gray-600'}>
                <TableCell>
                  <h1 className="text-white text-center "> No.</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-white text-center ">Date Created</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-white text-center "> Request Date</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-white text-center ">Order</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-white text-center ">Grand Total</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-white text-center ">Status</h1>
                </TableCell>
                <TableCell>
                  <h1 className="text-whitetext-center "> </h1>
                </TableCell>
              </TableRow>
            </TableHead>

            {_.isEmpty(filter) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No items
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filter?.map((e, index) => (
                  <TableRow key={e._id}>
                    <TableCell>
                      <h1 className=" text-center ">{index + 1}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">
                        {dayjs(e?.createdAt).format('DD/MM/YYYY')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">
                        {dayjs(e?.date).format('DD/MM/YYYY')}
                      </h1>
                    </TableCell>

                    <TableCell>
                      <h1 className="">{e?.name}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">
                        {e?.price
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">{checkColor(e)}</h1>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 ">
                        {/* {e?.status === 'APPROVE' ||
                          (e?.status === 'PENDING' && (
                            <Button
                              variant="contained"
                              size="small"
                              disabled={
                                e?.status === 'APPROVE' ||
                                e?.status === 'SUCCESS'
                              }
                              onClick={() => handleApprove(e?.id)}
                            >
                              Approve
                            </Button>
                          ))}
                        {e?.status === 'APPROVE' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            disabled={e?.status != 'APPROVE'}
                            onClick={() => handleSuccess(e?.id)}
                          >
                            success
                          </Button>
                        )} */}
                        <IconButton
                          aria-label="delete"
                          size="small"
                          disabled={
                            e?.status === 'SUCCESS' || e?.status === 'APPROVE'
                          }
                          onClick={() => handleEdit(e._id)}
                        >
                          <ModeEditIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          size="small"
                          disabled={e?.status === 'SUCCESS'}
                          onClick={() => handleDelete(e._id)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30, 100]}
          component="div"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          count={expenses?.total || 0}
          rowsPerPage={size}
          page={page - 1}
        />
      </Paper>
    </div>
  );
}
