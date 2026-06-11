/* eslint-disable no-alert */
import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  Container,
  alpha,
  useTheme,
  Stack,
  Fade,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { PassportAuth } from '../../contexts/AuthContext';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Login() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const { handleSignin } = useContext(PassportAuth);
  const history = useHistory();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data, e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await handleSignin(data.username, data.password);
      history.push('/');
    } catch (error) {
      window.alert('ไม่สามารถเข้าสู่ระบบ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Circles */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: alpha(theme.palette.primary.light, 0.2),
        filter: 'blur(60px)',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: alpha(theme.palette.secondary.main, 0.2),
        filter: 'blur(60px)',
      }} />

      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              display: 'flex',
              width: '100%',
              maxWidth: 900,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Left Side - Brand / Image */}
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 6,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                position: 'relative',
              }}
            >
              <Box sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                <LoginIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              
              <Typography variant="h3" fontWeight="700" gutterBottom>
                CorePlan
              </Typography>
              <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                ERP SYSTEM
              </Typography>
              
              <Box sx={{ mt: 8, opacity: 0.6 }}>
                 <Typography variant="body2">Managing your business</Typography>
                 <Typography variant="body2">has never been easier.</Typography>
              </Box>
            </Box>

            {/* Right Side - Form */}
            <Box
              sx={{
                flex: 1.2,
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please enter your details to sign in
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    autoComplete="username"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    {...register('username', { required: true })}
                    error={!!errors.username}
                    helperText={errors.username && 'Please enter your username'}
                  />

                  <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePassword} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    {...register('password', { required: true })}
                    error={!!errors.password}
                    helperText={errors.password && 'Please enter your password'}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    type="submit"
                    disabled={isLoading}
                    endIcon={!isLoading && <ArrowForwardIcon />}
                    size="large"
                    sx={{
                      fontSize: '1.1rem',
                      py: 1.5,
                      mt: 2
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?
                </Typography>
                <Button
                  component={Link}
                  to="/auth/login/register"
                  variant="text"
                  startIcon={<HowToRegOutlinedIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Create an account
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
