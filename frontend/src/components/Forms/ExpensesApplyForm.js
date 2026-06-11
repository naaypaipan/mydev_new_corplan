import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  Autocomplete,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Chip,
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BankIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Assignment as ProjectIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { createFilterOptions } from '@mui/material/Autocomplete';

export default function ExpensesApplyForm({
  expenses,
  control,
  Controller,
  date,
  setDate,
  paidType,
  setPaidType,
  projects,
  projectSelect,
  setProjectSelect,
  setValue,
  setBudgetSelect,
  bank,
  setBank,
  customer,
  customerSelect,
  onAddCustomer,
  setCustomerSelect,
  budgetSelect,
  personalMode = false,
  watch,
}) {
  const theme = useTheme();
  const filter = createFilterOptions();

  const [hasTax, setHasTax] = useState(false);
  const [includesVat, setIncludesVat] = useState(false);
  const [taxRate, setTaxRate] = useState(3);

  // Initialize checkboxes from existing data if editing
  useEffect(() => {
    if (expenses) {
      setHasTax(!!expenses.withholding_tax || expenses.tax_3);
      setIncludesVat(!!expenses.includes_vat);
      if (expenses.withholding_tax_rate) {
        setTaxRate(expenses.withholding_tax_rate);
      }
    }
  }, [expenses]);

  const safeWatch = (name) => {
    return typeof watch === 'function' ? watch(name) : null;
  };

  // Handle VAT/Tax calculations: base_amount = ยอดก่อน VAT, net_price = ยอดจ่ายจริง (price - withholding_tax)
  const baseAmountValue = safeWatch('base_amount');

  useEffect(() => {
    if (baseAmountValue !== null && baseAmountValue !== undefined && baseAmountValue !== '' && !isNaN(parseFloat(baseAmountValue))) {
      const basePrice = parseFloat(baseAmountValue);
      let newVatAmount = 0;
      let newTotalPrice = basePrice;
      let newWithholdingTax = 0;

      // บวก VAT 7%
      if (includesVat) {
        newVatAmount = basePrice * 0.07;
        newTotalPrice = basePrice + newVatAmount;
      }

      setValue('vat_amount', newVatAmount);
      setValue('price', newTotalPrice);

      // คำนวณหัก ณ ที่จ่าย (คิดจากยอดก่อน VAT)
      if (hasTax) {
        newWithholdingTax = basePrice * (taxRate / 100);
        setValue('withholding_tax', newWithholdingTax);
        setValue('withholding_tax_rate', taxRate);
        setValue('tax_3', true);
      } else {
        setValue('withholding_tax', 0);
        setValue('withholding_tax_rate', 0);
        setValue('tax_3', false);
      }
      // net_price = สรุปยอดจ่ายจริง (จำนวนรวม - หัก ณ ที่จ่าย)
      const totalPrice = newTotalPrice;
      const wht = hasTax ? newWithholdingTax : 0;
      setValue('net_price', totalPrice - wht);
    } else {
      setValue('vat_amount', 0);
      setValue('price', 0);
      setValue('withholding_tax', 0);
      setValue('net_price', 0);
    }
  }, [baseAmountValue, includesVat, hasTax, taxRate, setValue]);

  const handleCheckLevel = (data) => {
    const each = _.find(projects?.rows, { _id: data?._id });
    setValue('project', each?._id);
    setProjectSelect(each);
    // --- เคลียร์ค่างบประมาณเมื่อเปลี่ยนโปรเจค ---
    setValue('budget', null);
    if (typeof setBudgetSelect === 'function') {
      setBudgetSelect(null);
    }
  };

  const handleCheckBudget = (data) => {
    const each = _.find(projectSelect?.budget, { _id: data?._id });
    setValue('budget', each?._id);
    setBudgetSelect(each);
  };

  const handleAdd = (inputValue, fieldName) => {
    if (onAddCustomer && inputValue) onAddCustomer(inputValue, fieldName);
  };

  const handleCheckPayee = (data) => {
    const each = _.find(customer?.rows, { _id: data?._id });
    setValue('customer', each?._id);
    setValue('payee.bank', each?.bank?.bank_name || '');
    setValue('payee.name', each?.bank?.account_name || '');
    setValue('payee.account_number', each?.bank?.account_number || '');
    if (typeof setCustomerSelect === 'function') setCustomerSelect(each);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                โครงการ
              </Typography>
              <Controller
                name="project"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    freeSolo
                    value={projectSelect || null}
                    options={projects?.rows || []}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : `${option.project_number}|ลูกค้า: ${option.customer} | ${option.name}`
                    }
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    onChange={(e, newValue) => handleCheckLevel(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <ProjectIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                งบประมาณ
              </Typography>
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    freeSolo
                    value={budgetSelect || null}
                    disabled={!projectSelect} // --- ปิดการใช้งานถ้ายังไม่เลือกโปรเจค ---
                    options={projectSelect?.budget || []}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : `${option.prefix || ''}${option.budget_number} | ${
                        option.name
                      }`
                    }
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    onChange={(e, newValue) => handleCheckBudget(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                วันที่ขอ รับเงิน/จ่ายเงิน
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="MM/DD/YYYY"
                  value={date}
                  fullWidth
                  onChange={(newDate) => setDate(newDate)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </LocalizationProvider>
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                หมายเลข/อ้างอิง
              </Typography>
              <Controller
                name="invoice_number"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    placeholder="หมายเลขใบแจ้งหนี้ (ถ้ามี)"
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                ประเภทการเบิก
              </Typography>
              <Controller
                name="expenses_type"
                control={control}
                defaultValue={paidType || 'REFUND'}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="paid-type-label">ประเภทการเบิก</InputLabel>
                    <Select
                      labelId="paid-type-label"
                      label="ประเภทการเบิก"
                      {...field}
                    >
                      <MenuItem value="PAY">เบิกเพื่อจ่าย</MenuItem>
                      <MenuItem value="REFUND">เบิกคืน</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                รายการ
              </Typography>
              <Controller
                name="name"
                control={control}
                defaultValue={expenses ? expenses?.name : ''}
                rules={{
                  required: 'กรุณาระบุรายการ',
                  maxLength: { value: 255, message: 'ความยาวต้องไม่เกิน 255' },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={
                      error ? error.message : `${field.value?.length || 0}/255`
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Box sx={{ width: '100%', maxWidth: 300, p: 1.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eaeaea' }}>
                  <Stack spacing={1}>
                    {/* ยอดก่อน VAT (Input) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        รวมเป็นเงิน (ก่อน VAT)
                      </Typography>
                      <Controller
                        name="base_amount"
                        control={control}
                        defaultValue={expenses ? (expenses?.base_amount ?? (expenses?.includes_vat ? (expenses?.price - (expenses?.vat_amount || 0)) : (expenses?.net_price ?? expenses?.price))) : ''}
                        rules={{ required: 'กรุณาระบุจำนวนเงิน' }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            size="small"
                            type="number"
                            placeholder="0.00"
                            error={!!error}
                            sx={{ width: 100, bgcolor: 'background.paper', '& .MuiInputBase-input': { py: 0.5, px: 1 } }}
                            inputProps={{ style: { textAlign: 'right', fontWeight: 'bold' } }}
                          />
                        )}
                      />
                    </Box>

                    {/* VAT Checkbox & Value */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includesVat}
                            onChange={(e) => {
                              setIncludesVat(e.target.checked);
                              setValue('includes_vat', e.target.checked);
                            }}
                            size="small"
                            sx={{ py: 0, '& .MuiSvgIcon-root': { fontSize: 18 }, color: 'text.secondary' }}
                          />
                        }
                        label={<Typography variant="body2" color="text.secondary">ภาษีมูลค่าเพิ่ม 7%</Typography>}
                        sx={{ m: 0 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {Number(safeWatch('vat_amount') || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </Typography>
                    </Box>

                    {/* จำนวนเงินรวมทั้งสิ้น (Readonly) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        จำนวนเงินรวมทั้งสิ้น
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        {Number(safeWatch('price') || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    {/* หัก ณ ที่จ่าย Checkbox & Rate */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={hasTax}
                              onChange={(e) => setHasTax(e.target.checked)}
                              size="small"
                              sx={{ py: 0, '& .MuiSvgIcon-root': { fontSize: 18 }, color: 'text.secondary' }}
                            />
                          }
                          label={<Typography variant="body2" color="text.secondary">หักภาษี ณ ที่จ่าย</Typography>}
                          sx={{ m: 0 }}
                        />
                        {hasTax && (
                          <TextField
                            size="small"
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            InputProps={{
                              endAdornment: <InputAdornment position="end" sx={{ ml: 0.5 }}><Typography variant="body2" color="text.primary" fontWeight={600}>%</Typography></InputAdornment>,
                            }}
                            sx={{
                              width: 72,
                              bgcolor: 'background.paper',
                              '& .MuiInputBase-input': { py: 0.5, pl: 1, pr: 0.5, color: 'text.primary', fontWeight: 600, fontSize: '0.875rem' },
                            }}
                            inputProps={{ style: { textAlign: 'right' }, min: 0, max: 100 }}
                          />
                        )}
                      </Box>
                      {hasTax ? (
                        <Controller
                          name="withholding_tax"
                          control={control}
                          defaultValue={expenses ? expenses?.withholding_tax : ''}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              type="number"
                              sx={{ width: 75, bgcolor: 'background.paper', '& .MuiInputBase-input': { py: 0.5, px: 1 } }}
                              inputProps={{ style: { textAlign: 'right', fontSize: '0.875rem' } }}
                            />
                          )}
                        />
                      ) : (
                        <Typography variant="body2" fontWeight="bold">
                          0.00
                        </Typography>
                      )}
                    </Box>

                    {/* สรุปยอดจ่ายจริง (รวมแวท/ไม่รวมแวท/หลังหัก ณ ที่จ่าย) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="success.main" fontWeight="bold">ยอดจ่ายจริง</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        {Number(safeWatch('net_price') || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </Typography>
                    </Box>

                  </Stack>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                ผู้รับเงิน
              </Typography>
              <Controller
                name="customer"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    disablePortal
                    value={customerSelect || null}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    options={customer?.rows || []}
                    getOptionLabel={(option) => `${option?.name || ''}`}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some(
                        (option) =>
                          `${option?.name}`.toLowerCase() ===
                          inputValue.toLowerCase(),
                      );
                      if (inputValue !== '' && !isExisting) {
                        filtered.push({
                          inputValue,
                          name: inputValue,
                          isAddNew: true,
                        });
                      }
                      return filtered;
                    }}
                    onChange={(e, newValue) => {
                      if (typeof newValue === 'string')
                        handleAdd(newValue, 'bank');
                      else if (newValue?.isAddNew)
                        handleAdd(newValue.inputValue, 'bank');
                      else handleCheckPayee(newValue);
                    }}
                    renderOption={(props, option) =>
                      option.isAddNew ? (
                        <li {...props}>เพิ่ม "{option.inputValue}"</li>
                      ) : (
                        <li {...props}>{option.name}</li>
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                ข้อมูลบัญชี
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="payee.bank"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        fullWidth
                        label="ธนาคาร"
                        disabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="payee.account_number"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        fullWidth
                        label="เลขที่บัญชี"
                        disabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="payee.name"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        fullWidth
                        label="ชื่อบัญชี"
                        disabled
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
{!personalMode && ( 
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              type="submit"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
            >
              บันทึก
            </Button>
          </Box>
        )}
        </CardContent>
      </Card>
    </Box>
  );
}
