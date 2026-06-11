import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';

import {
  Box,
  Chip,
  useTheme,
  Modal,
  Fade,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Grid,
  TextField,
  Autocomplete,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import OtEditCard from '../../components/Card/OtEditCard';
import EditOTListTable from '../../components/Table/EditOTListTable';
import EditOtForm from 'components/Forms/EditOtForm';
import CalOthour from '../../utils/functions/CalOthour';

export default function EditOt({ title, subtitle }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const otRequestOrder = useSelector((state) => state.otRequestOrder);
  const timestamp = useSelector((state) => state.timestamp);

  const [rate, setRate] = useState(1.5);
  const [openModal, setOpenModal] = useState(false);
  const [openPersonModal, setOpenPersonModal] = useState(false);
  const [openAddPersonModal, setOpenAddPersonModal] = useState(false);
  const [formData, setFormData] = useState({
    startTime: null,
    endTime: null,
    totalHours: 0,
    rate: 1.5,
    totalPrice: 0,
    description: '',
    data_id: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addFormData, setAddFormData] = useState({
    startTime: dayjs().hour(17).minute(0),
    endTime: dayjs().hour(20).minute(0),
    totalHours: 0,
    rate: 1.5,
    totalPrice: 0,
    description: '',
  });

  useEffect(() => {
    dispatch(actions.otRequestOrderGet(id));
    return () => {};
  }, [dispatch, id]);

  useEffect(() => {
    if (otRequestOrder) {
      setFormData({
        startTime: otRequestOrder?.startTime
          ? dayjs(otRequestOrder.startTime)
          : null,
        endTime: otRequestOrder?.endTime ? dayjs(otRequestOrder.endTime) : null,
        totalHours: otRequestOrder?.total_hours || 0,
        rate: otRequestOrder?.rate || 1.5,
        totalPrice: otRequestOrder?.total_price || 0,
        description: otRequestOrder?.description || '',
      });
      setRate(otRequestOrder?.rate || 1.5);

      // Fetch timestamp data
      if (otRequestOrder?.date && otRequestOrder?.project?._id) {
        dispatch(
          actions.timestampAll({
            dateStart: dayjs(otRequestOrder.date).startOf('day').toISOString(),
            dateEnd: dayjs(otRequestOrder.date).endOf('day').toISOString(),
            project_id: otRequestOrder?.project?._id,
          }),
        );
      }
    }
  }, [otRequestOrder, dispatch]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenPersonModal = () => setOpenPersonModal(true);
  const handleClosePersonModal = () => setOpenPersonModal(false);

  const handleOpenAddPersonModal = () => {
    setSelectedEmployee(null);
    setAddFormData({
      startTime: dayjs().hour(17).minute(0),
      endTime: dayjs().hour(20).minute(0),
      rate: otRequestOrder?.rate || 1.5,
      description: otRequestOrder?.description || '',
    });
    setOpenAddPersonModal(true);
  };
  const handleCloseAddPersonModal = () => setOpenAddPersonModal(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // คำนวณชั่วโมงและราคาใหม่เมื่อเปลี่ยนเวลา
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value : formData.startTime;
      const end = field === 'endTime' ? value : formData.endTime;

      if (start && end) {
        const hours = CalOthour(start, end);
        const price =
          hours * (otRequestOrder?.employee?.salary?.hour || 0) * formData.rate;

        setFormData((prev) => ({
          ...prev,
          totalHours: hours.toFixed(2),
          totalPrice: price,
        }));
      }
    }

    // คำนวณราคาใหม่เมื่อเปลี่ยน rate
    if (field === 'rate') {
      const price =
        formData.totalHours *
        (otRequestOrder?.employee?.salary?.hour || 0) *
        value;
      setFormData((prev) => ({
        ...prev,
        totalPrice: price,
      }));
    }
  };

  const handleAddFormChange = (field, value) => {
    setAddFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // คำนวณชั่วโมงและราคาใหม่เมื่อเปลี่ยนเวลา
      if (field === 'startTime' || field === 'endTime') {
        const start = field === 'startTime' ? value : prev.startTime;
        const end = field === 'endTime' ? value : prev.endTime;

        if (start && end) {
          const hours = CalOthour(start, end);
          const price =
            hours * (selectedEmployee?.salary?.hour || 0) * newData.rate;

          newData.totalHours = hours.toFixed(2);
          newData.totalPrice = price;
        }
      }

      // คำนวณราคาใหม่เมื่อเปลี่ยน rate
      if (field === 'rate') {
        const hours = parseFloat(prev.totalHours || 0);
        const price = hours * (selectedEmployee?.salary?.hour || 0) * value;
        newData.totalPrice = price;
      }

      return newData;
    });
  };

  // console.log('add', addFormData);

  const handleSubmit = async () => {
    const data = {
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
      total_hours: formData.totalHours,
      rate: formData.rate,
      total_price: formData.totalPrice,
      description: formData.description,
    };

    await dispatch(actions.otRequestOrderPut(id, data));
    dispatch(actions.otRequestOrderGet(id));
    handleCloseModal();
  };

  const handleEdit = (data) => {
    setFormData({
      startTime: data?.startTime ? dayjs(data.startTime) : null,
      endTime: data?.endTime ? dayjs(data.endTime) : null,
      totalHours: data?.total_hours || 0,
      rate: data?.rate || 1.5,
      totalPrice: data?.total_price || 0,
      description: data?.description || '',
      data_id: data?._id || '',
    });
    setRate(data?.rate || 1.5);
    handleOpenPersonModal();
  };

  const handleSubmitEditPerson = async () => {
    const data = {
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
      total_hours: formData.totalHours,
      rate: formData.rate,
      total_price: formData.totalPrice,
      description: formData.description,
    };

    await dispatch(actions.otRequestPut(formData?.data_id, data));
    dispatch(actions.otRequestOrderGet(id));
    handleClosePersonModal();
  };
  // console.log(selectedEmployee);

  const handleSubmitAddPerson = async () => {
    if (!selectedEmployee) {
      alert('กรุณาเลือกพนักงาน');
      return;
    }

    const start = addFormData.startTime;
    const end = addFormData.endTime;
    const hours = CalOthour(start, end);
    const hourlyRate = selectedEmployee?.salary?.hr || 0;
    const totalPrice = hours * hourlyRate * addFormData.rate;

    const data = {
      order: id,
      timestamp: selectedEmployee?._id,
      employee: selectedEmployee?.employee?._id,
      employee_name: `${selectedEmployee?.employee?.firstname} ${selectedEmployee?.employee?.lastname}`,
      department: selectedEmployee?.employee?.department?.name || '',
      startTime: start?.toISOString(),
      endTime: end?.toISOString(),
      total_hours: hours,
      rate: addFormData.rate,
      total_price: totalPrice,
      description: addFormData.description,
      salary: selectedEmployee?.salary || {},
      project: selectedEmployee?.project_in || {},
      status: otRequestOrder?.status,
    };

    await dispatch(actions.otRequestCreate(data));
    dispatch(actions.otRequestOrderGet(id));
    handleCloseAddPersonModal();
  };

  const handleDeletePerson = async (dataId) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล?');
    if (confirm) {
      await dispatch(actions.otRequestDelete(dataId));
      dispatch(actions.otRequestOrderGet(id));
    }
  };

  // สร้างรายการพนักงานจาก timestamp ที่ยังไม่ได้เพิ่มใน OT
  const availableEmployees =
    timestamp?.rows?.filter((ts) => {
      return !otRequestOrder?.ot_lists?.some((ot) => ot?.timestamp === ts?._id);
    }) || [];

  const otTypes = [
    { value: 1, label: 'โอทีปกติ/เดินทาง', rate: '1x', color: 'primary' },
    {
      value: 1.5,
      label: 'โอทีวันปกติหลังเลิกงาน',
      rate: '1.5x',
      color: 'warning',
    },
    { value: 3, label: 'โอทีพิเศษ', rate: '3x', color: 'error' },
  ];

  // สร้าง options สำหรับเวลาแบบ interval 30 นาที
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // ฟังก์ชันแปลง string เป็น dayjs object
  const toDayjsTime = (str) => {
    const [hour, minute] = str.split(':');
    return dayjs().hour(Number(hour)).minute(Number(minute)).second(0);
  };

  const renderAddPersonModal = () => (
    <Modal
      open={openAddPersonModal}
      onClose={handleCloseAddPersonModal}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={openAddPersonModal}>
        <Card
          sx={{
            width: { xs: '95%', sm: '90%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonAddIcon />
                <Typography variant="h6" fontWeight={700}>
                  เพิ่มพนักงานเข้า OT
                </Typography>
              </Stack>
              <IconButton
                onClick={handleCloseAddPersonModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {/* เลือกพนักงาน */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={availableEmployees}
                    getOptionLabel={(option) =>
                      `${option?.employee?.firstname} ${option?.employee?.lastname} (${option?.employee?.department?.name})`
                    }
                    value={selectedEmployee}
                    onChange={(_, value) => setSelectedEmployee(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="เลือกพนักงาน"
                        required
                        size="small"
                        placeholder="พิมพ์เพื่อค้นหา"
                      />
                    )}
                    noOptionsText="ไม่มีพนักงานที่สามารถเพิ่มได้"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    เวลาทำงาน OT
                  </Typography>
                </Grid>

                {/* เวลาเริ่ม - สิ้นสุด */}
                <Grid item xs={6}>
                  <TextField
                    select
                    label="เวลาเริ่ม OT"
                    fullWidth
                    value={addFormData.startTime.format('HH:mm')}
                    onChange={(e) =>
                      handleAddFormChange(
                        'startTime',
                        toDayjsTime(e.target.value),
                      )
                    }
                    size="small"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    select
                    label="เวลาสิ้นสุด OT"
                    fullWidth
                    value={addFormData.endTime.format('HH:mm')}
                    onChange={(e) =>
                      handleAddFormChange(
                        'endTime',
                        toDayjsTime(e.target.value),
                      )
                    }
                    size="small"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* อัตรา OT */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>อัตรา OT</InputLabel>
                    <Select
                      value={addFormData.rate}
                      label="อัตรา OT"
                      onChange={(e) =>
                        handleAddFormChange('rate', e.target.value)
                      }
                    >
                      {otTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            width="100%"
                          >
                            <Typography variant="body2">
                              {type.label}
                            </Typography>
                            <Chip
                              label={type.rate}
                              size="small"
                              color={type.color}
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* หมายเหตุ */}
                <Grid item xs={12}>
                  <TextField
                    label="หมายเหตุ"
                    value={addFormData.description}
                    onChange={(e) =>
                      handleAddFormChange('description', e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="เหตุผลในการขอ OT"
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCloseAddPersonModal}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmitAddPerson}
                      disabled={!selectedEmployee}
                    >
                      เพิ่ม
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={openModal}>
        <Card
          sx={{
            width: { xs: '95%', sm: '90%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                แก้ไขข้อมูล OT
              </Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3 }}>
              <EditOtForm
                formData={formData}
                handleChange={handleChange}
                handleCloseModal={handleCloseModal}
                handleSubmit={handleSubmit}
              />
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  );

  const renderEditPersonModal = () => (
    <Modal
      open={openPersonModal}
      onClose={handleClosePersonModal}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={openPersonModal}>
        <Card
          sx={{
            width: { xs: '95%', sm: '90%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                แก้ไขข้อมูลรายบุคคล OT
              </Typography>
              <IconButton
                onClick={handleClosePersonModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3 }}>
              <EditOtForm
                formData={formData}
                handleChange={handleChange}
                handleCloseModal={handleClosePersonModal}
                handleSubmit={handleSubmitEditPerson}
              />
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  );

  const renderDetailCard = () => {
    return (
      <Box>
        <OtEditCard
          otRequestOrder={otRequestOrder}
          rate={rate}
          setRate={setRate}
          handleOpenModal={handleOpenModal}
          handleEdit={handleEdit}
        />
      </Box>
    );
  };

  const renderTableOtList = () => (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleOpenAddPersonModal}
          disabled={availableEmployees.length === 0}
        >
          เพิ่มพนักงาน
        </Button>
      </Stack>

      <EditOTListTable
        otRequestOrder={otRequestOrder}
        handleEdit={handleEdit}
        handleDeletePerson={handleDeletePerson}
      />
    </Box>
  );



  return (
    <div>


      <Box sx={{ mt: 3 }}>{renderDetailCard()}</Box>
      <Box sx={{ mt: 2 }}>{renderTableOtList()}</Box>
      {renderEditModal()}
      {renderEditPersonModal()}
      {renderAddPersonModal()}
    </div>
  );
}
