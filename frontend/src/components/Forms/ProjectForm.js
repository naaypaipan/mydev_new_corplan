import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Box,
  Grid,
  Button,
  IconButton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

import _ from 'lodash';

export default function ProjectForm({
  Controller,
  control,
  employee,
  date,
  setDate,
  dateEnd,
  setDateEnd,
  includeVAT,
  setIncludeVAT,
  cost,
  setCost,
  extraGpsSites = [],
  setExtraGpsSites,
}) {
  return (
    <Box
      sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}
    >
      {/* Project Details Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Project Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="project_number"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="Project ID" fullWidth size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project Name"
                fullWidth
                size="small"
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                size="small"
                multiline
                rows={3}
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Financial Details Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Financial Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            fullWidth
            type="number"
            size="small"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeVAT}
                onChange={(e) => setIncludeVAT(e.target.checked)}
                color="primary"
              />
            }
            label="Include VAT"
          />
        </Grid>
        {!includeVAT && (
          <Grid item xs={12} sm={6}>
            <h1 className="font-bold">
              Vat 7% : {cost ? (cost * 0.07).toFixed(2) : '0.00'}
            </h1>
            <h1 className="font-bold">
              Total {cost ? (cost * 1.07).toFixed(2) : '0.00'}{' '}
            </h1>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Customer and Location Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        labor cost
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="labur_cost"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="labor cost" fullWidth size="small" />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Customer and Location Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Customer and Location
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="customer"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="Customer" fullWidth size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="place"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="Location" fullWidth size="small" />
            )}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ my: 2, fontWeight: 'bold' }}>
        GPS จุดหลัก
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        ใช้สำหรับลงเวลา — เพิ่มไซต์อื่นของโครงการเดียวกันได้ด้านล่าง
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="gps.lat"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="Latitude" fullWidth size="small" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="gps.lon"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField {...field} label="Longitude" fullWidth size="small" />
            )}
          />
        </Grid>
      </Grid>

      {setExtraGpsSites && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            ไซต์ GPS เพิ่มเติม (โครงการเดียวกัน)
          </Typography>
          {extraGpsSites.map((row, idx) => (
            <Grid
              container
              spacing={1}
              key={idx}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Grid item xs={12} sm={4}>
                <TextField
                  label="ชื่อไซต์"
                  value={row.name}
                  onChange={(e) => {
                    const next = [...extraGpsSites];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setExtraGpsSites(next);
                  }}
                  fullWidth
                  size="small"
                  placeholder={`ไซต์ ${idx + 1}`}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Lat"
                  type="number"
                  inputProps={{ step: 0.00001 }}
                  value={row.lat}
                  onChange={(e) => {
                    const next = [...extraGpsSites];
                    next[idx] = { ...next[idx], lat: e.target.value };
                    setExtraGpsSites(next);
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Lon"
                  type="number"
                  inputProps={{ step: 0.00001 }}
                  value={row.lon}
                  onChange={(e) => {
                    const next = [...extraGpsSites];
                    next[idx] = { ...next[idx], lon: e.target.value };
                    setExtraGpsSites(next);
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton
                  aria-label="ลบไซต์"
                  onClick={() => {
                    setExtraGpsSites(extraGpsSites.filter((_, i) => i !== idx));
                  }}
                  size="small"
                  color="error"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              setExtraGpsSites([
                ...extraGpsSites,
                { name: '', lat: '', lon: '' },
              ])
            }
            sx={{ mt: 0.5 }}
          >
            เพิ่มไซต์
          </Button>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Date Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Dates
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={dateEnd}
              onChange={(newValue) => setDateEnd(newValue)}
              renderInput={(params) => (
                <TextField {...params} size="small" fullWidth />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Project Manager Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Project Manager
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="engineer"
            control={control}
            defaultValue={employee ? employee?.engineer?._id : ''}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl sx={{ minWidth: 120 }} fullWidth required>
                <InputLabel id="type" size="small">
                  Project Manager
                </InputLabel>
                <Select
                  {...field}
                  label="Project Manager"
                  size="small"
                  fullWidth
                >
                  {_.size(employee) ? (
                    _.map(employee, (row) => (
                      <MenuItem key={row.id} value={row.id}>
                        {row?.firstname} {row?.lastname}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>No Data Available</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
