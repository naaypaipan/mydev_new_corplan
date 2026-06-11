import dayjs from 'dayjs';
import React from 'react';

export default function CalculateSalaryOtperday(holiday) {
  const date = dayjs();
  const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hl = holiday?.total;

  if (dayOfWeek == 0) {
    return 3;
  } else if (hl >= 1) {
    return 2;
  } else {
    return 1.5;
  }
}
