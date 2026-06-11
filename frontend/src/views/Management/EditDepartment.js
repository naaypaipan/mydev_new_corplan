import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { DepartmentForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { mergeSubMenuDefaults } from '../../constants/sidebarNavConfig';


export default function EditDepartment({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const department = useSelector((state) => state.department);
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    dispatch(actions.departmentGet(id));
    return () => {};
  }, [dispatch, id]);

  useEffect(() => {
    if (
      department?._id &&
      department._id === id &&
      !department.rows &&
      department.name !== undefined
    ) {
      reset({
        name: department.name || '',
        description: department.description || '',
        access: {
          ...department.access,
          subMenuAccess: mergeSubMenuDefaults(department.access || {}),
        },
      });
    }
  }, [department, id, reset]);



  const onSubmit = async (data) => {
    try {
      console.log(data);
      await dispatch(actions.departmentPut(id, data));
      await dispatch(actions.departmentGet(id));
      alert('สำเร็จ');
    } catch (error) {
      console.log(error);
    }
  };
  if (department.isLoading || department.rows) {
    return <Loading />;
  }
  if (!department.isLoading && department.isCompleted) {
    return (
      <div>

        <div className="flex flex-row justify-start pb-4">
          <div>
            <BackButton />
          </div>
        </div>
        <div>
          <Card className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DepartmentForm
                errors={errors}
                department={department}
                control={control}
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

EditDepartment.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditDepartment.defaultProps = {
  title: '',
  subtitle: '',
};
