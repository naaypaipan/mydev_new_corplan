import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { EmployeeForm } from '../../components/Forms';
import { Badge, Box, Button, Card } from '@mui/material';

const defaultValue = {
  firstname: '',
  lastname: '',
  department: '',
  role: '',
  username: '',
  password: '',
  phone_number: '',
};

export default function HrAddEmployee({ title, subtitle }) {
  const dispatch = useDispatch();
  const employee = useSelector((state) => state.employee);
  const roletype = useSelector((state) => state.roletype);
  const department = useSelector((state) => state.department);
  const history = useHistory();

  const [addUser, setAddUser] = useState(false);
  const [addedEmployeeImage, setAddedEmployeeImage] = useState([]);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(actions.roletypeAll(''));
    dispatch(actions.departmentAll({}));
    return () => {};
  }, []);

  const onSubmit = async (data) => {
    try {
      const confirm = window.confirm('คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?');
      if (confirm) {
        const payload = {
          ...data,
          salary: {
            month: data?.salary?.month,
            day: data?.salary?.month / 30,
            hr: data?.salary?.month / 240,
          },
        };
        if (addUser === true) {
          if (data.password === data.confirmPassword) {
            await dispatch(actions.userRegister(payload));
            reset(defaultValue);
            handleClose();
            setAddUser(false);
            // await dispatch(actions.employeeAll({ name, page, size }));
            history.goBack();
          } else {
            alert('กรุณาใส่รหัสผ่านให้ตรงกัน');
          }
        } else {
          await dispatch(actions.employeeCreate(payload));
          reset(defaultValue);
          setAddUser(false);
          setAddedEmployeeImage([]);
          // await dispatch(actions.employeeAll({ name, page, size }));
          history.goBack();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EmployeeForm
        control={control}
        Controller={Controller}
        errors={errors}
        employee={employee}
        roletype={roletype}
        addUser={addUser}
        setAddUser={setAddUser}
        employeeImage={addedEmployeeImage}
        setEmployeeImage={setAddedEmployeeImage}
        department={department}
      />
      {/* ปุ่มบันทึกข้อมูล */}
      <Box sx={{ textAlign: 'center', p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          startIcon={<Badge />}
          size="large"
        >
          บันทึกข้อมูล
        </Button>
      </Box>
    </form>
  );

  return (
    <div>
      <div className="p-1">{renderForm()}</div>
    </div>
  );
}
