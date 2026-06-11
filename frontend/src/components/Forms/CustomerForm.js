/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Typography,
  Divider,
  Box,
  Paper,
  useTheme,
  alpha,
  Checkbox,
  FormControlLabel, // <- added
} from '@mui/material';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export function CustomerForm({
  errors,
  customerType,
  customer,
  Controller,
  control,
  customerName,
  setValue,
  bank,
  setBank,
  customer_status,
  setCustomer_status,
  supplier_status,
  setSupplier_status,
}) {
  const theme = useTheme();
  const thaiBanks = [
    'Promptpay',
    'Kasikornbank(KBank)',
    'Government Savings Bank(GSB)',
    'Krungthai Bank(KTB)',
    'Siam Commercial Bank(SCB)',
    'Bangkok Bank(BBL)',
    'Bank of Ayudhya(BAY)',
    'TMBThanachart Bank(TTB)',
    'CIMB Thai Bank(CIMBT)',
    'United Overseas Bank(UOB)',
    'Kiatnakin Phatra Bank(KKP)',
    'Land and Houses Bank(LH Bank)',
    'Citibank N.A.',
  ];

  const renderSectionHeader = (icon, title) => (
    <Box sx={{ width: '100%', mb: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" ml={1} fontWeight="500" color="primary.main">
          {title}
        </Typography>
      </Box>
      <Divider />
    </Box>
  );
  const handleChange = (event) => {
    setBank(event.target.value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {renderSectionHeader(
            <BusinessIcon color="primary" />,
            'Company Information',
          )}
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    customer_status ?? customer?.customer_status ?? false
                  }
                  onChange={(e) =>
                    typeof setCustomer_status === 'function' &&
                    setCustomer_status(e.target.checked)
                  }
                  color="primary"
                />
              }
              label="ลูกค้า"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    supplier_status ?? customer?.supplier_status ?? false
                  }
                  onChange={(e) =>
                    typeof setSupplier_status === 'function' &&
                    setSupplier_status(e.target.checked)
                  }
                  color="primary"
                />
              }
              label="ผู้ขาย"
            />
          </Box>
        </Grid>

        {/* Company Name and Short Name */}
        <Grid item xs={12} md={8}>
          <Controller
            name={'name'}
            control={control}
            defaultValue={customer ? customer.name : customerName || ''}
            render={({ field }) => (
              <TextField
                {...field}
                required
                label="Company Name"
                fullWidth
                size="small"
                error={!!errors?.name}
                helperText={errors?.name && 'Please enter company name'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={'short'}
            control={control}
            defaultValue={customer ? customer.short : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Short Name"
                fullWidth
                size="small"
                placeholder="ABC Co."
              />
            )}
          />
        </Grid>

        {/* Tax ID */}
        <Grid item xs={12}>
          <Controller
            name={'taxId'}
            control={control}
            defaultValue={customer ? customer.taxId : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tax ID"
                fullWidth
                size="small"
                placeholder="0-0000-00000-00-0"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          {renderSectionHeader(
            <HomeIcon color="primary" />,
            'Address Information',
          )}
        </Grid>

        {/* Address Fields */}
        <Grid item xs={12} md={6}>
          <Controller
            name={'address.house_number'}
            control={control}
            defaultValue={customer ? customer?.address?.house_number : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Building/House Number"
                fullWidth
                size="small"
                error={!!errors?.address?.house_number}
                helperText={
                  errors?.address?.house_number && 'Please enter address'
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.village_number'}
            control={control}
            defaultValue={customer ? customer?.address?.village_number : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Village/Community"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.road'}
            control={control}
            defaultValue={customer ? customer?.address?.road : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Road/Street"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.subdistrict'}
            control={control}
            defaultValue={customer ? customer?.address?.subdistrict : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Subdistrict"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.district'}
            control={control}
            defaultValue={customer ? customer?.address?.district : ''}
            render={({ field }) => (
              <TextField {...field} label="District" fullWidth size="small" />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.province'}
            control={control}
            defaultValue={customer ? customer?.address?.province : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Province/State"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.postcode'}
            control={control}
            defaultValue={customer ? customer?.address?.postcode : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Postal Code"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name={'address.country'}
            control={control}
            defaultValue={customer ? customer?.address?.country : 'Thailand'}
            render={({ field }) => (
              <TextField {...field} label="Country" fullWidth size="small" />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          {renderSectionHeader(
            <ContactPhoneIcon color="primary" />,
            'Contact Information',
          )}
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Controller
            name={'telephone'}
            control={control}
            defaultValue={customer ? customer.telephone : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone Number"
                fullWidth
                size="small"
                placeholder="+66 0 0000 0000"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={'fax'}
            control={control}
            defaultValue={customer ? customer.fax : ''}
            render={({ field }) => (
              <TextField {...field} label="Fax Number" fullWidth size="small" />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={'email'}
            control={control}
            defaultValue={customer ? customer.email : ''}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label="Email Address"
                fullWidth
                size="small"
                placeholder="info@example.com"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          {renderSectionHeader(
            <AccountBalanceIcon color="primary" />,
            'Banking Information',
          )}
        </Grid>

        {/* Banking Information */}
        <Grid item xs={12} md={4}>
          <Controller
            name={'bank.account_name'}
            control={control}
            defaultValue={customer ? customer?.bank?.account_name : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Account Name"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name={'bank.account_number'}
            control={control}
            defaultValue={customer ? customer?.bank?.account_number : ''}
            render={({ field }) => (
              <TextField
                {...field}
                label="Account Number"
                fullWidth
                size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

CustomerForm.propTypes = {
  customerType: PropTypes.object,
  errors: PropTypes.object,
  customer: PropTypes.object,
  Controller: PropTypes.func,
  control: PropTypes.object,
  customerName: PropTypes.string,
};

CustomerForm.defaultProps = {
  customer: null,
};

export default CustomerForm;
