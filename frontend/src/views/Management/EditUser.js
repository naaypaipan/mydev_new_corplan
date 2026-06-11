import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { UserForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';


export default function EditUser({ title, subtitle }) {
  const dispatch = useDispatch();
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const roletype = useSelector((state) => state.roletype);
  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      username: user.username,
    },
  });

  useEffect(() => {
    dispatch(actions.userGet(id));
    return () => {};
  }, []);



  const onSubmit = async (data) => {
    if (data.password === data.confirmPassword) {
      try {
        // eslint-disable-next-line no-param-reassign
        console.log('data ', data);
        await dispatch(actions.userPut(id, data));
        await dispatch(actions.userGet(id));
        alert('สำเร็จ');
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('กรุณาใส่รหัสผ่านให้ตรงกัน');
    }
  };
  if (user.isLoading || user.rows) {
    return <Loading />;
  }
  if (!user.isLoading && user.isCompleted) {
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
              <UserForm
                control={control}
                Controller={Controller}
                errors={errors}
                user={user}
                roletype={roletype}
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

EditUser.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

EditUser.defaultProps = {
  title: '',
  subtitle: '',
};
