import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';

import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Modal,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  TablePagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import {
  countProjectGpsPoints,
  getProjectGpsPoints,
} from '../../utils/functions/projectGpsPoints';

const HrCheckinManagementMap = lazy(() =>
  import('./HrCheckinManagementMap'),
);

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };
const DEFAULT_ZOOM = 14;
const PAGE_SIZE = 50;

const MapMarker = () => (
  <Box
    sx={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      color: '#d32f2f',
      fontSize: 36,
    }}
  >
    <LocationOnIcon sx={{ fontSize: 40 }} />
  </Box>
);

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 480 },
  maxWidth: 480,
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

export default function HrCheckinManagement({ title, subtitle }) {
  const dispatch = useDispatch();
  const project = useSelector((state) => state.project);
  const me = useSelector((state) => state.me);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editLocation, setEditLocation] = useState('');
  /** รายการจุดทั้งหมด: แถวแรกบันทึกเป็น gps แถวถัดไปเป็น gps_sites */
  const [editSites, setEditSites] = useState([]);
  const [activeSiteIndex, setActiveSiteIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [message, setMessage] = useState({ type: null, text: '' });

  const total = project?.total ?? 0;

  useEffect(() => {
    setLoading(true);
    dispatch(
      actions.projectAll({ size: PAGE_SIZE, page: page + 1 }),
    ).then(() => setLoading(false));
  }, [dispatch, page]);

  useEffect(() => {
    const list = project?.rows ?? [];
    setProjects(Array.isArray(list) ? list : []);
  }, [project]);

  const handleToggleTimeTracking = async (row, checked) => {
    const confirmMsg = checked
      ? 'เปิดการลงเวลาผ่านหน้า Profile สำหรับโครงการนี้?'
      : 'ปิดการลงเวลาผ่านหน้า Profile สำหรับโครงการนี้?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await dispatch(
        actions.projectPut(row.id || row._id, {
          time_tracking_enabled: checked,
        }),
      );
      await dispatch(actions.projectAll({ size: PAGE_SIZE, page: page + 1 }));
      setMessage({ type: 'success', text: 'อัปเดตสถานะการลงเวลาแล้ว' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'อัปเดตไม่สำเร็จ' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    }
  };

  const handleToggleTimeTrackingLink = async (row, checked) => {
    const confirmMsg = checked
      ? 'เปิดให้ลงเวลาผ่านลิงก์ Manpower สำหรับโครงการนี้?'
      : 'ปิดการลงเวลาผ่านลิงก์ Manpower (ลงได้เฉพาะ Profile)?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await dispatch(
        actions.projectPut(row.id || row._id, {
          time_tracking_link_enabled: checked,
        }),
      );
      await dispatch(actions.projectAll({ size: PAGE_SIZE, page: page + 1 }));
      setMessage({ type: 'success', text: 'อัปเดตลิงก์ลงเวลาแล้ว' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'อัปเดตไม่สำเร็จ' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    }
  };

  const openEditModal = (row) => {
    setEditingProject(row);
    setEditLocation(row.location || '');
    const sites = [];
    if (row.gps?.lat != null && row.gps?.lon != null) {
      sites.push({
        id: 'primary',
        name: 'จุดหลัก',
        lat: String(row.gps.lat),
        lon: String(row.gps.lon),
      });
    }
    (row.gps_sites || []).forEach((s, i) => {
      if (s?.lat != null && s?.lon != null) {
        sites.push({
          id: `site-${i}`,
          name: s.name || `ไซต์ ${i + 1}`,
          lat: String(s.lat),
          lon: String(s.lon),
        });
      }
    });
    if (sites.length === 0) {
      sites.push({ id: 'new', name: '', lat: '', lon: '' });
    }
    setEditSites(sites);
    setActiveSiteIndex(0);
    const first = sites[0];
    const lat = first.lat?.trim();
    const lon = first.lon?.trim();
    setMapCenter(
      lat && lon && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lon))
        ? { lat: parseFloat(lat), lng: parseFloat(lon) }
        : DEFAULT_CENTER,
    );
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProject(null);
    setEditLocation('');
    setEditSites([]);
    setActiveSiteIndex(0);
    setMapCenter(DEFAULT_CENTER);
  };

  const handleSaveLocation = async () => {
    if (!editingProject) return;
    const id = editingProject.id || editingProject._id;
    const valid = editSites
      .map((s) => ({
        name: (s.name || '').trim(),
        lat: s.lat?.trim() ? parseFloat(s.lat, 10) : NaN,
        lon: s.lon?.trim() ? parseFloat(s.lon, 10) : NaN,
      }))
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon));

    const payload = {
      location: editLocation.trim() || undefined,
      gps:
        valid.length > 0
          ? { lat: valid[0].lat, lon: valid[0].lon }
          : undefined,
      gps_sites: valid.slice(1).map((s) => ({
        name: s.name,
        lat: s.lat,
        lon: s.lon,
      })),
    };
    if (!payload.location && !payload.gps) {
      setMessage({
        type: 'warning',
        text: 'กรุณากรอกสถานที่หรือพิกัด GPS อย่างน้อย 1 จุด',
      });
      return;
    }
    setSaving(true);
    try {
      await dispatch(actions.projectPut(id, payload));
      await dispatch(actions.projectAll({ size: PAGE_SIZE, page: page + 1 }));
      setMessage({ type: 'success', text: 'บันทึกโลเคชั่นแล้ว' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
      closeEditModal();
    } catch (err) {
      setMessage({ type: 'error', text: 'บันทึกไม่สำเร็จ' });
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const gpsText = (row) => {
    const n = countProjectGpsPoints(row);
    if (n === 0) return '-';
    const pts = getProjectGpsPoints(row);
    const p0 = pts[0];
    return `${n} จุด · ${p0.lat.toFixed(5)}, ${p0.lon.toFixed(5)}`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={320}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          เปิด/ปิดการลงเวลา (Profile / ลิงก์) แต่ละโครงการ และจัดการโลเคชั่น
        </Typography>
      </Box>

      {message.text && (
        <Alert
          severity={message.type || 'info'}
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: null, text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>เลขที่งาน</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>โครงการ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>สถานที่ (Location)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                GPS (จำนวนจุด / พิกัดแรก)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Profile
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                ลิงก์
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  ไม่มีโครงการ
                </TableCell>
              </TableRow>
            ) : (
              projects.map((row) => (
                <TableRow key={row.id || row._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {row.project_number || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row.name || '-'}
                    </Typography>
                    {row.customer && (
                      <Typography variant="caption" color="text.secondary">
                        {row.customer}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.location ? (
                      <Typography variant="body2">{row.location}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {gpsText(row)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={Boolean(row.time_tracking_enabled)}
                      onChange={(e) =>
                        handleToggleTimeTracking(row, e.target.checked)
                      }
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={row.time_tracking_link_enabled !== false}
                      onChange={(e) =>
                        handleToggleTimeTrackingLink(row, e.target.checked)
                      }
                      color="secondary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="แก้ไขโลเคชั่น">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEditModal(row)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} จาก ${count}`
          }
        />
      </TableContainer>

      <Modal open={editModalOpen} onClose={closeEditModal}>
        <Box sx={modalStyle}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6">
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              แก้ไขโลเคชั่น
            </Typography>
            <IconButton size="small" onClick={closeEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {editingProject && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              เลขที่งาน: {editingProject.project_number || '-'} · โครงการ: {editingProject.name}
            </Typography>
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            เลือกจุดที่ต้องการ แล้วคลิกบนแผนที่เพื่อใส่พิกัด (แถวแรก = จุดหลัก gps)
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="active-site-label">จุดที่แก้จากแผนที่</InputLabel>
            <Select
              labelId="active-site-label"
              label="จุดที่แก้จากแผนที่"
              value={Math.min(activeSiteIndex, Math.max(0, editSites.length - 1))}
              onChange={(e) => setActiveSiteIndex(Number(e.target.value))}
            >
              {editSites.map((s, i) => (
                <MenuItem key={s.id || i} value={i}>
                  {s.name?.trim() || `จุด ${i + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              height: 220,
              borderRadius: 2,
              overflow: 'hidden',
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Suspense
              fallback={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  minHeight={220}
                >
                  <CircularProgress size={32} />
                </Box>
              }
            >
              <HrCheckinManagementMap
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                apiKey={process.env.REACT_APP_MAP_API_KEY}
                onClick={({ lat, lng }) => {
                  const next = [...editSites];
                  const i = Math.min(
                    activeSiteIndex,
                    Math.max(0, next.length - 1),
                  );
                  if (!next[i]) return;
                  next[i] = {
                    ...next[i],
                    lat: lat.toFixed(6),
                    lon: lng.toFixed(6),
                  };
                  setEditSites(next);
                  setMapCenter({ lat, lng });
                }}
              >
                {editSites.map((s, i) => {
                  const la = s.lat?.trim();
                  const lo = s.lon?.trim();
                  if (
                    !la ||
                    !lo ||
                    Number.isNaN(parseFloat(la)) ||
                    Number.isNaN(parseFloat(lo))
                  ) {
                    return null;
                  }
                  return (
                    <MapMarker
                      key={s.id || i}
                      lat={parseFloat(la)}
                      lng={parseFloat(lo)}
                    />
                  );
                })}
              </HrCheckinManagementMap>
            </Suspense>
          </Box>

          <TextField
            fullWidth
            label="สถานที่ (Location)"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
            placeholder="ชื่อสถานที่หรือที่อยู่"
          />

          {editSites.map((s, i) => (
            <Box
              key={s.id || i}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor:
                  i === activeSiteIndex ? 'primary.main' : 'divider',
                bgcolor:
                  i === activeSiteIndex ? 'action.hover' : 'transparent',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {i === 0 ? 'จุดหลัก (gps)' : `ไซต์เพิ่ม #${i}`}
              </Typography>
              <TextField
                fullWidth
                label="ชื่อไซต์"
                value={s.name}
                onChange={(e) => {
                  const next = [...editSites];
                  next[i] = { ...next[i], name: e.target.value };
                  setEditSites(next);
                }}
                size="small"
                sx={{ mt: 1, mb: 1 }}
              />
              <TextField
                fullWidth
                label="ละติจูด (Lat)"
                value={s.lat}
                onChange={(e) => {
                  const next = [...editSites];
                  next[i] = { ...next[i], lat: e.target.value };
                  setEditSites(next);
                }}
                size="small"
                type="number"
                inputProps={{ step: 0.00001 }}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="ลองจิจูด (Lon)"
                value={s.lon}
                onChange={(e) => {
                  const next = [...editSites];
                  next[i] = { ...next[i], lon: e.target.value };
                  setEditSites(next);
                }}
                size="small"
                type="number"
                inputProps={{ step: 0.00001 }}
              />
            </Box>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddLocationAltIcon />}
            onClick={() => {
              const n = editSites.length;
              setEditSites([
                ...editSites,
                {
                  id: `new-${Date.now()}`,
                  name: `ไซต์ ${n + 1}`,
                  lat: '',
                  lon: '',
                },
              ]);
              setActiveSiteIndex(n);
            }}
            sx={{ mb: 2 }}
          >
            เพิ่มไซต์
          </Button>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button variant="outlined" onClick={closeEditModal} size="small">
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSaveLocation}
              disabled={saving}
              size="small"
            >
              บันทึก
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
