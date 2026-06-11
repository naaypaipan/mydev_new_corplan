import React from 'react';

export default function CalSSO(salary, percentage, sso_paid) {
  if (percentage?.status) {
    let total = 0;
    let check = 0;
    total = salary * (percentage?.number / 100);
    check = total + (sso_paid || 0);
    if (check > 875) {
      total = 875 - (sso_paid || 0);
    }
    return total.toFixed(2);
  }
  return 0;
}
