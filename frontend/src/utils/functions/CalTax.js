import React from 'react';

export default function CalTax(salary, percentage) {
  if (percentage?.status) {
    let total = 0;
    total = salary * (percentage?.number / 100);

    return total;
  }
  return 0;
}
