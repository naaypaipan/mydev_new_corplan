
import { React, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import { useForm, Controller } from 'react-hook-form';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import {
  Box,
  Button,
  Card,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import dayjs from 'dayjs';
import AddpayoutForm from 'components/Forms/AddpayoutForm';
import AddpayinForm from 'components/Forms/AddpayinForm';
import ConfirmPayForm from 'components/Forms/ConfirmPayForm';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',

  bgcolor: 'background.paper',

  boxShadow: 24,
  p: 4,
};

export default function BillingDetail({ title, subtitle }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const billing = useSelector((state) => state.billing);
  const payin = useSelector((state) => state.payin);
  const me = useSelector((state) => state.me);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [paidType, setPaidType] = useState('TRANSFER');
  const [dateConfirm, setDateConfirm] = useState(new Date());
  const [openModalConfirm, setOpenModalConfirm] = useState(false);

  useEffect(() => {
    dispatch(actions.billingGet(id));
    dispatch(actions.payinAll({ bill: id }));
    return () => {};
  }, []);

  const handleDelete = async () => {
    const confirm = window.confirm('ลบข้อมูล');
    if (confirm) {
      await dispatch(actions.billingDelete(id));
      history.goBack();
    }
  };

  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึกข้อมูล');
    if (confirm) {
      const dataSubmit = {
        ...data,
        paidType,
        date,
        employee: me?.userData?._id,
        billing: id,
      };
      await dispatch(actions.payinCreate(dataSubmit));
      await dispatch(actions.payinAll({ bill: id }));

      reset();
      handleClose();
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenModalConfirm = () => setOpenModalConfirm(true);
  const handleCloseModalConfirm = () => setOpenModalConfirm(false);


  const renderDetail = () => (
    <div>
      <Card>
        <div className="p-4">
          <div className="flex gap-2">
            <h2 className="font-bold lg:text-xl ">
              Invoice number : {billing?.invoice_number}{' '}
            </h2>
            <div>
              {/* <IconButton
                aria-label="delete"
                size="small"
                // onClick={() => handleEdit(e._id)}
              >
                <ModeEditIcon fontSize="inherit" />
              </IconButton> */}
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => handleDelete()}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </div>
          </div>
          <div>Project : {billing?.project_id?.name} </div>
          <div>Customer : {billing?.customer?.name} </div>
          <div>
            Grand Total :{' '}
            {billing?.price?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}{' '}
          </div>
          <div>Date : {dayjs(billing?.date).format('DD/MM/YYYY')} </div>
          <div>Due Date : {dayjs(billing?.date_due).format('DD/MM/YYYY')} </div>
          <div>
            Confirm Date : {dayjs(billing?.date_confirm).format('DD/MM/YYYY')}{' '}
          </div>
          <div>
            <Button
              variant="contained"
              onClick={() => handleOpenModalConfirm()}
            >
              confirm
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
  const renderModalAddPayment = () => (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          ></Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AddpayinForm
              control={control}
              Controller={Controller}
              date={date}
              setDate={setDate}
              paidType={paidType}
            />
          </form>
        </Box>
      </Modal>
    </div>
  );

  const handleConfirmButton = async () => {
    const confirm = window.confirm('confirm');
    if (confirm) {
      await dispatch(actions.billingPut(id, { date_confirm: dateConfirm }));
      await dispatch(actions.payinAll({ bill: id }));
    }
  };

  const renderModalConfirm = () => (
    <div>
      <Modal
        open={openModalConfirm}
        onClose={handleCloseModalConfirm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          ></Typography>

          <ConfirmPayForm
            dateConfirm={dateConfirm}
            setDateConfirm={setDateConfirm}
          />
          <div className="flex justify-center">
            <Button variant="contained" onClick={() => handleConfirmButton()}>
              save
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );

  const renderPayment = () => (
    <div>
      <div className="p-2 flex ">
        <div className="text-xl">Payment</div>
        <div className="px-2">
          <Button size="small" variant="contained" onClick={() => handleOpen()}>
            Add payment
          </Button>
        </div>
      </div>

      {!_.isEmpty(payin?.rows) ? (
        _.map(payin?.rows, (e) => (
          <div className="px-1 py-1">
            <Card>
              <div className="flex">
                <div className="p-2">
                  <div>Payment Date {dayjs(e?.date).format('DD/MM/YYYY')}</div>
                  <div>
                    Accept Total{' '}
                    {e?.price?.toFixed(2)?.replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </div>
                  <div>Method : {e?.paidType}</div>
                  <div>Remark : {e?.remark || '-'}</div>
                </div>
                <div className="py-1">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => handleDeletePay(e._id)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </div>
            </Card>
          </div>
        ))
      ) : (
        <div className="px-1 py-1">
          <Card>
            <div className="p-2">Waiting for payment</div>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {renderDetail()}
      {renderPayment()}
      {renderModalAddPayment()}
      {renderModalConfirm()}
    </div>
  );
}
