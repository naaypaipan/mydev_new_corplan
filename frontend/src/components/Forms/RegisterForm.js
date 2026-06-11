import React, { useState } from 'react';
import {
  TextField,
  Grid,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Phone,
  Lock,
  AccountCircle,
  Home as HomeIcon,
  AccountBalance,
  Badge as BadgeIcon,
} from '@mui/icons-material';

export function RegisterForm({ errors, employee, Controller, control }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* ข้อมูลบัญชี */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountCircle sx={{ color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ข้อมูลบัญชี
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name={'username'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="ชื่อผู้ใช้"
                fullWidth
                size="small"
                required
                error={!!errors.username}
                helperText={errors.username && 'กรุณาใส่ชื่อผู้ใช้'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'password'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                required
                error={!!errors.password}
                helperText={errors.password && 'กรุณาใส่รหัสผ่าน'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'confirmPassword'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="ยืนยันรหัสผ่าน"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword && 'กรุณายืนยันรหัสผ่าน'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* ข้อมูลส่วนตัว */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Person sx={{ color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ข้อมูลส่วนตัว
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'firstname'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="ชื่อ"
                fullWidth
                size="small"
                required
                error={!!errors.firstname}
                helperText={errors.firstname && 'กรุณาใส่ชื่อ'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'lastname'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="นามสกุล"
                fullWidth
                size="small"
                required
                error={!!errors.lastname}
                helperText={errors.lastname && 'กรุณาใส่นามสกุล'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'phone_number'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="เบอร์โทรศัพท์"
                fullWidth
                size="small"
                required
                error={!!errors.phone_number}
                helperText={errors.phone_number && 'กรุณาใส่เบอร์โทรศัพท์'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'tax_id'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="เลขประจำตัวประชาชน"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* ข้อมูลที่อยู่ */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <HomeIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ข้อมูลที่อยู่
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.house_number'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="บ้านเลขที่ / อาคาร"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.village_number'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="หมู่ / หมู่บ้าน"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.road'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ถนน / ซอย"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.subdistrict'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ตำบล / แขวง"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.district'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="อำเภอ / เขต"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.province'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="จังหวัด"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.postcode'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="รหัสไปรษณีย์"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.country'}
            control={control}
            defaultValue={'ประเทศไทย'}
            render={({ field }) => (
              <TextField
                {...field}
                label="ประเทศ"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        {/* ข้อมูลธนาคาร */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <AccountBalance sx={{ color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ข้อมูลธนาคาร
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'bank_account.number'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="เลขบัญชีธนาคาร"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'bank_account.account_name'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ชื่อบัญชี"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name={'bank_account.bank_name'}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="ชื่อธนาคาร"
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default RegisterForm;
