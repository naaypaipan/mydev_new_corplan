import {
  FormControlLabel,
  TextField,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useWatch } from 'react-hook-form';
import {
  SUBMENU_ENTRIES_BY_MODULE,
  mergeSubMenuDefaults,
} from '../../constants/sidebarNavConfig';

const MODULE_ORDER = [
  'PROJECT',
  'CUSTOMER',
  'DIRECTOR',
  'FINANCE',
  'HUMEN',
  'MANAGEMENT',
];

const MODULE_LABELS = {
  PROJECT: 'PROJECT',
  CUSTOMER: 'CUSTOMER',
  DIRECTOR: 'DIRECTOR',
  FINANCE: 'FINANCE',
  HUMEN: 'HUMEN',
  MANAGEMENT: 'SETTING (MANAGEMENT)',
};

export function DepartmentForm({ errors, department, control }) {
  const accessWatch = useWatch({ control, name: 'access' });
  const mergedDefaults = mergeSubMenuDefaults(department?.access || {});

  return (
    <div className="flex flex-row flex-wrap">
      <div className="w-full px-1 py-2">
        <Controller
          name={'name'}
          control={control}
          defaultValue={department ? department.name : ''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="name"
              required
              fullWidth
              size={'small'}
              helperText={errors.name && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-2">
        <Controller
          name={'description'}
          control={control}
          defaultValue={department ? department.description : ''}
          rules={{ required: false }}
          render={({ field }) => (
            <TextField
              {...field}
              label="description"
              fullWidth
              size={'small'}
              multiline={true}
              helperText={errors.description && 'กรุณาใส่ข้อมูล'}
            />
          )}
        />
      </div>
      <div className="w-full px-2">
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Access Module
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          เปิดโมดูลแล้วเลือกเมนูย่อยใต้โมดูลนั้น แผนกเก่าที่ยังไม่มี subMenuAccess จะเข้าได้ทุกเมนูในโมดูลที่เปิด
        </Typography>
        {MODULE_ORDER.map((mod) => {
          const entries = SUBMENU_ENTRIES_BY_MODULE[mod] || [];
          const moduleOn = !!accessWatch?.[mod];
          return (
            <Box
              key={mod}
              sx={{
                mb: 1.5,
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Controller
                name={`access.${mod}`}
                control={control}
                defaultValue={department ? department.access?.[mod] : false}
                rules={{ required: false }}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} />}
                    label={MODULE_LABELS[mod] || mod}
                  />
                )}
              />
              {moduleOn && entries.length > 0 && (
                <Box sx={{ pl: 3, pt: 0.5, borderLeft: '2px solid', borderColor: 'primary.light', ml: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                    เมนูย่อย
                  </Typography>
                  <Controller
                    name={`access.subMenuAccess.${mod}`}
                    control={control}
                    defaultValue={mergedDefaults[mod] || {}}
                    render={({ field }) => (
                      <div>
                        {entries.map(({ href, title, level }) => (
                          <FormControlLabel
                            key={href}
                            sx={{ display: 'flex', ml: 0 }}
                            control={
                              <Checkbox
                                size="small"
                                checked={field.value?.[href] !== false}
                                onChange={(e) =>
                                  field.onChange({
                                    ...field.value,
                                    [href]: e.target.checked,
                                  })
                                }
                              />
                            }
                            label={`${title}${
                              typeof level === 'number' && level > 0
                                ? ` (ระดับบทบาท ≥ ${level})`
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </div>
    </div>
  );
}

DepartmentForm.propTypes = {
  errors: PropTypes.shape({
    name: PropTypes.object,
    description: PropTypes.object,
  }),
  department: PropTypes.object,
  control: PropTypes.object,
};

DepartmentForm.defaultProps = {
  department: null,
};

export default DepartmentForm;
