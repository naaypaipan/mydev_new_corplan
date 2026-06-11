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
  Card,
  Avatar,
  Modal,
  Box,
  IconButton,
} from '@mui/material';
import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

import dayjs from 'dayjs';
import React from 'react';
import _ from 'lodash';

import { useHistory } from 'react-router';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function HrcheckinListReportDaily({
  timestamp,
  page,
  size,
  setPage,
  setSize,
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
            <TableHead>
              <TableRow className={'bg-gray-600 text-white'}>
                <TableCell>
                  <h1 className="font-bold  text-center  text-white "> No.</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold  text-center  text-white "> name</h1>
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
                  <h1 className="font-bold text-center text-white ">normal</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">ot</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">
                    labour cost
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">
                    allowance
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">Total</h1>
                </TableCell>
              </TableRow>
            </TableHead>
            {timestamp?.rows?.length !== 0 ? (
              <TableBody>
                {timestamp?.rows?.map((e, index) => (
                  <TableRow key={e?._id}>
                    <TableCell>
                      <h1 className=" text-center ">
                        {(page - 1) * size + index + 1}
                      </h1>
                    </TableCell>
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
                      <div>
                        <h1 className="text-center ">
                          {dayjs(e?.checkOut).format('HH:mm') || '-'}
                        </h1>
                      </div>
                    </TableCell>

                    <TableCell>
                      <h1 className="text-center ">{e?.normal_time}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">{e?.ot_show}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">
                        {e?.priceLabor
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">
                        {e?.salary_extra?.day
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">
                        {e?.totalPrice
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                      </h1>
                    </TableCell>
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
          rowsPerPageOptions={[10, 20, 30, 50, 100]}
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
