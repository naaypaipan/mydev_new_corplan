import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { RoleTypeForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';


export default function EditRoleType({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const roletype = useSelector((state) => state.roletype);
  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: roletype.name,
      description: roletype.description,
      type_code: roletype.type_code,
    },
  });

  useEffect(() => {
    dispatch(actions.roletypeGet(id));
    return () => {};
  }, []);



  const onSubmit = async (data) => {
    try {
      console.log(data);
      await dispatch(actions.roletypePut(id, data));
      alert('สำเร็จ');
      await dispatch(actions.roletypeGet(id));
    } catch (error) {
      console.log(error);
    }
  };
  if (roletype.isLoading || roletype.rows) {
    return <Loading />;
  }
  if (!roletype.isLoading && roletype.isCompleted) {
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
              <RoleTypeForm
                errors={errors}
                roletype={roletype}
                control={control}
                Controller={Controller}
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

EditRoleType.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditRoleType.defaultProps = {
  title: '',
  subtitle: '',
};
