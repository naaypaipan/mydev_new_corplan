import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Avatar,
  Button,
  IconButton,
  Typography,
  Stack,
  Modal,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { OT_STATUS } from 'utils/constants';

const ImagePreview = ({ url, label, onClick }) => (
  <Card
    elevation={0}
    className="border hover:shadow-md transition-shadow duration-200"
  >
    <Box
      className="relative group"
      // make whole thumbnail clickable and keyboard-accessible
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Avatar src={url} variant="rounded" sx={{ width: 80, height: 80 }} />
      <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <CameraIcon className="text-white" />
      </Box>
    </Box>
    <Typography className="text-center py-1 text-sm text-gray-600">
      {label}
    </Typography>
  </Card>
);

const TimeDisplay = ({ time, onEdit, title }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <div>{title}</div>
    <Typography>{dayjs(time).format('HH:mm')}</Typography>
    <IconButton size="small" onClick={onEdit}>
      <EditIcon fontSize="small" />
    </IconButton>
  </Stack>
);

const renderOtRequestDetail = (otRequests) => {
  if (!otRequests || otRequests.length === 0) return '--';
  return (
    <div>
      <Chip
        label={OT_STATUS?.[otRequests.status]?.status_code || otRequests.status}
        color={OT_STATUS?.[otRequests.status]?.color || 'default'}
        size="small"
        variant="filled"
      />

      <div>
        {dayjs(otRequests?.startTime).format('HH:mm')} -{' '}
        {dayjs(otRequests?.endTime).format('HH:mm')}
      </div>
    </div>
  );
};

export default function HrcheckinList({
  timestamp,
  page,
  size,
  show,
  renderDelete,
  handleOpen,
  handleOpenEditCheckin,
  handleUpdateRate, // optional prop: (row, newRate) => {}
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openModal, setOpenModal] = React.useState(false);
  const [bigImage, setBigImage] = React.useState('');

  const handleOpenModal = (image) => {
    setBigImage(image);
    setOpenModal(true);
  };

  const onChangeRate = (row, value) => {
    const newRate = Number(value);
    if (typeof handleUpdateRate === 'function') {
      handleUpdateRate(row, newRate);
    } else {
      console.warn('handleUpdateRate not provided', row?._id, newRate);
    }
  };

  const renderCardView = () => (
    <Box className="grid gap-4 p-4">
      {timestamp?.rows?.map((item) => (
        <Card
          key={item._id}
          className="p-4 hover:shadow-lg transition-shadow duration-200"
        >
          <Stack spacing={2}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6" className="font-medium">
                  {item?.employee?.firstname} {item?.employee?.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item?.project_in?.project_number} - {item?.project_in?.name}
                </Typography>
              </Box>
              <Chip
                label={dayjs(item?.checkIn).format('DD/MM/YYYY')}
                variant="outlined"
                size="small"
              />
            </Stack>

            {/* Times */}
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Check in
                </Typography>
                <TimeDisplay
                  time={item?.checkIn}
                  onEdit={() => handleOpenEditCheckin(item)}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Check out
                </Typography>
                {item?.status_checkOut ? (
                  <TimeDisplay
                    time={item?.checkOut}
                    onEdit={() => handleOpen(item)}
                  />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpen(item)}
                    startIcon={<TimeIcon />}
                  >
                    out
                  </Button>
                )}
              </Box>
            </Stack>

            {/* Images */}
            {show && (
              <Stack direction="row" spacing={2}>
                <ImagePreview
                  url={item?.image?.url}
                  label="Check In"
                  onClick={() => handleOpenModal(item?.image?.url)}
                />
                {item?.status_checkOut && (
                  <ImagePreview
                    url={item?.image_out?.url}
                    label="Check Out"
                    onClick={() => handleOpenModal(item?.image_out?.url)}
                  />
                )}
              </Stack>
            )}
          </Stack>
        </Card>
      ))}
    </Box>
  );

  const renderTableView = () => (
    <Paper elevation={0} className="border rounded-xl overflow-hidden">
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow className="bg-theme-600">
              <TableCell sx={{ width: 60, minWidth: 50, maxWidth: 70 }}>
                <Typography className="text-white font-medium">No.</Typography>
              </TableCell>
              <TableCell sx={{ width: 140, minWidth: 100, maxWidth: 180 }}>
                <Typography className="text-white font-medium">Name</Typography>
              </TableCell>
              <TableCell sx={{ width: 170, minWidth: 120, maxWidth: 220 }}>
                <Typography className="text-white font-medium">
                  Project
                </Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: 110, minWidth: 90, maxWidth: 120 }}
              >
                <Typography className="text-white font-medium">Date</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: 110, minWidth: 90, maxWidth: 120 }}
              >
                <Typography className="text-white font-medium">Time</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: 110, minWidth: 90, maxWidth: 120 }}
              >
                <Typography className="text-white font-medium">Rate</Typography>
              </TableCell>
              {/* OT Request */}
              <TableCell
                align="center"
                sx={{ width: 180, minWidth: 120, maxWidth: 220 }}
              >
                <Typography className="text-white font-medium">
                  OT Request
                </Typography>
              </TableCell>
              {show && (
                <TableCell
                  align="center"
                  sx={{ width: 160, minWidth: 120, maxWidth: 200 }}
                >
                  <Typography className="text-white font-medium">
                    Images
                  </Typography>
                </TableCell>
              )}
              <TableCell
                align="right"
                sx={{ width: 60, minWidth: 40, maxWidth: 70 }}
              >
                <Typography className="text-white font-medium"></Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timestamp?.rows?.length !== 0 ? (
              timestamp?.rows?.map((e, index) => (
                <TableRow key={e?._id}>
                  <TableCell>
                    <Typography className="text-center">
                      {(page - 1) * size + index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography className="text-center">
                      {e?.employee?.firstname} {e?.employee?.lastname}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      <b>{e?.project_in?.project_number}</b>
                      <div>{e?.project_in?.name}</div>
                      {e?.note && (
                        <div className="text-red-600">**{e?.note}</div>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      {dayjs(e?.checkIn).format('DD/MM/YYYY')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <TimeDisplay
                      time={e?.checkIn}
                      onEdit={() => handleOpenEditCheckin(e)}
                      title="IN:"
                    />
                    {e?.status_checkOut ? (
                      <TimeDisplay
                        time={e?.checkOut}
                        onEdit={() => handleOpen(e)}
                        title="OUT:"
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpen(e)}
                        startIcon={<TimeIcon />}
                      >
                        out
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={e?.rate ?? ''}
                        onChange={(ev) => onChangeRate(e, ev.target.value)}
                        displayEmpty
                        renderValue={(selected) =>
                          selected === '' ? '-' : String(selected)
                        }
                        size="small"
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={1.5}>1.5</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  {/* OT Request */}
                  <TableCell align="center">
                    {renderOtRequestDetail(e.otRequests)}
                  </TableCell>
                  {show && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={2}>
                        <ImagePreview
                          url={e?.image?.url}
                          label="Check In"
                          onClick={() => handleOpenModal(e?.image?.url)}
                        />
                        {e?.status_checkOut && (
                          <ImagePreview
                            url={e?.image_out?.url}
                            label="Check Out"
                            onClick={() => handleOpenModal(e?.image_out?.url)}
                          />
                        )}
                      </Stack>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => renderDelete(e?._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell align="center" colSpan={show ? 9 : 8}>
                  No items
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      {/* Image Preview Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-white rounded-lg p-4">
          <img
            src={bigImage}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </Box>
      </Modal>

      {/* Content */}
      {isMobile ? renderCardView() : renderTableView()}
    </Box>
  );
}
