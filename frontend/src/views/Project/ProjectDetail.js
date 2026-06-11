
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Box,
  Modal,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  IconButton,
  Avatar,
  Typography,
  Grid,
  Stack,
  Tooltip,
  LinearProgress,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { BudgetForm } from 'components/Forms';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import BudgetTable from 'components/Table/BudgetTable';
import { BackButton } from 'components/Button';
import {
  useNavigate,
  useHistory,
} from 'react-router-dom/cjs/react-router-dom.min';

import { ExpensesTableProject } from '../../components/Table';
import Loading from 'components/Loading';
import { DeliverForm } from '../../components/Forms';
import dayjs from 'dayjs';
import { BillingForm } from 'components/Forms';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CheckInlist from 'components/Table/CheckInlist';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CSVUploadModal } from '../../components/Modal';
import BudgetListTable from 'components/Table/BudgetListTable';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetailsCard = ({ project, handlePo, history, id }) => {
  return (
    <Card className="overflow-hidden">
      {/* Header Section */}
      <Box className="bg-gradient-to-r from-theme-400 to-theme-600 p-6">
        <Box className="flex justify-between items-center">
          <Box className="flex items-center gap-4">
            <Box>
              <Typography variant="h6" className="text-white font-bold">
                {project?.project_number}
              </Typography>
              <Typography variant="subtitle1" className="text-white/80">
                {project?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => history.push(`/project/project/edit/${id}`)}
            className="bg-white/10 hover:bg-white/20"
          >
            <ModeEditIcon className="text-white" />
          </IconButton>
        </Box>
      </Box>

      {/* Content Section */}
      <Box className="p-6">
        <Grid container spacing={4}>
          {/* Project Details */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  ลูกค้า
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {project?.customer || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  สถานที่
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {project?.place || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  วิศวกรโครงการ
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {project?.engineer?.firstname} {project?.engineer?.lastname}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Financial Details */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  มูลค่าการงานทั้งสิ้น
                </Typography>
                <Typography variant="h6" className="font-semibold">
                  ฿
                  {(project?.cost + (project?.vat || 0))
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  งบประมาณ
                </Typography>
                <Typography variant="h6" className="font-semibold">
                  ฿
                  {project?.total_budget
                    ?.toFixed(2)
                    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary" variant="caption">
                  ผลกำไรที่คาดการณ์
                </Typography>
                <Box className="flex items-center gap-2">
                  <Typography
                    variant="h6"
                    className="font-semibold text-emerald-600"
                  >
                    ฿
                    {project?.estprofit
                      ?.toFixed(2)
                      ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                  </Typography>
                  <Chip
                    label={`${project?.percentage?.toFixed(2) || 0}%`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Status Section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="caption"
                >
                  สถานะโครงการ
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Box className="flex-1">
                    <Typography variant="caption" display="block" gutterBottom>
                      สถานะ PO
                    </Typography>
                    {project?.po_status ? (
                      <Chip
                        label="ได้รับแล้ว"
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Checkbox
                        size="small"
                        checked={project?.po_status}
                        onChange={(e) => handlePo(e.target.checked)}
                        color="success"
                      />
                    )}
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="caption" display="block" gutterBottom>
                      ส่งมอบงาน
                    </Typography>
                    {project?.deliver_status?.status ? (
                      <Tooltip
                        title={dayjs(project?.deliver_status?.date).format(
                          'DD MMM YYYY',
                        )}
                      >
                        <Chip label="ส่งมอบแล้ว" color="success" size="small" />
                      </Tooltip>
                    ) : (
                      <Chip label="รอดำเนินการ" color="warning" size="small" />
                    )}
                  </Box>
                  <Box className="flex-1">
                    <Typography variant="caption" display="block" gutterBottom>
                      การออกบิล
                    </Typography>
                    {!_.isEmpty(project?.billing) ? (
                      <Chip label="สำเร็จ" color="success" size="small" />
                    ) : (
                      <Chip label="รอดำเนินการ" color="warning" size="small" />
                    )}
                  </Box>
                </Stack>
              </Box>

              <Box className="mt-4">
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(project)}
                  sx={{ height: 8, borderRadius: 2 }}
                  color="success"
                />
                <Typography
                  variant="caption"
                  color="textSecondary"
                  className="mt-1"
                >
                  ความคืบหน้าของโครงการ
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

// Helper function to calculate project progress
const calculateProgress = (project) => {
  let progress = 0;
  if (project?.po_status) progress += 33;
  if (project?.deliver_status?.status) progress += 33;
  if (!_.isEmpty(project?.billing)) progress += 34;
  return progress;
};

export default function ProjectDetail({ title, subtitle }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  const project = useSelector((state) => state.project);
  const budget = useSelector((state) => state.budget);
  const timestamp = useSelector((state) => state.timestamp);
  const info = useSelector((state) => state.info);
  const me = useSelector((state) => state.me);

  // const labor = project?.labur_cost - timestamp?.totalLabor;

  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [value1, setValue1] = React.useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [poStatus, setPostatus] = useState(project?.po_status);
  const [openDeliver, setOpenDeliver] = React.useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [openBilling, setOpenBilling] = React.useState(false);
  const [dateDeliver, setDateDeliver] = useState(null);
  const [datePayment, setDatePayment] = useState(null);
  const [dateBilling, setDateBilling] = useState(null);
  const [dueDateBilling, setDueDateBilling] = useState(null);
  const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(
    project?.time_tracking_enabled || false,
  );
  const [timeTrackingLinkEnabled, setTimeTrackingLinkEnabled] = useState(
    project?.time_tracking_link_enabled !== false,
  );
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const handleCSVOpen = () => setCsvUploadOpen(true);
  const handleCSVClose = () => {
    setCsvUploadOpen(false);
    setCsvData([]);
  };

  const handleChange = (event, newValue) => {
    setValue1(newValue);
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const handleOpenDeliver = () => setOpenDeliver(true);
  const handleCloseDeliver = () => setOpenDeliver(false);

  const handleOpenPayment = () => setOpenPayment(true);
  const handleClosePayment = () => setOpenPayment(false);

  const handleOpenBilling = () => setOpenBilling(true);
  const handleCloseBilling = () => setOpenBilling(false);

  const calculateLaborPercentage = (actualLabor, budgetedLabor) => {
    if (!budgetedLabor || budgetedLabor === 0) return 0;
    return (actualLabor / budgetedLabor) * 100;
  };

  // const renderBackButton = () => <BackButton />;

  useEffect(() => {
    dispatch(actions.projectGet(id));
    dispatch(actions.getInformation());
    dispatch(actions.budgetAll({ project_id: id }));
    dispatch(actions.timestampAll({ project_id: id }));
    dispatch(actions.meGet());
    return () => {};
  }, [open, openEdit]);

  useEffect(() => {
    setPostatus(project?.po_status);
    return () => {};
  }, [project, budget]);

  useEffect(() => {
    setTimeTrackingEnabled(project?.time_tracking_enabled || false);
    setTimeTrackingLinkEnabled(project?.time_tracking_link_enabled !== false);
  }, [project]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    const confirm = window.confirm('บันทึก');
    if (confirm) {
      const dataSubmit = {
        ...data,
        project_id: id,
      };

      try {
        await dispatch(actions?.budgetCreate(dataSubmit));
        dispatch(actions?.projectGet(id));
        reset();
        handleClose();
      } catch (error) {
        window.alert('มีรหัสงบประมาณนี้ในระบบแล้ว');
      } finally {
      }

      // history.goBack();
    }
  };

  const onSubmitEdit = async (data) => {
    const confirm = window.confirm('บันทึก');
    if (confirm) {
      const dataSubmit = {
        ...data,
        project_id: id,
      };
      try {
        await dispatch(actions?.budgetPut(data.id, dataSubmit));

        dispatch(actions?.projectGet(id));
        reset();
        handleCloseEdit();
      } catch (error) {
        window.alert('มีรหัสงบประมาณนี้ในระบบแล้ว');
      } finally {
        // reset();
        // handleCloseEdit();
      }
    }
  };

  const handlePo = async (e) => {
    const confirm = window.confirm('ไดรับ PO');
    if (confirm) {
      await dispatch(actions?.projectPut(id, { po_status: e }));
      await dispatch(actions?.projectGet(id));
    }
  };

  const handleDeleteBudget = async (item) => {
    if (!_.isEmpty(item?.expenses)) {
      return alert('ไม่สามารถลบงบประมาณที่มีรายการค่าใช้จ่ายผูกอยู่ได้');
    } else {
      const confirm = window.confirm('delete');
      if (confirm) {
        await dispatch(actions?.budgetDelete(item?.id));
        await dispatch(actions.projectGet(id));
        await dispatch(actions.budgetAll({ project_id: id }));
      }
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('ลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.expensesDelete(id));
        dispatch(actions.expensesAll({}));
      } catch (error) {}
    }
  };

  const handleEdit = (id) => {
    history.push(`/finance/expenses/edit/${id}`);
  };

  const handleApprove = async (id) => {
    await dispatch(
      actions.expensesPut(id, {
        status: 'APPROVE',
        approval_actor: me?.userData?.id,
        approval_actor_name: `${me?.userData?.firstname || ''} ${
          me?.userData?.lastname || ''
        }`.trim(),
      }),
    );
    dispatch(actions.expensesAll({}));
  };
  const handleSuccess = async (id) => {
    await dispatch(actions.expensesPut(id, { status: 'SUCCESS' }));
    dispatch(actions.expensesAll({}));
  };

  const handleEditBudget = (data) => {
    handleOpenEdit();
    setValue('budget_number', data?.budget_number);
    setValue('name', data?.name);
    setValue('cost', data?.cost);
    setValue('id', data?.id);
  };

  const handleAddFromFile = async () => {
    if (!_.isEmpty(csvData)) {
      const data = { arr: csvData, project_id: id };
      try {
        await dispatch(actions.budgetCreate(data));
        alert('สำเร็จ');
        handleCSVClose();
        await dispatch(actions.budgetAll({ project_id: id }));
      } catch (error) {
        alert('เพิ่มไม่สำเร็จ');
        console.error(error);
      }
    } else {
      alert('ไม่สามารถอ่านไฟล์รายการได้');
    }
  };

  const renderCSVUploadModal = () => (
    <CSVUploadModal
      csvData={csvData}
      setCsvData={setCsvData}
      fileTemplateURL="/filetemplate/Employee.csv"
      handleAddFromFile={handleAddFromFile}
      handleClose={handleCSVClose}
      isOpen={csvUploadOpen}
      titleName="รายการบัดเจ็ทจากไฟล์ CSV"
      header={0}
      // typeRows={department}
      anotherComponent={<div></div>}
    />
  );

  const handleDeliver = async (data) => {
    if (!dateDeliver) {
      return alert('เลือกวันที่ส่งมอบงาน');
    } else {
      const confirm = window.confirm('ยืนยันข้อมูล');
      if (confirm) {
        await dispatch(
          actions.projectPut(id, {
            deliver_status: { status: true, date: dateDeliver },
            operation_status: 'DELIVERY',
          }),
        );
        await dispatch(actions.projectGet(id));
        handleCloseDeliver();
      }
    }
  };

  const handlePayment = async (data) => {
    if (!datePayment) {
      return alert('เลือกวันที่ชำระเงิน');
    } else {
      const confirm = window.confirm('confirm');
      if (confirm) {
        await dispatch(
          actions.projectPut(id, {
            payment_status: { status: true, date: datePayment },
            operation_status: 'COMPLETE',
          }),
        );
        await dispatch(actions.projectGet(id));
        handleClosePayment();
      }
    }
  };

  const handleBilling = async (data) => {
    if (!dueDateBilling) {
      return alert('เลือกวันครบกำหนด');
    } else {
      const confirm = window.confirm('confirm');
      if (confirm) {
        await dispatch(
          actions.projectPut(id, {
            acc_status: {
              status: true,
              date: dateBilling,
              due: dueDateBilling,
            },
            operation_status: 'BILLING',
          }),
        );
        await dispatch(actions.projectGet(id));
        handleCloseBilling();
      }
    }
  };

  const handleToggleTimeTracking = async (checked) => {
    const newStatus = checked;
    const confirm = window.confirm(
      newStatus
        ? 'เปิดการลงเวลาผ่านหน้า Profile พนักงานสำหรับโปรเจคนี้?'
        : 'ปิดการลงเวลาผ่านหน้า Profile พนักงานสำหรับโปรเจคนี้?',
    );

    if (confirm) {
      try {
        await dispatch(
          actions.projectPut(id, { time_tracking_enabled: newStatus }),
        );
        setTimeTrackingEnabled(newStatus);
        await dispatch(actions.projectGet(id));
      } catch (error) {
        console.error('Failed to update time tracking status:', error);
      }
    }
  };

  const handleToggleTimeTrackingLink = async (checked) => {
    const confirmMsg = checked
      ? 'เปิดให้ลงเวลาผ่านลิงก์ Manpower สำหรับโปรเจคนี้?'
      : 'ปิดการลงเวลาผ่านลิงก์ Manpower (ลงได้เฉพาะหน้า Profile เท่านั้น)?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await dispatch(
        actions.projectPut(id, { time_tracking_link_enabled: checked }),
      );
      setTimeTrackingLinkEnabled(checked);
      await dispatch(actions.projectGet(id));
    } catch (error) {
      console.error('Failed to update link time tracking:', error);
    }
  };

  const renderModal = () => (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <BudgetForm Controller={Controller} control={control} />{' '}
            <div className="flex justify-center">
              <Button variant="contained" type="submit" size="small">
                บันทึก
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );

  const renderModalDeliver = () => (
    <div>
      <Modal
        open={openDeliver}
        onClose={handleCloseDeliver}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(handleDeliver)}>
            <DeliverForm
              dateDeliver={dateDeliver}
              setDateDeliver={setDateDeliver}
              title={'ส่งมอบงาน'}
            />{' '}
            <div className="flex justify-center">
              <Button variant="contained" type="submit" size="small">
                บันทึก
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
  const link = `${info?.url}/manpower/timestamp/${id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
  };

  const renderModalBilling = () => (
    <div>
      <Modal
        open={openBilling}
        onClose={handleCloseBilling}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            width: 480,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            จัดการการลงเวลา
          </Typography>

          {!timeTrackingEnabled && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ปิดการลงเวลาผ่าน Profile — พนักงานจะไม่เห็นโครงการนี้ในหน้าลงเวลา
            </Alert>
          )}
          {!timeTrackingLinkEnabled && (
            <Alert severity="info" sx={{ mb: 2 }}>
              ปิดลิงก์ Manpower — ลงเวลาได้เฉพาะผ่านหน้า Profile เท่านั้น
            </Alert>
          )}

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ลงเวลาผ่านหน้า Profile
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={timeTrackingEnabled}
                onChange={(e) => handleToggleTimeTracking(e.target.checked)}
                color="success"
              />
            }
            label={timeTrackingEnabled ? 'เปิด' : 'ปิด'}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ลงเวลาผ่านลิงก์ Manpower
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={timeTrackingLinkEnabled}
                onChange={(e) =>
                  handleToggleTimeTrackingLink(e.target.checked)
                }
                color="primary"
              />
            }
            label={timeTrackingLinkEnabled ? 'เปิด' : 'ปิด'}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ลิงก์สำหรับลงเวลา
          </Typography>

          {!timeTrackingLinkEnabled ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              เปิด &quot;ลงเวลาผ่านลิงก์&quot; ด้านบนเพื่อใช้งานลิงก์นี้
            </Typography>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <TextField
                  value={link}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleCopyLink}
                          size="small"
                          color="primary"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleCopyLink}
                size="small"
                fullWidth
                startIcon={<ContentCopyIcon />}
              >
                คัดลอกลิงก์
              </Button>
            </>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseBilling} size="small">
              ปิด
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );

  const renderModalPayment = () => (
    <div>
      <Modal
        open={openPayment}
        onClose={handleClosePayment}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(handlePayment)}>
            <DeliverForm
              dateDeliver={datePayment}
              setDateDeliver={setDatePayment}
              title={'ชำระเงินเสร็จสิ้น'}
            />{' '}
            <div className="flex justify-center">
              <Button variant="contained" type="submit" size="small">
                บันทึก
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );

  const renderModalEdit = () => (
    <div>
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              แก้ไขงบประมาณ
            </Typography>
            <BudgetForm Controller={Controller} control={control} />{' '}
            <div className="flex justify-center">
              <Button variant="contained" type="submit" size="small">
                บันทึก
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );

  const renderTimestamp = () => <CheckInlist timestamp={timestamp} />;

  const renderBudget = () => (
    <Card>
      <div>
        <Box>
          <Tabs
            value={value1}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="แดชบอร์ด" {...a11yProps(0)} />
            <Tab label="งบประมาณ" {...a11yProps(1)} />
            <Tab label="ค่าใช้จ่าย" {...a11yProps(2)} />
            <Tab label="ลงเวลา" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value1} index={0}>
          <div>
            <BudgetTable
              budget={budget?.rows}
              handleEditBudget={handleEditBudget}
              handleDeleteBudget={handleDeleteBudget}
            />
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value1} index={1}>
          <div>
            <div className="flex justify-end gap-2">
              <div>
                <Button variant="contained" onClick={handleOpen} size="small">
                  เพิ่มงบประมาณ
                </Button>
              </div>
              <div>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={handleCSVOpen}
                  color="success"
                  size="small"
                >
                  นำเข้าข้อมูล
                </Button>
              </div>
            </div>
            <div>{renderBudgetListTable()}</div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value1} index={2}>
          {renderTable()}
        </CustomTabPanel>
        <CustomTabPanel value={value1} index={3}>
          {renderTimestamp()}
        </CustomTabPanel>
      </div>
    </Card>
  );

  const renderDailCard = () => (
    <ProjectDetailsCard
      project={project}
      handlePo={handlePo}
      history={history}
      id={id}
    />
  );

  const renderAnalyze = () => (
    <Box className="py-2">
      <Card elevation={0} className="overflow-hidden">
        {/* Content */}
        <Box className="p-1">
          <Grid container spacing={3}>
            {/* Budget & Labor Section */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box className="bg-orange-50 p-4 rounded-lg">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    งบประมาณทั้งหมด
                  </Typography>
                  <Typography
                    variant="h5"
                    className="text-orange-600 font-bold"
                  >
                    ฿
                    {project?.total_budget
                      ?.toFixed(2)
                      ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box className="bg-orange-50 p-4 rounded-lg">
                    <Typography color="text.secondary" gutterBottom>
                      งบประมาณค่าแรงงาน
                    </Typography>
                    <Typography variant="h5" className="text-orange-600">
                      ฿
                      {project?.labur_cost
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                    </Typography>
                  </Box>
                  <Box className="bg-orange-50 p-4 rounded-lg">
                    <Typography color="text.secondary" gutterBottom>
                      ประเมินค่าแรงงาน
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5" className="text-orange-600">
                        ฿
                        {timestamp?.totalLabor
                          ?.toFixed(2)
                          ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                      </Typography>

                      <Chip
                        label={`${calculateLaborPercentage(
                          timestamp?.totalLabor,
                          project?.labur_cost,
                        )?.toFixed(1)}% (${
                          project?.labur_cost || 0 - timestamp?.totalLabor
                        })`}
                        color={
                          calculateLaborPercentage(
                            timestamp?.totalLabor,
                            project?.labur_cost,
                          ) > 100
                            ? 'error'
                            : 'success'
                        }
                        size="small"
                        className="bg-orange-100"
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            {/* Expenses Section */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box className="bg-orange-50 p-4 rounded-lg">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    ค่าใช้จ่ายทั้งหมด
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h5" className="text-orange-600">
                      ฿
                      {project?.total_expenses
                        ?.toFixed(2)
                        ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                    </Typography>
                    <Chip
                      label={`${
                        project?.expenses_percentage?.toFixed(2) || 0
                      }%`}
                      color="warning"
                      size="small"
                      className="bg-orange-100"
                    />
                  </Stack>
                </Box>

                {/* Profit Section */}
                <Box className="bg-orange-50 p-4 rounded-lg">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    การวิเคราะห์กำไร
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="h5"
                          className={`font-bold ${
                            project?.realprofit > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          ฿
                          {project?.realprofit
                            ?.toFixed(2)
                            ?.replace(/\d(?=(\d{3})+\.)/g, '$&,') || 0}
                        </Typography>
                        <Chip
                          label={`${
                            project?.real_percentage?.toFixed(2) || 0
                          }%`}
                          color="warning"
                          size="small"
                          className="bg-orange-100"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        กำไรทั้งหมด
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box className="mt-6">
            <LinearProgress
              variant="determinate"
              value={(project?.total_expenses / project?.total_budget) * 100}
              sx={{
                height: 8,
                borderRadius: 2,
                backgroundColor: 'rgba(251, 146, 60, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#fb923c',
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              className="mt-1"
            >
              การใช้งบประมาณ
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );

  const renderButton = () => (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          {/* ส่วนของ Time Tracking Toggle */}
          <Card variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor:
                      timeTrackingEnabled || timeTrackingLinkEnabled
                        ? 'success.main'
                        : 'action.disabledBackground',
                    width: 40,
                    height: 40,
                  }}
                >
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    การลงเวลาสำหรับโปรเจคนี้
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profile: {timeTrackingEnabled ? 'เปิด' : 'ปิด'} · ลิงก์:{' '}
                    {timeTrackingLinkEnabled ? 'เปิด' : 'ปิด'}
                  </Typography>
                </Box>
              </Stack>
              <Stack alignItems="flex-end" spacing={0.5}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={timeTrackingEnabled}
                      onChange={(e) =>
                        handleToggleTimeTracking(e.target.checked)
                      }
                      color="success"
                      size="small"
                    />
                  }
                  label="Profile"
                  labelPlacement="start"
                  sx={{ mr: 0, ml: 0 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={timeTrackingLinkEnabled}
                      onChange={(e) =>
                        handleToggleTimeTrackingLink(e.target.checked)
                      }
                      color="primary"
                      size="small"
                    />
                  }
                  label="ลิงก์"
                  labelPlacement="start"
                  sx={{ mr: 0, ml: 0 }}
                />
              </Stack>
            </Stack>

            {timeTrackingLinkEnabled && (
              <>
                <Divider sx={{ my: 2 }} />
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">ลิงก์สำหรับลงเวลา</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleOpenBilling}
                    startIcon={<AccessTimeIcon fontSize="small" />}
                  >
                    จัดการลิงก์
                  </Button>
                </Stack>
              </>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                variant="contained"
                onClick={handleOpenDeliver}
                size="small"
                color="primary"
              >
                ส่งมอบงาน
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTable = () => (
    <ExpensesTableProject
      expenses={project?.expenses}
      page={page}
      size={size}
      setPage={setPage}
      setSize={setSize}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      filter={project?.expenses}
      handleApprove={handleApprove}
      handleSuccess={handleSuccess}
    />
  );

  const renderBudgetListTable = () => (
    <div>
      <BudgetListTable
        budget={budget?.rows}
        handleEditBudget={handleEditBudget}
        handleDeleteBudget={handleDeleteBudget}
      />
    </div>
  );


  if (!project?.isLoading && project?.isCompleted) {
    return (
      <div>
        {renderModalEdit()}
        {renderModalDeliver()}
        {renderModalPayment()}
        {renderModalBilling()}
        {renderModal()}
        {renderCSVUploadModal()}


        <div>{renderDailCard()}</div>
        <div>{renderAnalyze()}</div>
        <div>{renderButton()}</div>
        <div>{renderBudget()}</div>
      </div>
    );
  }
  if (project?.isLoading && !project?.isCompleted) {
    return <Loading isLoading />;
  }
  return <Loading isLoading />;
}
