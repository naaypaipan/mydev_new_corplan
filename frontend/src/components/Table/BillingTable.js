import {
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';

export default function BillingTable({
  billing,
  handleOnclickDetail,
  page,
  setPage,
  size,
  setSize,
  rederDetail,
}) {
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    // console.log("page ", page);
  };
  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };
  return (
    <div>
      <Paper>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow className={'bg-gray-600'}>
                <TableCell>
                  {' '}
                  <h1 className=" text-white ">No.</h1>
                </TableCell>
                <TableCell>
                  <h1 className=" text-white  ">Invoice</h1>
                </TableCell>

                <TableCell>
                  <h1 className="  text-white ">Customer/Project</h1>
                </TableCell>
                <TableCell>
                  <h1 className="  text-white ">Grand Total</h1>
                </TableCell>
                <TableCell>
                  <h1 className="  text-white ">Date</h1>
                </TableCell>
                <TableCell>
                  <h1 className="  text-white ">Due Date</h1>
                </TableCell>
                <TableCell>
                  <h1 className="  text-white ">Confirm Date</h1>
                </TableCell>
                <TableCell>
                  <h1 className=" text-white  ">Tracking Number</h1>
                </TableCell>
                <TableCell>
                  <h1 className=" text-white  ">Status</h1>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.isEmpty(billing?.rows) ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    {' '}
                    <div className="flex justify-center">No item</div>{' '}
                  </TableCell>
                </TableRow>
              ) : (
                _?.map(billing?.rows, (e, index) => (
                  <TableRow key={e.id} onClick={() => rederDetail(e?.id)}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{e?.invoice_number}</TableCell>

                    <TableCell>
                      <div className="font-bold">{e?.customer?.name}</div>
                      <div>{e?.project_id?.name}</div>
                    </TableCell>
                    <TableCell>
                      {e?.price
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                    </TableCell>
                    <TableCell>{dayjs(e?.date).format('DD/MM/YYYY')}</TableCell>

                    <TableCell>
                      {dayjs(e?.date_due).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      {' '}
                      {dayjs(e?.date_confirm).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{e?.track_number}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 30, 40, 50, 100]}
          component="div"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          count={billing?.total || 0}
          rowsPerPage={size}
          page={page - 1}
        />
      </Paper>
    </div>
  );
}
