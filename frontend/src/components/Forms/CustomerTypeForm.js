import { TextField } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

export function CustomerTypeForm({
  errors,
  customerType,
  Controller,
  control,
}) {
  return (
    <div className="flex flex-row flex-wrap">
      <div className="w-full px-1 py-2">
        <Controller
          name={'name'}
          control={control}
          defaultValue={customerType ? customerType.name : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="ชื่อ"
              required
              fullWidth
              size={'small'}
              helperText={errors.name && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-1">
        <Controller
          name={'description'}
          control={control}
          defaultValue={customerType ? customerType.description : ''}
          render={({ field }) => (
            <TextField
              {...field}
              label="รายละเอียด"
              fullWidth
              multiline
              rows={4}
              size={'small'}
              helperText={errors.descrtiption && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
    </div>
  );
}

CustomerTypeForm.propTypes = {
  customerType: PropTypes.object,
  errors: PropTypes.shape({
    name: PropTypes.object,
    type_code: PropTypes.object,
    descrtiption: PropTypes.object,
  }),
  Controller: PropTypes.func,
  control: PropTypes.object,
};

CustomerTypeForm.defaultProps = {
  customerType: null,
};

export default CustomerTypeForm;
