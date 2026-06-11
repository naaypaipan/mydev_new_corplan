import { Card, Button, Chip, Autocomplete } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
// import ImageUpload from '../../components/ImageUpload/ImageUpload';
import Cameras from '../Camera/Cameras';
export default function TimeStampCheckOutType2Card({
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

  const handleCheckLevel = (data, index) => {
    const each = _.find(project.rows, { _id: data?._id });
    // setValue(`project`, each?._id);
    setProjectSelect(each);
  };

  return (
    <div>
      <Card>
        <div className="mt-2 p-4  overflow-auto ">
          <div className="flex gap-2 ">
            <div>
              <Chip label="Check-Out" color="error" />
            </div>
            <div className="py-1">
              <h1 className=" text-xl "></h1>
            </div>
          </div>
          <div className="w-full flex justify-center   px-1 py-2 ">
            <h1 className=" text-xl  ">
              Name : {me?.userData?.firstname} {me?.userData?.lastname || ''}
            </h1>
          </div>
          <div className="w-full flex justify-center px-1 py-2">
            <div>
              <div className=" text-xl ">
                {dayjs(date).format('DD/MM/YY ')} : {ctime}
              </div>
            </div>
          </div>

          <div className="px-4">
            <h1 className="text-red-700   mx-8">
              หากตรวจพบการทุจริต การเข้างานครั้งนี้จะถูกยกเลิกทันที
            </h1>
          </div>

          <div className=" flex justify-center ">
            <div className="px-4 py-4 w-1/2  ">
              <Button variant="contained" onClick={() => onSubmit()} fullWidth>
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  /* <div className="w-full   px-1 py-2">
              <h1 className="">
                ตำแหน่ง: latitude {coords?.latitude},{coords?.longitude}{' '}
              </h1>
            </div> */
}
