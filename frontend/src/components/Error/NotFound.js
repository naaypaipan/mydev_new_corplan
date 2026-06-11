import React from 'react';
import { Button } from '@mui/material';
import { useHistory } from 'react-router';

export default function NotFound() {
  const history = useHistory();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 place-content-center min-h-screen">
      <div></div>
      <div className="p-16 bg-white rounded-md">
        <div className="text-center">ขออภัย ไม่พบหน้าที่คุณต้องการ</div>
        <div className="flex justify-center mt-2 gap-2">
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
