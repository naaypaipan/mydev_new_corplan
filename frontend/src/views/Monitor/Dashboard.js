import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import { ChevronDown, ChevronUp } from 'react-feather';

export default function Dashboard({ title, subtitle }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions?.projectAll({}));
    return () => {};
  }, []);



  return (
    <div>
      <div className="flex flex-row justify-start pb-4"></div>
      <div>Content Go Here!</div>
    </div>
  );
}

Dashboard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Dashboard.defaultProps = {
  title: '',
  subtitle: '',
};
