import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import QRCode from 'react-qr-code';
import ImageUpload from '../ImageUpload/ImageUpload';
import generatePromptPayQR from '../../utils/functions/generatePromptPayQR';

export default function AddpayoutForm({
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
  edit,
  slipImage,
  setSlipImage,
  expenseData,
}) {
  const handleChange = (event) => {
    setPaidType(event.target.value);
  };

  const handleCheckLevel = (data, index) => {
    const each = _.find(projects.rows, { _id: data?._id });
    setValue(`project`, each?._id);
    setProjectSelect(each);
  };

  const handleCheckBudget = (data, index) => {
    const each = _.find(projectSelect?.budget, { _id: data?._id });
    setValue(`budget`, each?._id);
    setBudgetSelect(each);
  };

  const payeeBank = expenseData?.payee?.bank || '';
  const payeeAccount = expenseData?.payee?.account_number || '';
  const payeeName = expenseData?.payee?.name || '';
  const isPromptPay =
    payeeBank.toLowerCase().replace(/\s/g, '') === 'promptpay';

  const netPaid = useMemo(() => {
    if (!expenseData) return 0;
    if (expenseData.net_price != null) return Number(expenseData.net_price);
    return (
      (Number(expenseData.price) || 0) -
      (Number(expenseData.withholding_tax) || 0)
    );
  }, [expenseData]);

  const promptPayPayload = useMemo(() => {
    if (!isPromptPay || !payeeAccount) return '';
    return generatePromptPayQR(payeeAccount, netPaid > 0 ? netPaid : undefined);
  }, [isPromptPay, payeeAccount, netPaid]);

  return (
    <div>
      {/* PromptPay QR Section */}
      {isPromptPay && promptPayPayload && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'grey.50',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            สแกนเพื่อโอนเงินผ่าน PromptPay
          </Typography>
          {payeeName && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              ผู้รับเงิน: {payeeName}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            หมายเลข: {payeeAccount}
            {netPaid > 0 && (
              <>
                {' | '}จำนวน: ฿
                {netPaid.toFixed(2).replace(/\d(?=(\d{3})+(?!\d))/g, '$&,')}
              </>
            )}
          </Typography>
          <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white', borderRadius: 2 }}>
            <QRCode value={promptPayPayload} size={200} level="M" />
          </Box>
        </Box>
      )}

      <div className="w-full px-1 py-1">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Payment Date"
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
          name={'price'}
          control={control}
          defaultValue={''}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Net Paid"
              fullWidth
              type="number"
              size={'small'}
              required
            />
          )}
        />
      </div>
      <div className="w-full px-1 py-1">
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Paid by</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={paidType}
            label="Paid by"
            size="small"
            onChange={handleChange}
          >
            <MenuItem value={'TRANSFER'}>Transfer</MenuItem>
            <MenuItem value={'CASH'}>Cash</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="w-full px-1 py-1">
        <Controller
          name={'remark'}
          control={control}
          defaultValue={''}
          render={({ field }) => (
            <TextField {...field} label="remark" fullWidth size={'small'} />
          )}
        />
      </div>
      {/* Slip Upload Section */}
      <div className="w-full px-1 py-2">
        <Typography variant="subtitle2" className="mb-1">
          อัปโหลดสลิป
        </Typography>
        <ImageUpload
          preview_size="200"
          maxNumber={1}
          images={slipImage || []}
          setImages={setSlipImage}
          title={'เลือกสลิป'}
        />
      </div>
      <div className="flex justify-center">
        <Button variant="contained" type="submit">
          บันทึก
        </Button>
      </div>
    </div>
  );
}
