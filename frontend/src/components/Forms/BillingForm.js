import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Autocomplete, Button, TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

export default function BillingForm({
  dueDateBilling,
  setDueDateBilling,
  control,
  Controller,
  project,
  customer,
  setValue,
  dateBilling,
  setDateBilling,
}) {
  const handleCheckCustomer = (data, index) => {
    const each = _.find(customer?.rows, { _id: data?._id });
    setValue(`customer`, each?._id);
  };

  const handleCheckProject = (data, index) => {
    const each = _.find(project?.rows, { _id: data?._id });
    setValue(`project_id`, each?._id);
  };

  return (
    <div>
      <div className="lg:grid grid-cols-2">
        <div className="w-full px-1 py-1">
          <Controller
            name={`customer`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id="free-solo-demo"
                freeSolo
                options={customer?.rows || []}
                getOptionLabel={(option) => `${option.short} | ${option.name}`}
                onChange={(e, newValue) => handleCheckCustomer(newValue)}
                renderInput={(params) => (
                  <TextField {...field} {...params} label="Customer" />
                )}
              />
            )}
          />{' '}
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={`project_id`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disablePortal
                id="free-solo-demo"
                freeSolo
                options={project?.rows || []}
                getOptionLabel={(option) =>
                  `${option.project_number} | ${option.name}`
                }
                onChange={(e, newValue) => handleCheckProject(newValue)}
                renderInput={(params) => (
                  <TextField {...field} {...params} label="Project" />
                )}
              />
            )}
          />{' '}
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={'description'}
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField {...field} label="description" fullWidth />
            )}
          />
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={'invoice_number'}
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField {...field} label="invoice number" fullWidth />
            )}
          />
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
                label="price"
                fullWidth
                required
                type="number"
              />
            )}
          />
        </div>
        <div className="w-full px-1 py-1">
          <Controller
            name={'track_number'}
            control={control}
            defaultValue={''}
            render={({ field }) => (
              <TextField {...field} label="track number" fullWidth />
            )}
          />
        </div>

        <div className="w-full px-1 py-1">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date MM/DD/YYYY"
              value={dateBilling}
              onChange={(newDate) => setDateBilling(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
        <div className="w-full px-1 py-1">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due date MM/DD/YYYY"
              value={dueDateBilling}
              onChange={(newDate) => setDueDateBilling(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
      </div>

      <div className="py-2"></div>
    </div>
  );
}
