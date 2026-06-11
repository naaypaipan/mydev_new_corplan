import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';


import * as actions from '../../redux/actions';
import {} from '../../components/Forms';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';

function Notify({ title, subtitle }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.meGet());
    return () => {};
  }, []);



  const renderForm = () => (
    <form>
      <div className="flex flex-row justify-end gap-1 py-4">
        <Button variant="contained" type="submit">
          บันทึก
        </Button>
      </div>
    </form>
  );

  return (
    <div>

      {renderForm()}
    </div>
  );
}
Notify.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Notify.defaultProps = {
  title: '',
  subtitle: '',
};

export default Notify;
