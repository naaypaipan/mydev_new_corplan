import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';

import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { EmployeeForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';


export default function EditEmployee({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [employeeImage, setEmployeeImage] = useState([]);
  const employee = useSelector((state) => state.employee);
  const roletype = useSelector((state) => state.roletype);
  const department = useSelector((state) => state.department);
  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      firstname: employee.firstname,
      lastname: employee.lastname,
      role: roletype.id,
      phone_number: employee.phone_number,
    },
  });

  useEffect(() => {
    dispatch(actions.employeeGet(id));
    dispatch(actions.roletypeAll(''));
    dispatch(actions.departmentAll({}));
    return () => {};
  }, []);



  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        salary: {
          month: data?.salary?.month,
          day: data?.salary?.month / 30,
          hr: data?.salary?.month / 240,
        },
      };

      if (!_.isEmpty(employeeImage)) {
        // eslint-disable-next-line no-param-reassign
        data.image = {
          image: employeeImage[0]?.data_url,
          imageType: 'profile',
          alt: '',
        };
      }

      // console.log('data', data);

      await dispatch(actions.employeePut(id, payload));
      await dispatch(actions.employeeGet(id));
      setEmployeeImage([]);
      alert('สำเร็จ');
    } catch (error) {
      console.log(error);
    }
  };
  if (employee.isLoading || employee.rows) {
    return <Loading />;
  }
  if (!employee.isLoading && employee.isCompleted) {
    return (
      <div>

        <div className="flex flex-row justify-start pb-4">
          <div>
            <BackButton />
          </div>
        </div>
        <div>
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <EmployeeForm
                control={control}
                Controller={Controller}
                errors={errors}
                employee={employee}
                roletype={roletype}
                employeeImage={employeeImage}
                setEmployeeImage={setEmployeeImage}
                department={department}
              />
              <div className="flex flex-row justify-end gap-1 py-4">
                <Button variant="contained" type="submit">
                  บันทึก
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }
  return <Error />;
}
EditEmployee.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditEmployee.defaultProps = {
  title: '',
  subtitle: '',
};
