import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Stack,
  Avatar,
  Divider,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SaveIcon from '@mui/icons-material/Save';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';

export default function HrExpenseApproverSettings({ title, subtitle }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const info = useSelector((state) => state.info);
  const employee = useSelector((state) => state.employee);

  const [approvalMode, setApprovalMode] = useState('THREE_STEP'); // ONE_STEP | THREE_STEP
  const [approver1, setApprover1] = useState(null);
  const [approver2, setApprover2] = useState(null);
  const [approver3, setApprover3] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(actions.employeeAll({}));
    dispatch(actions.getInformation({}));
    return () => {};
  }, []);

  // Sync local state from info when it loads
  useEffect(() => {
    if (info?._id) {
      setApprover1(info?.expense_approver_1 || null);
      setApprover2(info?.expense_approver_2 || null);
      setApprover3(info?.expense_approver_3 || null);
      setApprovalMode(info?.expense_approval_mode || 'THREE_STEP');
    }
  }, [info?._id]);

  const handleSave = async () => {
    const confirm = window.confirm('บันทึกการตั้งค่าผู้อนุมัติ?');
    if (!confirm) return;
    setSaving(true);
    try {
      await dispatch(
        actions.editOneInformation(info?._id, {
          expense_approval_mode: approvalMode,
          expense_approver_1: approver1?._id || null,
          // ถ้าเป็นโหมด 1 ขั้น ให้เคลียร์ approver ขั้น 2-3 เพื่อลดความสับสน
          expense_approver_2:
            approvalMode === 'THREE_STEP' ? approver2?._id || null : null,
          expense_approver_3:
            approvalMode === 'THREE_STEP' ? approver3?._id || null : null,
        }),
      );
      await dispatch(actions.getInformation({}));
      alert('บันทึกสำเร็จ');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      label: 'ผู้อนุมัติขั้นที่ 1 (1st Approver)',
      icon: <LooksOneIcon />,
      color: theme.palette.warning.main,
      value: approver1,
      onChange: setApprover1,
    },
    {
      label: 'ผู้อนุมัติขั้นที่ 2 (2nd Approver)',
      icon: <LooksTwoIcon />,
      color: theme.palette.info.main,
      value: approver2,
      onChange: setApprover2,
    },
    {
      label: 'ผู้อนุมัติขั้นที่ 3 (3rd Approver)',
      icon: <Looks3Icon />,
      color: theme.palette.success.main,
      value: approver3,
      onChange: setApprover3,
    },
  ];

  const isOneStep = approvalMode === 'ONE_STEP';
  const visibleSteps = isOneStep ? steps.slice(0, 1) : steps;

  const employeeOptions = employee?.rows || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HowToRegIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            ตั้งค่าผู้อนุมัติรายการเบิกเงิน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            กำหนดพนักงานที่มีสิทธิ์อนุมัติรายการตั้งเบิกในแต่ละขั้นตอน
          </Typography>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Mode selector: 1-step vs 3-step */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ minWidth: 140 }}>
              รูปแบบการอนุมัติ:
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={isOneStep ? 'contained' : 'outlined'}
                size="small"
                color="primary"
                onClick={() => setApprovalMode('ONE_STEP')}
              >
                1 Step
              </Button>
              <Button
                variant={!isOneStep ? 'contained' : 'outlined'}
                size="small"
                color="primary"
                onClick={() => setApprovalMode('THREE_STEP')}
              >
                3 Steps
              </Button>
            </Stack>
          </Box>

          {/* Flow diagram hint */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            {visibleSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <Chip
                  icon={step.icon}
                  label={`Step ${idx + 1}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(step.color, 0.15),
                    color: step.color,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: step.color },
                  }}
                />
                {idx < visibleSteps.length - 1 && (
                  <Typography color="text.disabled" fontSize={18}>
                    →
                  </Typography>
                )}
              </React.Fragment>
            ))}
            <Typography color="text.disabled" fontSize={18}>
              →
            </Typography>
            <Chip label="โอนเงิน" size="small" color="success" />
          </Box>

          <Stack spacing={3}>
            {visibleSteps.map((step, idx) => (
              <Box key={idx}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: alpha(step.color, 0.12),
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {step.label}
                  </Typography>
                  {step.value && (
                    <Chip
                      size="small"
                      avatar={
                        <Avatar sx={{ bgcolor: step.color, fontSize: 11 }}>
                          {step.value?.firstname?.charAt(0)}
                        </Avatar>
                      }
                      label={`${step.value?.firstname || ''} ${
                        step.value?.lastname || ''
                      }`}
                      variant="outlined"
                      sx={{ borderColor: step.color, ml: 'auto' }}
                    />
                  )}
                </Box>
                <Autocomplete
                  value={step.value}
                  options={employeeOptions}
                  getOptionLabel={(o) =>
                    typeof o === 'string'
                      ? o
                      : `${o?.firstname || ''} ${o?.lastname || ''} (${
                          o?.employee_id || ''
                        })`
                  }
                  isOptionEqualToValue={(o, v) => o?._id === v?._id}
                  onChange={(_, newVal) => step.onChange(newVal)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="เลือกพนักงาน..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: step.color },
                          '&.Mui-focused fieldset': { borderColor: step.color },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            bgcolor: step.color,
                          }}
                        >
                          {option?.firstname?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {option?.firstname} {option?.lastname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option?.employee_id} ·{' '}
                            {option?.department?.name || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                />
                {idx < visibleSteps.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
