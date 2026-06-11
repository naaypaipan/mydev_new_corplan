import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function DeliverForm({ dateDeliver, setDateDeliver, title }) {
  const [date, setDate] = React.useState(null);

  return (
    <div>
      <h1 className="font-bold text-xl ">{title}</h1>
      <div className="py-2">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="MM/DD/YYYY"
            value={dateDeliver}
            onChange={(newDate) => setDateDeliver(newDate)}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
