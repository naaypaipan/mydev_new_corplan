import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import { Cameraswitch } from '@mui/icons-material';

export default function Cameras({ imgSrc, setImgSrc }) {
  const webcamRef = useRef(null);
  const [mirrored, setMirrored] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };
  const switchCamera = () => {
    if (cameraFacing === 'user') {
      console.log('5555', cameraFacing);

      setCameraFacing('environment');
    } else {
      setCameraFacing('user');
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center">
      {imgSrc ? (
        <img src={imgSrc} alt="webcam" className="mb-4" />
      ) : (
        <div>
          {' '}
          <div className="flex justify-end">
            <IconButton onClick={switchCamera}>
              <Cameraswitch />
            </IconButton>
            <div onClick={switchCamera} className="py-2">
              สลับกล้อง
            </div>
          </div>
          <Webcam
            height={600}
            width={600}
            ref={webcamRef}
            mirrored={mirrored}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            className="mb-4"
            facingMode={cameraFacing}
          />
        </div>
      )}

      <div className="btn-container text-center flex justify-center w-full space-x-2">
        {imgSrc ? (
          <div
            variant="contained"
            onClick={retake}
            className="flex-1 bg-yellow-500 p-2 text-white hover:bg-yellow-600 "
          >
            <ReplayIcon /> Retake photo
          </div>
        ) : (
          <div
            variant="contained"
            onClick={capture}
            className="flex-1 bg-green-500 text-white hover:bg-green-600 p-2"
          >
            <CameraAltIcon /> ถ่ายรูป
          </div>
        )}
      </div>
    </div>
  );
}
