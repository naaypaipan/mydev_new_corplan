import { Card, Button, Chip, Autocomplete, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningIcon from '@mui/icons-material/Warning';;
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
// import ImageUpload from '../../components/ImageUpload/ImageUpload';
import Cameras from '../Camera/Cameras';
export default function TimeStampCheckOutCard({
  me,
  date,
  imgSrc,
  setImgSrc,
  setNoteCheckin,
  project,
  projectSelect,
  setProjectSelect,
  onSubmit,
}) {
  const [ctime, setTime] = useState(new Date().toLocaleTimeString());
  const [note, setNote] = useState();
  const UpdateTime = () => {
    const time = new Date().toLocaleTimeString();
    setTime(time);
  };
  setInterval(UpdateTime);

  // const handleCheckLevel = (data, index) => {import LogoutIcon from '@mui/icons-material/Logout';
  //   const each = _.find(project.rows, { _id: data?._id });
  //   // setValue(`project`, each?._id);
  //   setProjectSelect(each);
  // };
  const handleCheckLevel = (data, index) => {
    const each = _.find(project.rows, { _id: data?._id });
    // setValue(`project`, each?._id);
    setSelectedProject(each);
    setProjectSelect(each);
  };

  const cancel = () => {
    setImgSrc("");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-5 justify-center">
        <div className=" grid gap-5 justify-center ">
          <div className="flex flex-col flex-1 max-w-full max-h-full sm:max-w-xs shadow-md">
            <div className="bg-white p-5 relative flex-grow shadow-md hidden md:block">
              <div className="flex flex-wrap pt-2">
                <div className="w-full flex justify-center">
                  <Avatar sx={{ width: 150, height: 150 }} />
                </div>
                <div className="w-full text-center">
                  <div className="text-2xl font-semibold text-blue-800 py-2 mt-2">
                    {/* User Name */}
                  </div>
                  <div className="py-2">
                    {me?.userData?.firstname} {me?.userData?.lastname || ''}
                  </div>
                </div>
              </div>
            </div>
            {imgSrc && (
              <div className="bg-theme-400 p-5 shadow-md relative mt-3 hidden sm:block responsive-hide">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">บันทึกการออกงาน</h2>
                  <div className="flex gap-2 items-center mb-2 border p-1">
                    <div className="p-2 bg-white ">
                      <WarningIcon className="text-yellow-500" />
                    </div>
                    <h3 className="text-sm ">หากตรวจพบการทุจริต การเข้างานครั้งนี้จะถูกยกเลิกทันที</h3>
                  </div>
                </div>
                <div className="flex gap-3 text-white justify-center">
                  <div
                    variant="contained"
                    onClick={cancel}
                    className="bg-gray-500 p-2 w-full text-center hover:bg-gray-600 shadow-md transition-all transform hover:scale-105"
                  >
                    ยกเลิก
                  </div>
                  <div
                    variant="contained"
                    onClick={onSubmit}
                    className="bg-green-500 p-2 w-full text-center hover:bg-green-600 shadow-md transition-all transform hover:scale-105"
                  >
                    บันทึก
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white w-full sm:max-w-xl shadow-md p-2 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row w-full items-stretch ">
            <div className="flex bg-red-500 gap-2 text-white text-center p-3 border shadow-md w-full sm:w-1/3 justify-center items-center">
              <div className="bg-white p-1 rounded-lg shadow-md text-red-500" ><LogoutIcon /></div>
              <p className="text-white">Check-Out</p>

            </div>
            <div className="flex flex-col sm:flex-row text-gray-700 gap-3 sm:gap-5 p-3 border shadow-md w-full sm:w-2/3 justify-between">
              <div className="flex gap-3 items-center justify-between w-full sm:w-auto">
                <div className="font-bold">In Date :</div>
                <div>{dayjs(date).format('DD/MM/YY')}</div>
              </div>
              <div className="flex gap-3 items-center justify-between w-full sm:w-auto">
                <div className="font-bold">On Time :</div>
                <div>{ctime}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center border">
            <div>
              <Cameras imgSrc={imgSrc} setImgSrc={setImgSrc} />
            </div>
          </div>
          {imgSrc && (
            <div className="bg-theme-400 p-5 shadow-md relative mt-3 responsive-show block sm:hidden">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">บันทึกการออกงาน</h2>
                <div className="flex gap-2 items-center mb-2 border p-1">
                  <div className="p-2 bg-white ">
                    <WarningIcon className="text-yellow-500" />
                  </div>
                  <h3 className="text-sm ">หากตรวจพบการทุจริต การเข้างานครั้งนี้จะถูกยกเลิกทันที</h3>
                </div>
              </div>
              <div className="flex gap-3 text-white justify-center">
                <div
                  variant="contained"
                  onClick={cancel}
                  className="bg-gray-500 p-2 w-full text-center hover:bg-gray-600 shadow-md transition-all transform hover:scale-105"
                >
                  ยกเลิก
                </div>
                <div
                  variant="contained"
                  onClick={onSubmit}
                  className="bg-green-500 p-2 w-full text-center hover:bg-green-600 shadow-md transition-all transform hover:scale-105"
                >
                  บันทึก
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
