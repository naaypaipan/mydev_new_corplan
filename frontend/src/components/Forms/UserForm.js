import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export function UserForm({
  errors,
  user,
  roletype,
  Controller,
  control,
  department,
}) {
  return (
    <div className="flex flex-row flex-wrap">
      <div className="w-full px-1 py-1">
        <Controller
          name={'username'}
          control={control}
          defaultValue={user ? user.username : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="ชื่อผู้ใช้"
              fullWidth
              size={'small'}
              required
              helperText={errors.username && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-1/2 px-1 py-1">
        <Controller
          name={'password'}
          control={control}
          defaultValue={user ? user.password : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="รหัสผ่าน"
              type="password"
              fullWidth
              size={'small'}
              required
              helperText={errors.password && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-1/2 px-1 py-1">
        <Controller
          name={'confirmPassword'}
          control={control}
          defaultValue={user ? user.password : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="ยืนยันรหัสผ่าน"
              type="password"
              fullWidth
              size={'small'}
              required
              helperText={errors.password && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      {user && user?.rows ? (
        <>
          <div className="w-1/2 px-1 py-1">
            <Controller
              name={'firstname'}
              control={control}
              defaultValue={user ? user.firstname : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ชื่อ"
                  fullWidth
                  size={'small'}
                  required
                  helperText={errors.firstname && 'กรุณาใส่ข้อมูล'}
                />
              )}
            />
          </div>
          <div className="w-1/2 px-1 py-1">
            <Controller
              name={'lastname'}
              control={control}
              defaultValue={user ? user.lastname : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="นามสกุล"
                  fullWidth
                  size={'small'}
                  required
                  helperText={errors.lastname && 'กรุณาใส่ข้อมูล'}
                />
              )}
            />
          </div>
          <div className="w-full px-1 py-2">
            <Controller
              name={'department'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl required sx={{ minWidth: 120 }} fullWidth={true}>
                  <InputLabel id="type" size={'small'}>
                    แผนก
                  </InputLabel>
                  <Select {...field} label="แผนก" size={'small'} fullWidth>
                    {_.size(department?.rows) ? (
                      _.map(department.rows, (row) => (
                        <MenuItem key={row._id} value={row._id}>
                          {row.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem>
                        <MenuItem disabled value="">
                          <em>ไม่มีข้อมูล</em>
                        </MenuItem>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            />
          </div>

          <div className="w-full px-1 py-2">
            <Controller
              name={'role'}
              control={control}
              defaultValue={user ? user?.role?.id : ''}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl sx={{ minWidth: 120 }} fullWidth="true" required>
                  <InputLabel id="type" size={'small'}>
                    บทบาท
                  </InputLabel>
                  <Select {...field} label="บทบาท" size={'small'} fullWidth>
                    {_.size(roletype?.rows) ? (
                      _.map(roletype.rows, (row) => (
                        <MenuItem key={row.id} value={row.id}>
                          {row.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem>
                        <MenuItem disabled value="">
                          <em>ไม่มีข้อมูล</em>
                        </MenuItem>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

UserForm.propTypes = {
  roletype: PropTypes.object,
  errors: PropTypes.shape({
    username: PropTypes.object,
    password: PropTypes.object,
    firstname: PropTypes.object,
    lastname: PropTypes.object,
  }),
  user: PropTypes.object,
  Controller: PropTypes.func,
  control: PropTypes.object,
};

UserForm.defaultProps = {
  user: null,
};

export default UserForm;
