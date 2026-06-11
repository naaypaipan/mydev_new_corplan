import FilterExpensesDaily from 'components/Card/FilterExpensesDaily';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import ExpensesDailyTable from 'components/Table/ExpensesDailyTable';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import FinanceDailySotus from 'components/Excel/FinanceDailySotus';

export default function ExpensesDaily({ title, subtitle }) {
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date());
  const expenses = useSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(
      actions.expensesGetDaily({
        date: date,
        dateStart: dayjs(date).startOf('day').toDate(),
        dateEnd: dayjs(date).endOf('day').toDate(),
      }),
    );
    return () => {};
  }, [date]);



  const renderTable = () => <ExpensesDailyTable expenses={expenses} />;
  const renderFilters = () => (
    <FilterExpensesDaily date={date} setDate={setDate} />
  );

  const renderButtonExcel = () => (
    <div className="flex justify-end">
      <Button
        variant="outlined"
        color="success"
        onClick={() => FinanceDailySotus({ data: expenses })}
      >
        Export to Excel
      </Button>
    </div>
  );

  return (
    <div>
      {renderFilters()}
      {renderButtonExcel()}
      {renderTable()}
    </div>
  );
}
