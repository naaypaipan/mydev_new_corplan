import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import * as CONSTANT from '../../utils/constants';

export function RoleTypeForm({ errors, roletype, Controller, control }) {
  return (
    <div className="flex flex-row flex-wrap">
      <div className="w-full px-1 py-2">
        <Controller
          name={'type_code'}
          control={control}
          defaultValue={roletype ? roletype.type_code : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="รหัส"
              fullWidth
              size={'small'}
              multiline={true}
              required
              helperText={errors.type_code && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-2">
        <Controller
          name={'name'}
          control={control}
          defaultValue={roletype ? roletype.name : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="ชื่อบทบาท"
              fullWidth
              size={'small'}
              required
              helperText={errors.name && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-2">
        <Controller
          name={'description'}
          control={control}
          defaultValue={roletype ? roletype.description : ''}
          rules={{ required: false }}
          render={({ field }) => (
            <TextField
              {...field}
              label="รายละเอียด"
              fullWidth
              size={'small'}
              multiline={true}
              helperText={errors.description && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-2">
        <Controller
          name={'level'}
          control={control}
          defaultValue={roletype ? roletype.level : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl sx={{ minWidth: 120 }} fullWidth required>
              <InputLabel id="level" size={'small'}>
                ระดับ
              </InputLabel>
              <Select {...field} label="บทบาท" size={'small'}>
                {_.size(CONSTANT.ROLE_LEVEL) ? (
                  _.map(CONSTANT.ROLE_LEVEL, (LEVEL) => (
                    <MenuItem key={LEVEL.value} value={LEVEL.value}>
                      {LEVEL.label}
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
        <div className="px-4 py-2 text-xs font-light font-serif text-gray-500">
          {errors.level && 'กรุณาใส่ข้อมูล'}
        </div>
      </div>
    </div>
  );
}

RoleTypeForm.propTypes = {
  errors: PropTypes.shape({
    name: PropTypes.object,
    description: PropTypes.object,
    type_code: PropTypes.object,
    level: PropTypes.object,
  }),
  roletype: PropTypes.object,
  Controller: PropTypes.func,
  control: PropTypes.object,
};

RoleTypeForm.defaultProps = {
  roletype: null,
};

export default RoleTypeForm;
