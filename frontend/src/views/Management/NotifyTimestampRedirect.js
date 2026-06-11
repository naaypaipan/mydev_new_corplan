import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, CardContent } from '@mui/material';
import PropTypes from 'prop-types';


import * as actions from '../../redux/actions';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';

function NotifyTimestampRedirect({ title, subtitle }) {
  const dispatch = useDispatch();

  const notify = useSelector((state) => state.notify);
  const info = useSelector((state) => state.info);
  const location = useLocation();
  const useQuery = () => new URLSearchParams(location?.search);
  const [error, setError] = useState();
  const query = useQuery();

  useEffect(() => {
    dispatch(actions.meGet());
    dispatch(actions.getInformation());
    return () => {};
  }, []);

  useEffect(() => {
    const tokenRequestPayload = {
      accessCode: query.get('code'),
      employeeId: query.get('state'),
    };

    console.log('Token Response Payload', tokenRequestPayload);
    const requestNotifyToken = async () => {
      try {
        if (tokenRequestPayload.accessCode && tokenRequestPayload.employeeId) {
          await dispatch(
            actions.requestNotifyTokenTimestamp(tokenRequestPayload),
          );
        } else {
          setError(
            'ไม่สามารถลงทะเบียนการแจ้งเตือนกับ Line Notify ได้ เนื่องจากข้อมูลที่ได้รับมาจาก Line Server อาจไม่ถูกต้อง',
          );
        }
      } catch (err) {
        console.error('Notify Request Token error', err);
        setError(err?.message?.toString());
      }
    };

    requestNotifyToken();
    return () => {};
  }, []);



  const renderNotifyStatus = () => {
    if (error) {
      return error;
    }
    if (notify?.isLoading) {
      return 'กำลังลงทะเบียนการใช้งานการแจ้งเตือน';
    }
    if (notify?.isCompleted) {
      return 'การลงทะเบียนการแจ้งเตือนเสร็จสิ้น';
    }
    return 'ลงทะเบียนการแจ้งเตือนไม่สำเร็จ';
  };

  if (info.isCompleted) {
    return (

      <div>
        <Card>
          <CardContent>
            <div className="my-2">
              <div className="text-lg text-center">{renderNotifyStatus()}</div>
              <div className="flex justify-center my-2">
                <Link to="/profile">
                  <Button color="primary" variant="contained">
                    กลับ
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Error message={error} />;
}

NotifyTimestampRedirect.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

NotifyTimestampRedirect.defaultProps = {
  title: '',
  subtitle: '',
};

export default NotifyTimestampRedirect;
