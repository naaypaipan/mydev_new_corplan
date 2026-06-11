import React from 'react';
import { Autocomplete, Card, TextField, Button } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { createFilterOptions } from '@mui/material/Autocomplete';

export default function PaymentForm({
  Controller,
  control,
  employee,
  setValue,
  onAddCustomer, // เพิ่ม prop สำหรับ callback การเพิ่มข้อมูลใหม่
  customer,
  transectiontype,
  paytype,
  dateRequest,
  setDateRequest,
  datePayment,
  setDatePayment,
}) {
  const filter = createFilterOptions();

  const handleCheckPaytype = (data, index) => {
    const each = _.find(paytype?.rows, { _id: data?._id });
    setValue(`pay_type`, each?._id);
  };
  const handleCheckTransectiontype = (data, index) => {
    const each = _.find(transectiontype?.rows, { _id: data?._id });
    setValue(`transection_type`, each?._id);
  };

  const handleCheckRequest = (data, index) => {
    const each = _.find(employee?.rows, { _id: data?._id });
    setValue(`requester`, each?._id);
  };

  const handleCheckPayee = (data, index) => {
    const each = _.find(customer?.rows, { _id: data?._id });
    setValue(`payee`, each?._id);
    setValue(`bank.bank_name`, each?.bank?.bank_name);
    setValue(`bank.account_name`, each?.bank?.account_name);
    setValue(`bank.account_number`, each?.bank?.account_number);
  };

  // เพิ่มฟังก์ชัน handleAdd
  const handleAdd = (inputValue, fieldName) => {
    if (onAddCustomer && inputValue) {
      onAddCustomer(inputValue, fieldName);
    }
  };

  return (
    <div>
      <div>
        <Card>
          <div className="p-2">
            <div className="py-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="วันที่ทำรายการ"
                  disabled
                  value={new Date()}
                  //   onChange={(newValue) => {
                  //     setDateConfirm(newValue);
                  //   }}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </div>
            <div className="py-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="วันที่เกิดรายการ"
                  value={datePayment}
                  onChange={(newValue) => {
                    setDatePayment(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </div>
            <div className="w-full py-1">
              <Controller
                name={`pay_type`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="free-solo-demo"
                    freeSolo
                    //required
                    options={paytype?.rows || []}
                    getOptionLabel={(option) => `${option.name} `}
                    onChange={(e, newValue) => handleCheckPaytype(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...field}
                        {...params}
                        size="small"
                        label="ประเภท"
                        //required
                      />
                    )}
                  />
                )}
              />
            </div>
            <div className="w-full py-1">
              <Controller
                name={`requester`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="free-solo-demo"
                    freeSolo
                    //required
                    options={employee?.rows || []}
                    getOptionLabel={(option) =>
                      `${option.firstname} ${option.lastname}`
                    }
                    onChange={(e, newValue) => handleCheckRequest(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...field}
                        {...params}
                        size="small"
                        label="Requester"
                        //required
                      />
                    )}
                  />
                )}
              />
            </div>
            <div className="w-full py-1">
              <Controller
                name={`payee`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    freeSolo
                    disablePortal
                    options={customer?.rows || []}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : `${option.name}`
                    }
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some(
                        (option) =>
                          `${option.name}`.toLowerCase() ===
                          inputValue.toLowerCase(),
                      );
                      if (inputValue !== '' && !isExisting) {
                        filtered.push({
                          inputValue,
                          firstname: inputValue,
                          lastname: '',
                          isAddNew: true,
                        });
                      }
                      return filtered;
                    }}
                    onChange={(e, newValue) => {
                      if (typeof newValue === 'string') {
                        handleAdd(newValue, 'payee');
                      } else if (newValue && newValue.isAddNew) {
                        handleAdd(newValue.inputValue, 'payee');
                      } else {
                        handleCheckPayee(newValue);
                      }
                    }}
                    renderOption={(props, option) =>
                      option.isAddNew ? (
                        <li {...props}>
                          <Button
                            color="primary"
                            size="small"
                            onMouseDown={(e) => e.preventDefault()}
                            sx={{ minWidth: 0, p: 0, mr: 1 }}
                          >
                            Add
                          </Button>
                          "{option.inputValue}"
                        </li>
                      ) : (
                        <li {...props}>{option.name}</li>
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...field}
                        {...params}
                        size="small"
                        label="Payee"
                        //required
                      />
                    )}
                  />
                )}
              />
            </div>
            <div className="py-1">
              <Controller
                name={'bank.bank_name'}
                control={control}
                defaultValue={''}
                //rules={{ //required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bank Name"
                    fullWidth
                    size={'small'}
                    //required
                  />
                )}
              />
            </div>
            <div className="py-1">
              <Controller
                name={'bank.account_name'}
                control={control}
                defaultValue={''}
                //rules={{ //required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Account Name"
                    fullWidth
                    size={'small'}
                    //required
                  />
                )}
              />
            </div>
            <div className="py-1">
              <Controller
                name={'bank.account_number'}
                control={control}
                defaultValue={''}
                //rules={{ //required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Account Number"
                    fullWidth
                    size={'small'}
                    //required
                  />
                )}
              />
            </div>
            <div className="py-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="วันที่ขอ"
                  value={dateRequest}
                  onChange={(newValue) => {
                    setDateRequest(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </div>
            <div className="w-full py-1">
              <Controller
                name={`pay_type`}
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="free-solo-demo"
                    freeSolo
                    //required
                    options={transectiontype?.rows || []}
                    getOptionLabel={(option) => `${option.name} `}
                    onChange={(e, newValue) =>
                      handleCheckTransectiontype(newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...field}
                        {...params}
                        size="small"
                        label="ประเภท"
                        //required
                      />
                    )}
                  />
                )}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
