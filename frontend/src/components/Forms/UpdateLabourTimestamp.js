import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Autocomplete,
  FormControl,
  Typography,
} from '@mui/material';

export default function UpdateLabourTimestamp({
  employee = [], // [{ _id, id, name, firstname, lastname }]
  initialData = null, // { userId, salary_month, salary_day, salary_hour }
  onSave = () => {},
  onSaveExtra = () => {},
  setForm,
  form,
  setExtraForm,
  extraForm,
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        userId: initialData.userId || '',
        salary_month:
          initialData.salary_month !== undefined
            ? String(initialData.salary_month)
            : '',
        salary_day:
          initialData.salary_day !== undefined
            ? String(initialData.salary_day)
            : '',
        salary_hour:
          initialData.salary_hour !== undefined
            ? String(initialData.salary_hour)
            : '',
      });
      // Set initial data for extra salary if available
      if (initialData.salary_extra) {
        setExtraForm({
          month:
            initialData.salary_extra.month !== undefined
              ? String(initialData.salary_extra.month)
              : '',
          day:
            initialData.salary_extra.day !== undefined
              ? String(initialData.salary_extra.day)
              : '',
        });
      }

      const found =
        employee.find((u) => (u._id || u.id) === initialData.userId) || null;
      setSelectedUser(found);
    } else if (employee?.length === 1) {
      setSelectedUser(employee[0]);
      setForm((p) => ({ ...p, userId: employee[0]._id || employee[0].id }));
    } else {
      setForm((p) => ({ ...p }));
      setSelectedUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, employee]);

  const handleChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleExtraChange = (field) => (e) => {
    const value = e?.target?.value ?? e;
    setExtraForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserChange = (_, newValue) => {
    setSelectedUser(newValue);
    setForm((prev) => ({
      ...prev,
      userId: newValue ? newValue._id || newValue.id : '',
    }));
    setErrors((prev) => ({ ...prev, userId: null }));
  };

  const validate = () => {
    const err = {};
    if (!form.userId) err.userId = 'กรุณาเลือกผู้ใช้งาน';
    ['salary_month', 'salary_day', 'salary_hour'].forEach((k) => {
      if (form[k] !== '' && isNaN(Number(form[k]))) {
        err[k] = 'ต้องเป็นตัวเลข';
      }
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateExtra = () => {
    const err = {};
    if (!form.userId) err.userId = 'กรุณาเลือกผู้ใช้งาน';
    ['month', 'day'].forEach((k) => {
      if (extraForm[k] !== '' && isNaN(Number(extraForm[k]))) {
        err[k] = 'ต้องเป็นตัวเลข';
      }
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      userId: form.userId,
      salary_month:
        form.salary_month === '' ? null : Number(Number(form.salary_month)),
      salary_day:
        form.salary_day === '' ? null : Number(Number(form.salary_day)),
      salary_hour:
        form.salary_hour === '' ? null : Number(Number(form.salary_hour)),
    };
    onSave(payload);
  };

  const handleSaveExtra = () => {
    if (!validateExtra()) return;
    const payload = {
      userId: form.userId,
      salary_extra: {
        month: extraForm.month === '' ? 0 : Number(extraForm.month),
        day: extraForm.day === '' ? 0 : Number(extraForm.day),
      },
    };
    onSaveExtra(payload);
  };

  const getOptionLabel = (u) =>
    u
      ? u.name ||
        `${u.firstname || ''} ${u.lastname || ''}`.trim() ||
        u._id ||
        u.id
      : '';

  return (
    <Card elevation={1}>
      <CardHeader title="แก้ไขข้อมูลค่าแรง" />
      <CardContent>
        <Stack spacing={2} mt={1}>
          <FormControl fullWidth size="small" error={!!errors.userId}>
            <Autocomplete
              options={employee}
              getOptionLabel={getOptionLabel}
              value={selectedUser}
              onChange={handleUserChange}
              isOptionEqualToValue={(option, value) =>
                (option._id || option.id) === (value?._id || value?.id)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ผู้ใช้งาน"
                  size="small"
                  error={!!errors.userId}
                  helperText={errors.userId || ''}
                />
              )}
              clearOnEscape
            />
            {errors.userId && (
              <Typography variant="caption" color="error">
                {errors.userId}
              </Typography>
            )}
          </FormControl>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            ค่าแรงปกติ
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="รายเดือน"
              size="small"
              fullWidth
              value={form.salary_month}
              required
              onChange={handleChange('salary_month')}
              error={!!errors.salary_month}
              helperText={errors.salary_month || ''}
            />
            <TextField
              label="รายวัน"
              size="small"
              fullWidth
              required
              value={form.salary_day}
              onChange={handleChange('salary_day')}
              error={!!errors.salary_day}
              helperText={errors.salary_day || ''}
            />
            <TextField
              label="รายชั่วโมง"
              size="small"
              fullWidth
              required
              value={form.salary_hour}
              onChange={handleChange('salary_hour')}
              error={!!errors.salary_hour}
              helperText={errors.salary_hour || ''}
            />
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              size="small"
              sx={{ minWidth: '120px' }}
            >
              บันทึกค่าแรงปกติ
            </Button>
          </Stack>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            เงินเบี้ยเลี้ยง (Extra)
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="เบี้ยเลี้ยง (รายเดือน)"
              size="small"
              fullWidth
              value={extraForm.month}
              onChange={handleExtraChange('month')}
              error={!!errors.month}
              helperText={errors.month || ''}
            />
            <TextField
              label="เบี้ยเลี้ยง (รายวัน)"
              size="small"
              fullWidth
              value={extraForm.day}
              onChange={handleExtraChange('day')}
              error={!!errors.day}
              helperText={errors.day || ''}
            />
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={handleSaveExtra}
              sx={{ minWidth: '120px' }}
            >
              บันทึกเบี้ยเลี้ยง
            </Button>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={() => {
            if (initialData) {
              setForm({
                userId: initialData.userId || '',
                salary_month:
                  initialData.salary_month !== undefined
                    ? String(initialData.salary_month)
                    : '',
                salary_day:
                  initialData.salary_day !== undefined
                    ? String(initialData.salary_day)
                    : '',
                salary_hour:
                  initialData.salary_hour !== undefined
                    ? String(initialData.salary_hour)
                    : '',
              });
              if (initialData.salary_extra) {
                setExtraForm({
                  month:
                    initialData.salary_extra.month !== undefined
                      ? String(initialData.salary_extra.month)
                      : '',
                  day:
                    initialData.salary_extra.day !== undefined
                      ? String(initialData.salary_extra.day)
                      : '',
                });
              }
              const found =
                employee.find((u) => (u._id || u.id) === initialData.userId) ||
                null;
              setSelectedUser(found);
            } else {
              setForm({
                userId: '',
                salary_month: '',
                salary_day: '',
                salary_hour: '',
              });
              setExtraForm({ month: '', day: '' });
              setSelectedUser(null);
            }
            setErrors({});
          }}
          color="inherit"
          variant="outlined"
          size="small"
        >
          รีเซ็ต
        </Button>
      </CardActions>
    </Card>
  );
}

UpdateLabourTimestamp.propTypes = {
  employee: PropTypes.array,
  initialData: PropTypes.object,
  onSave: PropTypes.func,
  onSaveExtra: PropTypes.func,
};
