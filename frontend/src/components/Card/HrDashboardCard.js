import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';

export default function HrDashboardCard({ timestamp }) {
  return (
    <div>
      <div className="py-1">
        <Card>
          <div className="p-2">
            <div>
              <div>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow className={'bg-theme-600 text-white'}>
                      <TableCell>
                        <div className="text-white text-center ">No.</div>{' '}
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-center ">
                          Project Id
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-center ">
                          Project Name
                        </div>
                      </TableCell>
                      {/* <TableCell>
                        <div className="text-white text-center ">
                          Project Labor Cost
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="text-white text-center ">
                          Estimated labor Cost
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-center ">
                          Estimated OT Cost
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-center ">
                          Estimated total Cost
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {_?.map(timestamp?.rows, (data, index) => (
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{data?.project_number}</TableCell>
                        <TableCell>{data?.project_name || '-'}</TableCell>
                        {/* <TableCell>
                          {data?.labor_cost
                            ?.toFixed(2)
                            ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                        </TableCell> */}
                        <TableCell>
                          {data?.total_salary
                            ?.toFixed(2)
                            ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                        </TableCell>
                        <TableCell>
                          {data?.total_ot
                            ?.toFixed(2)
                            ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                        </TableCell>
                        <TableCell>
                          {(data?.total_ot + data?.total_salary)
                            ?.toFixed(2)
                            ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
