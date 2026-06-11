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

export default function HrcheckinListReportPersonal({ timestamp }) {
  return (
    <div>
      <Paper>
        <TableContainer component={Paper}>
          <Table aria-label="simple table" size="small">
            <TableHead>
              <TableRow className={'bg-gray-600 text-white'}>
                <TableCell>
                  <h1 className="font-bold  text-center  text-white "> no.</h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold  text-center text-white ">
                    {' '}
                    Project
                  </h1>
                </TableCell>
                <TableCell>
                  <h1 className="font-bold text-center text-white ">Date</h1>
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

                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {!_.isEmpty(timestamp?.timesTampData) ? (
              <TableBody>
                {_.map(timestamp?.timesTampData, (e, index) => (
                  <TableRow>
                    <TableCell>
                      <h1 className=" text-center ">{index + 1}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className=" text-center ">
                        {e?.projectDetails?.name}
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
                            {dayjs(e?.checkOut).format('HH:mm')}
                          </h1>
                        </div>
                      ) : (
                        <h1 className="text-theme-600">waiting</h1>
                      )}
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">{e?.normal_time || '-'}</h1>
                    </TableCell>
                    <TableCell>
                      <h1 className="text-center ">{e?.ot_show || '-'}</h1>
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
      </Paper>
    </div>
  );
}
HrcheckinListReportPersonal.propTypes = {
  checkIn: PropTypes.object,

  page: PropTypes.object,
  size: PropTypes.object,

  setPage: PropTypes.object,
  setSize: PropTypes.object,
  disabledButton: PropTypes.bool,
};
HrcheckinListReportPersonal.defaultProps = {
  checkIn: PropTypes.object,
  page: '7',
  size: null,
  setPage: null,
  setSize: null,
  disabledButton: false,
};
