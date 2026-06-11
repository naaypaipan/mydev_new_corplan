import { Box, Chip } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import { Clock, DollarSign } from 'react-feather';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

export default function ManpowerTimestamp() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const project = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(actions.projectGet(id));
  }, []);
  return (
    <div>
      <div>
        <div className="flex flex-col justify-center h-screen bg-gray-100">
          <div className="flex flex-col justify-center items-center">
            <div className=" text-2xl lg:text-4xl font-bold text-theme-600  ">
              ระบบลงเวลาเข้า-ออกงาน
            </div>
            <div className="border-b-2 border-theme-600 w-1/2 my-2 "> </div>
            <div className="text-xl text-center">
              {' '}
              <b className="text-theme-600">โครงการ :</b> {project?.name}{' '}
            </div>
          </div>
          <div className=" w-full lg:w-1/2 mx-auto">
            {project?.time_tracking_link_enabled !== false ? (
              <Box sx={{ minWidth: 200 }}>
                <div className="flex justify-center gap-5 p-6">
                  <div className="w-1/2">
                    <Link to={`/manpower/timestamp/checkin/${id}`}>
                      <div className="bg-green-600 shadow rounded text-center p-5 transition-transform transform hover:scale-105">
                        <div className="flex justify-center">
                          <Clock size={50} color="white" />
                        </div>
                        <p className="text-white mt-4">เข้างาน</p>
                      </div>
                    </Link>
                  </div>
                  <div className="w-1/2">
                    <Link to={`/manpower/timestamp/checkout/${id}`}>
                      <div className="bg-red-600 shadow rounded text-center p-5 transition-transform transform hover:scale-105">
                        <div className="flex justify-center">
                          <Clock size={50} color="white" />
                        </div>
                        <p className="text-white mt-4">ออกงาน</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </Box>
            ) : (
              <div className="text-center text-2xl py-4  text-red-600">
                <Chip
                  label="โครงการนี้ปิดการลงเวลาผ่านลิงก์ (ลงได้เฉพาะหน้า Profile)"
                  size="large"
                  color="error"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
