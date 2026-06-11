import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
  Paper,
  Grid,
  Stack,
  useTheme,
  alpha,
  InputAdornment, // added
} from '@mui/material';
import {
  QrCodeScanner,
  Person,
  Work,
  AccountBalance,
  Badge,
  Lock,
  Security,
} from '@mui/icons-material';
import PercentIcon from '@mui/icons-material/Percent'; // added
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import HomeIcon from '@mui/icons-material/Home';
import ImageUpload from '../ImageUpload/ImageUpload';

export function EmployeeForm({
  errors,
  roletype,
  employee,
  Controller,
  control,
  addUser,
  setAddUser,
  employeeImage,
  setEmployeeImage,
  department,
  handleOpen,
  qr,
}) {
  const theme = useTheme();

  const renderSectionHeader = (icon, title) => (
    <Box sx={{ width: '100%', mb: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" ml={1} fontWeight="500" color="primary.main">
          {title}
        </Typography>
      </Box>
      <Divider />
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* ส่วนหัวและการตั้งค่าผู้ใช้ */}
      {addUser != null && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <FormControlLabel
            value="end"
            defaultValue={addUser}
            control={<Checkbox color="primary" />}
            label={
              <Typography variant="subtitle2" fontWeight={500}>
                Create employee with user account
              </Typography>
            }
            labelPlacement="end"
            name="addUser"
            onChange={() => {
              setAddUser(!addUser);
            }}
          />

          {addUser === true && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Lock fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={500}>
                      User Account Information
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={'username'}
                    control={control}
                    defaultValue={employee ? employee.username : ''}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Username"
                        fullWidth
                        size={'small'}
                        required
                        error={!!errors.username}
                        helperText={errors.username && 'Please enter username'}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name={'password'}
                    control={control}
                    defaultValue={employee ? employee.password : ''}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        fullWidth
                        size={'small'}
                        required
                        error={!!errors.password}
                        helperText={errors.password && 'Please enter password'}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name={'confirmPassword'}
                    control={control}
                    defaultValue={employee ? employee.password : ''}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        size={'small'}
                        required
                        error={!!errors.password}
                        helperText={errors.password && 'Please enter password'}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      )}

      {/* ข้อมูลส่วนตัว */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Person fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            Personal Information
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'firstname'}
              control={control}
              defaultValue={employee ? employee.firstname : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  size={'small'}
                  required
                  error={!!errors.firstname}
                  helperText={errors.firstname && 'Please enter first name'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'lastname'}
              control={control}
              defaultValue={employee ? employee.lastname : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  size={'small'}
                  required
                  error={!!errors.lastname}
                  helperText={errors.lastname && 'Please enter last name'}
                />
              )}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <Controller
              name={'firstname_th'}
              control={control}
              defaultValue={employee ? employee.firstname_th : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ชื่อ (ภาษาไทย)"
                  fullWidth
                  size={'small'}
                  error={!!errors.firstname_th}
                  helperText={errors.firstname_th && 'กรุณาใส่ข้อมูล'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'lastname_th'}
              control={control}
              defaultValue={employee ? employee.lastname_th : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="นามสกุล (ภาษาไทย)"
                  fullWidth
                  size={'small'}
                  error={!!errors.lastname_th}
                  helperText={errors.lastname_th && 'กรุณาใส่ข้อมูล'}
                />
              )}
            />
          </Grid> */}

          <Grid item xs={12} sm={6}>
            <Controller
              name={'phone_number'}
              control={control}
              defaultValue={employee ? employee.phone_number : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  fullWidth
                  size={'small'}
                  error={!!errors.phone_number}
                  helperText={
                    errors.phone_number && 'Please enter phone number'
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'tax_id'}
              control={control}
              defaultValue={employee ? employee?.tax_id : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="National ID Number"
                  fullWidth
                  defaultValue={employee ? employee?.tax_id : ''}
                  size={'small'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {employee?.image && (
                  <Box sx={{ mb: 2, maxWidth: '250px' }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}
                    >
                      Current Photo
                    </Typography>
                    <img
                      src={employee?.image?.url}
                      alt="Employee"
                      style={{
                        maxHeight: '180px',
                        maxWidth: '100%',
                        borderRadius: '4px',
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ flexGrow: 1 }}>
                  <ImageUpload
                    preview_size="250"
                    maxNumber={1}
                    images={employeeImage}
                    setImages={setEmployeeImage}
                    title={employee?.rows ? 'Upload Photo' : 'Edit Photo'}
                  />
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {renderSectionHeader(
              <HomeIcon color="primary" />,
              'Address Information',
            )}
          </Grid>

          {/* Address Fields */}
          <Grid item xs={12} md={6}>
            <Controller
              name={'address.house_number'}
              control={control}
              defaultValue={employee ? employee?.address?.house_number : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Building/House Number"
                  fullWidth
                  size="small"
                  error={!!errors?.address?.house_number}
                  helperText={
                    errors?.address?.house_number && 'Please enter address'
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.village_number'}
              control={control}
              defaultValue={employee ? employee?.address?.village_number : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Village/Community"
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.road'}
              control={control}
              defaultValue={employee ? employee?.address?.road : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Road/Street"
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.subdistrict'}
              control={control}
              defaultValue={employee ? employee?.address?.subdistrict : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Subdistrict"
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.district'}
              control={control}
              defaultValue={employee ? employee?.address?.district : ''}
              render={({ field }) => (
                <TextField {...field} label="District" fullWidth size="small" />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.province'}
              control={control}
              defaultValue={employee ? employee?.address?.province : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Province/State"
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.postcode'}
              control={control}
              defaultValue={employee ? employee?.address?.postcode : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Postal Code"
                  fullWidth
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name={'address.country'}
              control={control}
              defaultValue={employee ? employee?.address?.country : 'Thailand'}
              render={({ field }) => (
                <TextField {...field} label="Country" fullWidth size="small" />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ข้อมูลธนาคาร */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AccountBalance fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            Bank Information
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'bank_account.number'}
              control={control}
              defaultValue={employee ? employee?.bank_account?.number : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bank Account Number"
                  fullWidth
                  size={'small'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'bank_account.account_name'}
              control={control}
              defaultValue={
                employee ? employee?.bank_account?.account_name : ''
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Account Name"
                  fullWidth
                  size={'small'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'bank_account.bank_name'}
              control={control}
              defaultValue={employee ? employee?.bank_account?.bank_name : ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Bank Name"
                  fullWidth
                  size={'small'}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ข้อมูลการทำงาน */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Work fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            Employment Information
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'type'}
              control={control}
              defaultValue={employee ? employee?.type : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl
                  required
                  fullWidth
                  error={errors.type}
                  size="small"
                >
                  <InputLabel id="department-label">Employee Type</InputLabel>
                  <Select
                    {...field}
                    labelId="department-label"
                    label="Employee Type"
                  >
                    <MenuItem value="FULLTIME">
                      <div>Full-time Employee</div>
                    </MenuItem>
                    <MenuItem value="DAILY">
                      <div>Daily Worker</div>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'department'}
              control={control}
              defaultValue={employee ? employee?.department?._id : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl
                  required
                  fullWidth
                  error={errors.department}
                  size="small"
                >
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    {...field}
                    labelId="department-label"
                    label="Department"
                  >
                    {_.size(department?.rows) ? (
                      _.map(department.rows, (row) => (
                        <MenuItem key={row._id} value={row._id}>
                          {row.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        <em>No data available</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'role'}
              control={control}
              defaultValue={employee ? employee?.role?.id : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl
                  required
                  fullWidth
                  error={errors.role}
                  size="small"
                >
                  <InputLabel id="role-label">Position</InputLabel>
                  <Select {...field} labelId="role-label" label="Position">
                    {_.size(roletype?.rows) ? (
                      _.map(roletype.rows, (row) => (
                        <MenuItem key={row.id} value={row.id}>
                          {row.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        <em>No data available</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name={'check_key'}
              control={control}
              defaultValue={employee ? employee?.check_key : qr}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="QR Code"
                  fullWidth
                  defaultValue={employee ? employee?.check_key : qr}
                  size={'small'}
                  InputProps={{
                    endAdornment: handleOpen && (
                      <IconButton edge="end" onClick={handleOpen} size="small">
                        <QrCodeScanner fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name={'team'}
              control={control}
              defaultValue={employee ? employee.team : ''}
              render={({ field }) => (
                <TextField {...field} label="Team" fullWidth size={'small'} />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="timestamp_use_location"
              control={control}
              defaultValue={employee?.timestamp_use_location ?? false}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="checkin-mode-label">รูปแบบลงเวลา</InputLabel>
                  <Select
                    {...field}
                    labelId="checkin-mode-label"
                    label="รูปแบบลงเวลา"
                    value={field.value === true ? 'location' : 'manual'}
                    onChange={(e) =>
                      field.onChange(e.target.value === 'location')
                    }
                  >
                    <MenuItem value="manual">
                      เลือกโครงการเอง (แบบเก่า)
                    </MenuItem>
                    <MenuItem value="location">
                      อ้างอิงโลเคชั่น (GPS ภายใน 1 กม.)
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              อ้างอิงโลเคชั่น = ระบบใช้ GPS ตรวจตำแหน่ง โครงการคำนวณอัตโนมัติ
              | เลือกโครงการเอง = เลือกจากดรอปดาวน์ ไม่ตรวจตำแหน่ง
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Salary Information
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name={'salary.month'}
              control={control}
              defaultValue={employee ? employee?.salary?.month : 0}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Salary"
                  fullWidth
                  size={'small'}
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name={'salary_extra.month'}
              control={control}
              defaultValue={employee ? employee?.salary_extra?.month : 0}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Special Compensation (Monthly)"
                  fullWidth
                  size={'small'}
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name={'salary_extra.day'}
              control={control}
              defaultValue={employee ? employee?.salary_extra?.day : 0}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Special Compensation (Daily)"
                  fullWidth
                  size={'small'}
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              )}
            />
          </Grid>

          {/* SSO / Social security settings */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="sso_tax.status"
              control={control}
              defaultValue={employee?.sso_tax?.status || false}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      ขึ้นประกันสังคม
                    </Typography>
                  }
                />
              )}
            />

           
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="tax.status"
              control={control}
              defaultValue={employee?.tax?.status || false}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={500}>
                      หักภาษี ณ ที่จ่าย
                    </Typography>
                  }
                />
              )}
            />

            <div className="py-2">
              <Controller
                name="tax.number"
                control={control}
                defaultValue={
                  typeof employee?.tax?.number === 'number'
                    ? employee.tax.number
                    : 3
                }
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="อัตรา SSO"
                    fullWidth
                    size="small"
                    type="number"
                    InputProps={{
                      inputProps: { min: 0, max: 100, step: 0.01 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <PercentIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="กรอกเป็นเปอร์เซ็น เช่น 3 = 3%"
                  />
                )}
              />
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* ย้ายส่วนการใช้งานมาที่นี่ - หลังจากข้อมูลการทำงาน */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Security fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={500}>
            System Access
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Controller
                name="permissions.admin"
                control={control}
                defaultValue={employee?.permissions?.admin || false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Administrator Access
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Access to all system settings
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.secondary.main, 0.02),
              }}
            >
              <Controller
                name="permissions.finance_approve"
                control={control}
                defaultValue={employee?.permissions?.finance_approve || false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Finance Access
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Approve disbursements and view financial data
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.02),
              }}
            >
              <Controller
                name="permissions.hr_management"
                control={control}
                defaultValue={employee?.permissions?.hr_management || false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          HR Department Access
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Approve leave requests, work schedule, and edit
                          employee data
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            </Paper>
          </Grid>

          {/* <Grid item xs={12} sm={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.02),
                }}
              >
                <Controller
                  name="permissions.report"
                  control={control}
                  defaultValue={employee?.permissions?.report || false}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="info"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            รายงาน
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ดูรายงานและวิเคราะห์ข้อมูลทั้งหมด
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              </Paper>
            </Grid> */}
        </Grid>
      </Paper>
    </Box>
  );
}

EmployeeForm.propTypes = {
  roletype: PropTypes.object,
  errors: PropTypes.shape({
    username: PropTypes.object,
    password: PropTypes.object,
    firstname: PropTypes.object,
    lastname: PropTypes.object,
    phone_number: PropTypes.object,
    department: PropTypes.object,
    role: PropTypes.object,
  }),
  employeeImage: PropTypes.arrayOf(PropTypes.object),
  setEmployeeImage: PropTypes.func.isRequired,
  addUser: PropTypes.bool,
  setAddUser: PropTypes.func,
  employee: PropTypes.object,
  Controller: PropTypes.func,
  control: PropTypes.object,
  handleOpen: PropTypes.func,
  qr: PropTypes.string,
};

EmployeeForm.defaultProps = {
  employee: null,
  addUser: null,
};

export default EmployeeForm;
