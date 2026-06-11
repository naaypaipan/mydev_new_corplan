/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  Backdrop,
  Button,
  Card,
  Fade,
  Modal,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Container,
  alpha,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import PropTypes from 'prop-types';
import * as actions from '../../redux/actions';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

import Loading from '../../components/Loading';
import { Error } from '../../components/Error';

import PaytypeForm from 'components/Forms/PaytypeForm';
import dayjs from 'dayjs';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '500px',
  width: '95%',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 0,
  maxHeight: '90vh',
  overflow: 'auto',
};

const defaultValue = { name: '', description: '' };

export default function PayTypeList({ title, subtitle }) {
  const dispatch = useDispatch();
  const paytypes = useSelector((state) => state.paytypes);
  const history = useHistory();
  const theme = useTheme();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(30);
  const [total, setTotal] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    dispatch(actions.paytypeAll({ name, page, size }));
  }, [name, page, size]);

  useEffect(() => {
    setTotal(paytypes?.total);
    return () => {};
  }, [paytypes]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setName(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);



  const onSubmit = async (data) => {
    try {
      const dataSubmit = { ...data, date };
      await dispatch(actions.paytypeCreate(dataSubmit));
      reset(defaultValue);
      alert('สำเร็จ');
      handleClose();
      await dispatch(actions.paytypeAll({ name, page, size }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletepaytype = async (id) => {
    const confirm = window.confirm('ยืนยันการลบข้อมูล');
    if (confirm) {
      try {
        await dispatch(actions.paytypeDelete(id));
        await dispatch(actions.paytypeAll({ name, page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePushToEditpaytype = (id) => {
    history.push(`paytype/edit/${id}`);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const renderHeaderActions = () => (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="ค้นหาประเภทการชำระเงิน"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="พิมพ์ชื่อเพื่อค้นหา..."
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpen}
                sx={{ borderRadius: 2 }}
              >
                เพิ่มประเภทการชำระเงิน
              </Button>
            </Box>
          </Stack>
        </Box>
      </Card>
    </Box>
  );

  const renderModal = () => (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              เพิ่มประเภทการชำระเงิน
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.light, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.light, 0.2) },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <PaytypeForm
                control={control}
                Controller={Controller}
                errors={errors}
                paytypes={paytypes}
                date={date}
                setDate={setDate}
              />
              <Stack
                direction="row"
                spacing={1}
                justifyContent="flex-end"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  sx={{ borderRadius: 1.5 }}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SaveIcon />}
                  sx={{ borderRadius: 1.5 }}
                >
                  บันทึกข้อมูล
                </Button>
              </Stack>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
      }}
    >
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        ไม่พบข้อมูล
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ยังไม่มีข้อมูลประเภทการชำระเงินในระบบ
      </Typography>
      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpen}>
        เพิ่มประเภทการชำระเงิน
      </Button>
    </Box>
  );

  const renderTable = () => (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>
                  ลำดับ
                </TableCell>
                <TableCell width="70%" sx={{ fontWeight: 'bold' }}>
                  ชื่อประเภทการชำระเงิน
                </TableCell>
                <TableCell
                  width="20%"
                  align="center"
                  sx={{ fontWeight: 'bold' }}
                >
                  การจัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!_.isEmpty(paytypes.rows) ? (
                paytypes.rows.map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(theme.palette.action.hover, 0.03),
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={(page - 1) * size + index + 1}
                        size="small"
                        sx={{
                          fontWeight: 'medium',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {row.name}
                      </Typography>
                      {row.description && (
                        <Typography variant="caption" color="textSecondary">
                          {row.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ลบข้อมูล">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            handleDeletepaytype(row?._id);
                          }}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.15),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    {renderEmptyState()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 20, 30, 50, 100]}
          labelRowsPerPage="แสดงแถวละ:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} จาก ${count}`
          }
          count={total || 0}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={size}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', px: 1, mt: 1 }}
      >
        <Typography variant="caption" color="textSecondary">
          แสดงข้อมูลทั้งหมด {total || 0} รายการ
        </Typography>
        <Typography variant="caption" color="textSecondary">
          อัปเดทล่าสุด: {dayjs().format('DD/MM/YYYY HH:mm')}
        </Typography>
      </Box>
    </Box>
  );

  if (paytypes?.isLoading) {
    return <Loading />;
  }

  if (!paytypes?.isLoading && paytypes?.isCompleted) {
    return (

      <Container maxWidth="xl">
        {renderHeaderActions()}
        {renderTable()}
        {renderModal()}
      </Container>
    );
  }

  return <Error message={paytypes?.message} />;
}

PayTypeList.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};
