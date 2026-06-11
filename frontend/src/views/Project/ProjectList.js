import {
  Button,
  Card,
  Box,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ProjectTable } from '../../components/Table';
import dayjs from 'dayjs';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

export default function ProjectList({ title, subtitle }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project);
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(actions.projectAll({ page, size }));
    return () => {};
  }, [page, size]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        dispatch(actions.projectAll({ page: 1, size, name: searchTerm }));
      } else {
        dispatch(actions.projectAll({ page, size }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);



  const handleOnclickDetail = (id) => {
    history.push(`/project/project/detail/${id}`);
  };

  const renderActions = () => (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between', // จัดให้มีระยะห่างระหว่างองค์ประกอบมากที่สุด
      }}
    >
      <TextField
        label="ค้นหาโครงการ"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          maxWidth: { xs: '100%', sm: '400px' },
          width: '100%', // ให้ TextField ขยายเต็มพื้นที่บนมือถือ
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        placeholder="ค้นหาตามชื่อหรือรหัสโครงการ..."
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => history.push('/project/project/new')}
        sx={{
          borderRadius: 1.5,
          height: 40,
          whiteSpace: 'nowrap',
          alignSelf: { xs: 'flex-end', sm: 'center' }, // จัดให้อยู่ชิดขวาบนมือถือ
        }}
      >
        เพิ่มโครงการใหม่
      </Button>
    </Box>
  );

  const renderSummary = () => {
    const totalProjects = projects?.total || 0;
    const pendingProjects =
      projects?.rows?.filter((p) => p.operation_status === 'PENDING')?.length ||
      0;

    const completedProjects =
      projects?.rows?.filter((p) => p.operation_status === '"DELIVERY"')
        ?.length || 0;

    return (
      <Box sx={{ mb: 2, mt: 1, px: 1 }}>
        <Typography variant="body2" color="textSecondary">
          สรุปโครงการในหน้านี้:{' '}
          <Chip
            size="small"
            label={`ทั้งหมด ${projects?.rows?.length || 0}`}
            sx={{
              mr: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          />
          <Chip
            size="small"
            label={`ดำเนินการ ${pendingProjects}`}
            sx={{
              mr: 1,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
            }}
          />
          <Chip
            size="small"
            label={`เสร็จสิ้น ${completedProjects}`}
            sx={{
              mr: 1,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
            }}
          />
        </Typography>
      </Box>
    );
  };

  const renderTable = () => (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      <ProjectTable
        projects={projects}
        handleOnclickDetail={handleOnclickDetail}
        page={page}
        setPage={setPage}
        size={size}
        setSize={setSize}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: alpha(theme.palette.background.default, 0.6),
        }}
      >
        <Typography variant="caption" color="textSecondary">
          แสดงข้อมูลทั้งหมด {projects?.total || 0} รายการ (หน้า {page} จาก{' '}
          {Math.ceil((projects?.total || 0) / size)})
        </Typography>
        <Typography variant="caption" color="textSecondary">
          อัปเดทล่าสุด: {dayjs().format('DD/MM/YYYY HH:mm')}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <div>
      {renderActions()}
      {renderSummary()}
      {renderTable()}
    </div>
  );
}
