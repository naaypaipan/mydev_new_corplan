import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  Backdrop,
  Button,
  Card,
  CardContent,
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
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import _ from 'lodash';
import PropTypes from 'prop-types';

import * as actions from '../../redux/actions';
import { CustomerForm } from '../../components/Forms';
import Loading from '../../components/Loading';
import { Error } from '../../components/Error';
import addressToString from '../../utils/functions/addressToString';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '95vh',
  width: '80vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  overflowY: 'scroll',
};

const defaultValues = {
  firstname: '',
  lastname: '',
  type: '',
};

function Customers({ title, subtitle }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const customer = useSelector((state) => state.customer);
  const customerType = useSelector((state) => state.customerType);

  const history = useHistory();
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };
  const handleCSVOpen = () => setCsvUploadOpen(true);
  const handleCSVClose = () => {
    setCsvUploadOpen(false);
    setCsvData([]);
  };

  useEffect(() => {
    dispatch(actions.customerAll({ name, page, size }));
    dispatch(actions.customerTypeAll({}));
    return () => {};
  }, [name, page, size]);

  useEffect(() => {
    setTotal(customer?.total);
    return () => {};
  }, [customer]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setName(searchTerm);
      setPage(1);
    }, 700);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const onSubmit = async (data, event) => {
    try {
      console.log('data', data);
      event.preventDefault();
      await dispatch(actions.customerCreate(data));
      reset(defaultValues);
      alert('Success');
      handleClose();
      await dispatch(actions.customerAll({ name, page, size }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFromFile = async () => {
    if (!_.isEmpty(csvData)) {
      try {
        await dispatch(actions.customerCreate({ arr: csvData }));
        alert('Success');
        handleCSVClose();
        await dispatch(actions.customerAll({ name, page, size }));
      } catch (error) {
        alert('Failed to add');
        console.error(error);
      }
    } else {
      alert('Cannot read file list');
    }
  };

  const handleDeleteCustomer = async (id) => {
    const confirm = window.confirm('Confirm deletion?');
    if (confirm) {
      try {
        await dispatch(actions.customerDelete(id));
        await dispatch(actions.customerAll({ name, page, size }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePushToEditCustomer = (id) => {
    history.push(`customer/edit/${id}`);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };



  const renderSearchAndActions = () => (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <TextField
            label="Search customers"
            placeholder="Company name, contact, email..."
            size="small"
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: '350px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'flex-end', sm: 'flex-end' },
            }}
          >
            <Button
              variant="contained"
              onClick={() => history.push('/customer/customers/new')}
              color="primary"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
              }}
            >
              Add Customer
            </Button>
            <Button
              variant="outlined"
              onClick={handleCSVOpen}
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
              }}
            >
              Upload CSV
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderModal = () => (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Add New Customer
          </Typography>

          <Box sx={{ py: 1 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomerForm
                Controller={Controller}
                control={control}
                errors={errors}
                customerType={customerType}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mt: 4,
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Save
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={7} sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <BusinessIcon
            sx={{
              fontSize: 60,
              color: alpha(theme.palette.text.secondary, 0.3),
              mb: 2,
            }}
          />
          <Typography variant="h6" color="text.secondary">
            No customers found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first customer
          </Typography>
          <Button
            variant="contained"
            onClick={() => history.push('/customer/customers/new')}
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Add Customer
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderTable = () => (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow className="bg-theme-500 text-white">
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                No.
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Company
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Phone
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Contact
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Credit Term
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!_.isEmpty(customer.rows)
              ? customer.rows.map((row, index) => (
                  <TableRow
                    key={row._id}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={(page - 1) * size + index + 1}
                        size="small"
                        sx={{
                          minWidth: 28,
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {`${row.name || '-'}`}
                        </Typography>
                        {row.short && (
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{ ml: 0.5, color: 'text.secondary' }}
                          >
                            ({row.short})
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {addressToString(row.address)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalPhoneIcon
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            opacity: 0.7,
                            color: theme.palette.info.main,
                          }}
                        />
                        <Typography variant="body2">
                          {row.telephone || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            opacity: 0.7,
                            color: theme.palette.info.main,
                          }}
                        />
                        <Typography variant="body2">
                          {row.email || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {_.map(row?.contact, (contact, contactIndex) => (
                        <Box
                          key={contact._id}
                          sx={{
                            p: 1.5,
                            mb: contactIndex < row.contact.length - 1 ? 1 : 0,
                            bgcolor: alpha(
                              theme.palette.background.default,
                              0.5,
                            ),
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <PersonIcon
                              sx={{
                                fontSize: 18,
                                mr: 0.5,
                                color: theme.palette.primary.main,
                              }}
                            />
                            <Typography variant="body2" fontWeight={500}>
                              {`${contact?.firstname} ${contact?.lastname}`}
                            </Typography>
                          </Box>

                          <Box sx={{ pl: 3.5 }}>
                            {contact?.position && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Position: {contact?.position}
                              </Typography>
                            )}
                            {contact?.telephone && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Phone: {contact?.telephone}
                              </Typography>
                            )}
                            {contact?.email && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Email: {contact?.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell>
                      {row?.credit_term ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <CreditCardIcon
                            sx={{ fontSize: 16, color: 'action.active' }}
                          />
                          <Typography variant="body2">
                            {row.credit_term} days
                          </Typography>
                        </Stack>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handlePushToEditCustomer(row._id)}
                            sx={{
                              color: theme.palette.warning.main,
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCustomer(row?._id)}
                            sx={{
                              color: theme.palette.error.main,
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              : renderEmptyState()}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        component="div"
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page - 1}
        count={total || 0}
        rowsPerPage={size}
        onPageChange={handleChangePage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count}`
        }
        sx={{
          '& .MuiTablePagination-toolbar': {
            height: 56,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            margin: 0,
          },
        }}
      />
    </Paper>
  );

  if (customer.isLoading) {
    return <Loading />;
  }
  if (!customer.isLoading && customer.isCompleted) {
    return (
      <Box>
        {renderModal()}
        {renderSearchAndActions()}
        {renderTable()}
      </Box>
    );
  }
  return <Error />;
}

Customers.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Customers.defaultProps = {
  title: 'Customer Management',
  subtitle: 'View, add and edit your customers',
};

export default Customers;
