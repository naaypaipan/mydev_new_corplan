import {
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

export default function PaymentExpensesForm({
  Controller,
  control,
  expenses,
  setValue,
}) {
  const [isVatIncluded, setIsVatIncluded] = useState(false);
  const [price, setPrice] = useState('');
  const [vat, setVat] = useState(7);

  // คำนวณราคาถอด VAT
  const getPriceExcludeVat = () => {
    const numPrice = parseFloat(price) || 0;
    const numVat = parseFloat(vat) || 0;
    if (!isVatIncluded || !numVat) return '';
    return (numPrice / (1 + numVat / 100)).toFixed(2);
  };

  // คำนวณราคารวม VAT
  const getPriceIncludeVat = () => {
    const numPrice = parseFloat(price) || 0;
    const numVat = parseFloat(vat) || 0;
    if (isVatIncluded || !numVat) return '';
    return (numPrice * (1 + numVat / 100)).toFixed(2);
  };

  // คำนวณยอดเงินสุทธิหลังหัก ณ ที่จ่ายและประกันสังคม
  const getNetTotal = () => {
    const base = isVatIncluded
      ? parseFloat(price) || 0
      : parseFloat(getPriceIncludeVat()) || 0;
    const tax = parseFloat(control._formValues?.expenses_list?.tax) || 0;
    const sso = parseFloat(control._formValues?.expenses_list?.sso) || 0;
    // หัก ณ ที่จ่ายคิดเป็น %
    const afterTax = base - (base * tax) / 100;
    // หักประกันสังคมเป็นจำนวนเงิน
    const net = afterTax - sso;
    return net > 0 ? net.toFixed(2) : '';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: '#f9f9fb' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        ข้อมูลรายการเบิก
      </Typography>
      <Grid container spacing={2}>
        {/* Project & Budget */}
        <Grid item xs={12} sm={6}>
          <Controller
            name={'project'}
            control={control}
            defaultValue={expenses ? expenses?.project?.project_number : ''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project"
                fullWidth
                size="small"
                disabled
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name={'budget'}
            control={control}
            defaultValue={
              expenses
                ? expenses?.budget?.prefix + expenses?.budget?.budget_number
                : ''
            }
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Budget"
                fullWidth
                size="small"
                disabled
              />
            )}
          />
        </Grid>

        {/* รายการ & จำนวนเงิน */}
        <Grid item xs={12} sm={8}>
          <Controller
            name={'expenses_list.name'}
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="รายการ"
                fullWidth
                size="small"
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Controller
            name={'expenses_list.price'}
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="จำนวนเงิน"
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ min: 0 }}
                value={price}
                onChange={(e) => {
                  field.onChange(e);
                  setPrice(e.target.value);
                }}
              />
            )}
          />
        </Grid>

        {/* เช็คบ็อกซ์: จำนวนเงินรวม VAT */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isVatIncluded}
                onChange={(e) => setIsVatIncluded(e.target.checked)}
              />
            }
            label="รวม VAT แล้ว"
          />
        </Grid>

        {/* VAT & ราคาถอด VAT หรือราคารวม VAT */}
        <Grid item xs={12} sm={6}>
          {isVatIncluded ? (
            <TextField
              label="ราคาก่อน VAT"
              fullWidth
              size="small"
              value={getPriceExcludeVat()}
              disabled
              InputProps={{
                readOnly: true,
                style: { background: '#f5f5f5' },
              }}
            />
          ) : (
            <TextField
              label="ราคารวม VAT"
              fullWidth
              size="small"
              value={getPriceIncludeVat()}
              disabled
              InputProps={{
                readOnly: true,
                style: { background: '#f5f5f5' },
              }}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name={'expenses_list.vat'}
            control={control}
            defaultValue={7}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="VAT (%)"
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={vat}
                onChange={(e) => {
                  field.onChange(e);
                  setVat(e.target.value);
                }}
              />
            )}
          />
        </Grid>

        {/* หัก ณ ที่จ่าย, หักประกันสังคม */}
        <Grid item xs={12} sm={6}>
          <Controller
            name={'expenses_list.tax'}
            control={control}
            defaultValue={3}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="หัก ณ ที่จ่าย (%)"
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ min: 0, max: 100 }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name={'expenses_list.sso'}
            control={control}
            defaultValue={0}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="หักประกันสังคม"
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ min: 0 }}
              />
            )}
          />
        </Grid>
        {/* รวมยอดเงิน */}
        <Grid item xs={12}>
          <TextField
            label="รวมยอดเงิน (หลังหัก ณ ที่จ่ายและประกันสังคม)"
            fullWidth
            size="small"
            value={getNetTotal()}
            InputProps={{
              readOnly: true,
              style: { background: '#f5f5f5', fontWeight: 600 },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
