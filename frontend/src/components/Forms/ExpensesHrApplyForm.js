import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormControlLabel,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
export default function ExpensesHrApplyForm({
  control,
  Controller,
  date,
  setDate,
  setPaidType,
  paidType,
  projects,
  projectSelect,
  setProjectSelect,
  setValue,
  budgetSelect,
  setBudgetSelect,
  customer,
  bank,
  setBank,
  watch,
}) {
  const thaiBanks = [
    'Promptpay',
    'Kasikornbank(KBank)',
    'Krungthai Bank(KTB)',
    'Siam Commercial Bank(SCB)',
    'Bangkok Bank(BBL)',
    'Government Savings Bank(GSB)',
    'Bank of Ayudhya(BAY)',
    'TMBThanachart Bank(TTB)',
    'CIMB Thai Bank(CIMBT)',
    'United Overseas Bank(UOB)',
    'Kiatnakin Phatra Bank(KKP)',
    'Land and Houses Bank(LH Bank)',
    'Citibank N.A.',
  ];
  
  const [hasTax, setHasTax] = useState(false);
  const [includesVat, setIncludesVat] = useState(false);
  const [taxRate, setTaxRate] = useState(3);

  const safeWatch = (name) => {
    return typeof watch === 'function' ? watch(name) : null;
  };

  // Handle VAT/Tax: base_amount = ยอดก่อน VAT, net_price = ยอดจ่ายจริง (price - withholding_tax)
  const baseAmountValue = safeWatch('base_amount');

  useEffect(() => {
    if (baseAmountValue !== null && baseAmountValue !== undefined && baseAmountValue !== '' && !isNaN(parseFloat(baseAmountValue))) {
      const basePrice = parseFloat(baseAmountValue);
      let newVatAmount = 0;
      let newTotalPrice = basePrice;
      let newWithholdingTax = 0;

      if (includesVat) {
        newVatAmount = basePrice * 0.07;
        newTotalPrice = basePrice + newVatAmount;
      }

      setValue('vat_amount', newVatAmount);
      setValue('price', newTotalPrice);

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
  const handleChange = (event) => {
    setBank(event.target.value);
  };

  const handleCheckLevel = (data, index) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setValue(`project`, each?._id);
    setProjectSelect(each);
  };

  const handleCheckCustomer = (data, index) => {
    const each = _.find(customer.rows, { _id: data?._id });
    setValue(`customer`, each?._id);
  };

  const handleCheckBudget = (data, index) => {
    const each = _.find(projectSelect?.budget, { _id: data?._id });
    setValue(`budget`, each?._id);
    setBudgetSelect(each);
  };

  return (
    <div>
      <div className="grid grid-cols-2">
        {' '}
        <div className="w-full px-1 py-1">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="วันที่ทำรายการ"
              value={date}
              onChange={(newValue) => {
                setDate(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={`project`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id="free-solo-demo"
                freeSolo
                options={projects?.rows || []}
                getOptionLabel={(option) =>
                  `${option.project_number} | ${option.name}`
                }
                onChange={(e, newValue) => handleCheckLevel(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...field}
                    {...params}
                    size="small"
                    label="Project"
                  />
                )}
              />
            )}
          />{' '}
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={`budget`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id="free-solo-demo"
                freeSolo
                options={projectSelect?.budget || []}
                getOptionLabel={(option) =>
                  `${option.prefix}${option.budget_number} | ${option.name}`
                }
                onChange={(e, newValue) => handleCheckBudget(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...field}
                    {...params}
                    size="small"
                    label="Budget"
                  />
                )}
              />
            )}
          />{' '}
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={'invoice_number'}
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <TextField
                {...field}
                label="invoice number"
                fullWidth
                size={'small'}
              />
            )}
          />
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={'name'}
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Order"
                fullWidth
                size={'small'}
                required
              />
            )}
          />
        </div>
        <div className="col-span-2 w-full px-1 py-4">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Box sx={{ width: '100%', maxWidth: 300, p: 1.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #eaeaea' }}>
              <Stack spacing={1}>
                {/* ยอดก่อน VAT (Input) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">รวมเป็นเงิน (ก่อน VAT)</Typography>
                  <Controller
                    name="base_amount"
                    control={control}
                    defaultValue={''}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        placeholder="0.00"
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
                      defaultValue={''}
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

                {/* สรุปยอดจ่ายจริง */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" color="success.main" fontWeight="bold">ยอดจ่ายจริง</Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    {Number(safeWatch('net_price') || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </Typography>
                </Box>

              </Stack>
            </Box>
          </Box>
        </div>
      </div>
      <div>
        <div className="w-full px-1 py-1">ผู้รับเงิน</div>
        <div className="lg:grid grid-cols-2 gap-2">
          <div className="w-full px-1 py-1">
            <Controller
              name={'payee.name'}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ชื่อผู้รับ"
                  fullWidth
                  size={'small'}
                />
              )}
            />
          </div>
          <div className="w-full px-1 py-1">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">ธนาคาร</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={bank}
                label="ธนาคาร"
                size="small"
                onChange={handleChange}
              >
                {thaiBanks.map((bank, index) => (
                  <MenuItem key={index} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
                {/* <MenuItem value={'TRANSFER'}>โอนเงิน</MenuItem>
                    <MenuItem value={'CASH'}>เงินสด</MenuItem> */}
              </Select>
            </FormControl>
          </div>
          <div className="w-full px-1 py-1">
            <Controller
              name={'payee.account_number'}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="เลขบัญชี"
                  fullWidth
                  disabled
                  size={'small'}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Button variant="contained" type="submit">
          บันทึก
        </Button>
      </div>
    </div>
  );
}
