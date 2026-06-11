import {
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
} from '@mui/material';
import React, { useState } from 'react';

export default function PaymentExpensesForm({
  Controller,
  control,
  expenses,
  setValue,
  watch,
  isVatIncluded,
  setIsVatIncluded,
  vat,
  setVat,
  getNetTotal,
  getPriceIncludeVat,
  getPriceExcludeVat,
  type,
  setType,
}) {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 700, mb: 1.5, textAlign: 'center' }}
      >
        ข้อมูลรายการเบิก
      </Typography>

      <Grid container spacing={2}>
        {/* ด้านซ้าย: ข้อมูลโครงการและตัวเลือก */}
        <Grid item xs={12} md={5} lg={4}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}
            >
              ข้อมูลโครงการ
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                โครงการ
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expenses?.project?.project_number || '-'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                งบประมาณ
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {expenses?.budget?.budget_number || '-'}
              </Typography>
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="expense-type-label">ประเภทการเบิกจ่าย</InputLabel>
              <Select
                labelId="expense-type-label"
                id="expense-type-select"
                label="ประเภทการเบิกจ่าย"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value={'INDIRECT'}>INDIRECT</MenuItem>
                <MenuItem value={'DIRECT'}>DIRECT</MenuItem>
              </Select>
            </FormControl>
          </Card>
        </Grid>

        {/* ด้านขวา: รายการและราคา */}
        <Grid item xs={12} md={7} lg={8}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}
            >
              รายละเอียดค่าใช้จ่าย
            </Typography>

            <Grid container spacing={1.5}>
              {/* รายการ */}
              <Grid item xs={12}>
                <Controller
                  name={'name'}
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
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* จำนวนเงินและ VAT checkbox */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name={'price'}
                  control={control}
                  defaultValue={''}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="จำนวนเงิน"
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      InputProps={{
                        sx: { borderRadius: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isVatIncluded}
                      onChange={(e) => setIsVatIncluded(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label="รวม VAT แล้ว"
                />
              </Grid>

              {/* VAT input field */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name={'expenses_list.vat'}
                  control={control}
                  defaultValue={7}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="VAT"
                      size="small"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      value={vat}
                      onChange={(e) => {
                        field.onChange(e);
                        setVat(e.target.value);
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                        sx: { borderRadius: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* ส่วนว่าง */}
              <Grid item xs={12} sm={6}></Grid>

              {/* แสดงผลการคำนวณ VAT */}
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                  }}
                >
                  {isVatIncluded ? (
                    <Grid container spacing={0.5}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          ราคาก่อน VAT:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          align="right"
                          fontWeight={500}
                        >
                          {getPriceExcludeVat()} บาท
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          VAT ({vat}%):
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          align="right"
                          fontWeight={500}
                        >
                          {(getPriceExcludeVat() * (vat / 100))?.toFixed(2)} บาท
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={0.5}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          VAT ({vat}%):
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          align="right"
                          fontWeight={500}
                        >
                          {(watch('price') * (vat / 100))?.toFixed(2)} บาท
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          ราคารวม VAT:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="body2"
                          align="right"
                          fontWeight={500}
                        >
                          {getPriceIncludeVat()} บาท
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </Grid>

              {/* ย้ายส่วนการหักเงินมาไว้ด้านขวา */}
              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: 'primary.main' }}
                >
                  การหักเงิน
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name={'expenses_list.tax'}
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="หัก ณ ที่จ่าย"
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                        sx: { borderRadius: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name={'expenses_list.sso'}
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="หักประกันสังคม"
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">บาท</InputAdornment>
                        ),
                        sx: { borderRadius: 1 },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* รวมยอดเงิน */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Divider />
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 0.5, color: 'text.secondary' }}
                >
                  สรุปรายการ
                </Typography>
                <TextField
                  label="รวมยอดเงิน (หลังหัก ณ ที่จ่ายและประกันสังคม)"
                  fullWidth
                  size="small"
                  value={`${getNetTotal()} บาท`}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      borderRadius: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: '1px',
                      },
                    },
                  }}
                />
              </Grid>

              {/* ปุ่มบันทึก */}
              <Grid item xs={12} sx={{ mt: 1.5, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ mr: 1.5, borderRadius: 1 }}>
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ borderRadius: 1 }}
                >
                  บันทึก
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
