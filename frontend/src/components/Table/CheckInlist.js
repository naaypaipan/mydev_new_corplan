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
} from '@mui/material';
import PropTypes from 'prop-types';

import dayjs from 'dayjs';
import React from 'react';
import _ from 'lodash';

import { useHistory } from 'react-router';

export default function CheckInlist({
  timestamp,
  page,
  size,
  setPage,
  setSize,
  disabledButton,
}) {
  const history = useHistory();
  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    // console.log("page ", page);
  };
  // const late = _?.filter(checkIn?.arr, (e) => e?.late_status === true);
  // const normal = _?.filter(checkIn?.arr, (e) => e?.late_status === false);

  return (
    <div>
      <Paper>
        <TableContainer component={Paper}>
          <Table aria-label="simple table" size="small">
            <colgroup>
              <col width="30%" />
              <col width="30%" />
              <col width="20%" />
            </colgroup>
            <TableHead>
              <TableRow className={'bg-gray-600 text-white'}>
                <TableCell>
                  <h1 className="font-bold  text-center  text-white ">
                    {' '}
                    Employee
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold  text-center text-white "> Date</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">
                    Check in
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">
                    Check out
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">Count</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white "></h1>
                </TableCell>

                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {timestamp?.rows?.length !== 0 ? (
              <TableBody>
                {timestamp?.rows?.map((e) => (
                  <TableRow key={e?._id}>
                    <TableCell>
                      <h1 className=" text-center ">
                        {e?.employee?.firstname} {e?.employee?.lastname}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">
                        {dayjs(e?.checkIn).format('DD/MM/YYYY')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">
                        {dayjs(e?.checkIn).format('HH:mm')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      {e?.status_checkOut ? (
                        <div>
                          <h1 className="text-center ">
                            {dayjs(e?.checkOut).format('HH:mm') ||
                              'ยังไม่เช็คชื่อ'}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="text-theme-600">waiting</h1>
                      )}
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">{e?.amount || 0}</h1>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={3}>
                    No items
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 30, 100]}
          component="div"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          count={timestamp?.total || 0}
          rowsPerPage={size}
          page={page - 1}
        />
      </Paper>
    </div>
  );
}
CheckInlist.propTypes = {
  checkIn: PropTypes.object,

  page: PropTypes.object,
  size: PropTypes.object,

  setPage: PropTypes.object,
  setSize: PropTypes.object,
  disabledButton: PropTypes.bool,
};
CheckInlist.defaultProps = {
  checkIn: PropTypes.object,
  page: '7',
  size: null,
  setPage: null,
  setSize: null,
  disabledButton: false,
};
