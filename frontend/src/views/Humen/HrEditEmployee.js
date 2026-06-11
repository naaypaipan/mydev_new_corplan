import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Card, Button } from '@mui/material';
import { useParams } from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import * as actions from '../../redux/actions';
import { BackButton } from '../../components/Button';
import { EmployeeForm } from '../../components/Forms';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

import { Scanner } from '@yudiel/react-qr-scanner';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
};

export default function HrEditEmployee({ title, subtitle }) {
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
      department: department.id,
      role: roletype.id,
      phone_number: employee.phone_number,
      check_key: employee?.check_key,
    },
  });
  const [open, setOpen] = React.useState(false);
  const [qr, setQr] = React.useState(employee?.check_key);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.employeeGet(id));
    dispatch(actions.roletypeAll(''));
    dispatch(actions.departmentAll({}));
    return () => { };
  }, []);

  useEffect(() => {
    setQr(employee?.check_key);
    return () => { };
  }, [employee]);

  const handleScan = async (data) => {
    setQr(data);
    setOpen(false);
    setValues('check_key', data);
    // console.log(data);
  };



  const renderQrCode = () => (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            scan qr code
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <div>
              <Scanner
                onScan={(results) => handleScan(results?.[0]?.rawValue)}
                allowMultiple
              />
            </div>
          </Typography>
        </Box>
      </Modal>
    </div>
  );

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
        payload.image = {
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

        {renderQrCode()}
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
                handleOpen={handleOpen}
                qr={qr}
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
HrEditEmployee.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

HrEditEmployee.defaultProps = {
  title: '',
  subtitle: '',
};
