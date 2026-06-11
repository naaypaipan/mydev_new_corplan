import React, { useEffect } from 'react';
import { Button } from '@mui/material';

import { useHistory } from 'react-router-dom';
import SalaryListTable from '../../components/Table/SalaryListTable';
import * as actions from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { payrollReport } from 'components/PDF';

export default function HrSalaryList({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const salaryList = useSelector((state) => state.salaryList);

  useEffect(() => {
    dispatch(actions.salaryListAll({}));
    return () => {};
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('คุณต้องการลบข้อมูลนี้หรือไม่?');
    if (confirm) {
      try {
        await dispatch(actions.salaryListDelete(id));
        dispatch(actions.salaryListAll({}));
      } catch (error) {
        console.error('Error deleting salary list:', error);
      }
    }
  };

  const handleDetail = (id) => {
    history.push(`/humen/salarylist/detail/${id}`);
  };


  const renderButtonAdd = () => (
    <div className="flex justify-end mb-4">
      <Button
        variant="contained"
        color="primary"
        onClick={() => history.push('/humen/salarylist/add')}
      >
        เพิ่ม
      </Button>
    </div>
  );
  const renderTableSalaryList = () => (
    <SalaryListTable
      salary={salaryList?.rows}
      handleDelete={handleDelete}
      handleDetail={handleDetail}
      payrollReport={payrollReport}
    />
  );
  return (
      <div>
      {/* <div className="mb-4 bg-red-400 text-white text-center">
        โมดูลกำลังพัฒนา
      </div> */}

      {renderButtonAdd()}
      {renderTableSalaryList()}
    </div>
  );
}
