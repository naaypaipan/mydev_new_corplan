import React from 'react';
import { Button } from '@mui/material';
import { useHistory } from 'react-router';

export default function BackButton() {
  const history = useHistory();
  const handlePushBack = () => {
    history.goBack();
  };
  return (
    <Button variant="outlined" onClick={handlePushBack}>
      กลับ
    </Button>
  );
}
