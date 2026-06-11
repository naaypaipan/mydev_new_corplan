import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import * as actions from '../../redux/actions';
import { EmployeeForm } from '../../components/Forms';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';

import { useForm, Controller } from 'react-hook-form';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import {
  Button,
  Card,
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import RegisterForm from '../../components/Forms/RegisterForm';

export default function Register() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log(data);

      if (data.password === data.confirmPassword) {
        await dispatch(actions.userRegister(data));
        reset();
        setAlertMessage('ลงทะเบียนสำเร็จ!');
        setAlertSeverity('success');
        setShowAlert(true);
        setTimeout(() => {
          history.goBack();
        }, 2000);
      } else {
        setAlertMessage('กรุณาใส่รหัสผ่านให้ตรงกัน');
        setAlertSeverity('error');
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setAlertSeverity('error');
      setShowAlert(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
            }}
          >
            กรุณากรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่
          </Typography>
        </Box>

        <Paper
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <RegisterForm
                control={control}
                Controller={Controller}
                errors={errors}
              />

              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => history.goBack()}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    background:
                      'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background:
                        'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                    },
                  }}
                >
                  บันทึกข้อมูล
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>

        <Snackbar
          open={showAlert}
          autoHideDuration={4000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowAlert(false)}
            severity={alertSeverity}
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
