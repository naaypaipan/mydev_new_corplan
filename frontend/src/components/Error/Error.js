import React from 'react';
import { Button } from '@mui/material';
import { useHistory } from 'react-router';
import PropTypes from 'prop-types';

export default function Error({ message }) {
  const history = useHistory();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 place-content-center min-h-screen">
      <div></div>
      <div className="p-16 bg-white rounded-md">
        <div>การดำเนินการไม่สำเร็จหรือมีบางอย่างที่ผิดปกติเกิดขึ้น </div>
        <div className="text-red-600">{message}</div>
        <div className="flex justify-center mt-2 gap-2">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              window.location.reload();
            }}
          >
            ย้อนกลับ
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              history.push('/');
            }}
          >
            กลับสู่หน้าหลัก
          </Button>
        </div>
      </div>
      <div></div>
    </div>
  );
}

Error.propTypes = {
  message: PropTypes.string,
};

Error.defaultProps = {
  message: '',
};
