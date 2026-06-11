import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Check, Groups, AccessTime, Search } from '@mui/icons-material';


const HROverview = ({ title, subtitle }) => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const projects = [
    {
      id: 1,
      name: 'Office Building A',
      totalCheckins: 145,
      totalLabor: 320,
      estimatedLabor: 350,
    },
    {
      id: 2,
      name: 'Shopping Mall B',
      totalCheckins: 89,
      totalLabor: 180,
      estimatedLabor: 200,
    },
  ];

  const calculateStats = () => {
    if (selectedProject === 'all') {
      return {
        totalCheckins: projects.reduce((sum, p) => sum + p.totalCheckins, 0),
        totalLabor: projects.reduce((sum, p) => sum + p.totalLabor, 0),
        estimatedLabor: projects.reduce((sum, p) => sum + p.estimatedLabor, 0),
      };
    } else {
      const project = projects.find((p) => p.id === parseInt(selectedProject));
      return {
        totalCheckins: project.totalCheckins,
        totalLabor: project.totalLabor,
        estimatedLabor: project.estimatedLabor,
      };
    }
  };

  const stats = calculateStats();


  const renderDashboard = () => (
    <div>
      <Box className="min-h-screen bg-gray-50 py-8">
        <Container maxWidth="xl">
          {/* Project Selection */}
          <Card className="mb-8">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search className="mr-2 text-gray-400" />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    label="Select Project"
                  >
                    <MenuItem value="all">All Projects</MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Metrics Cards */}
          <Grid container spacing={3}>
            {/* Total Check-ins */}
            <Grid item xs={12} md={4}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="text-theme-600"
                      >
                        จำนวนการลงเวลา
                      </Typography>
                      <Typography variant="h4" className="font-bold mt-2">
                        {stats.totalCheckins}
                      </Typography>
                    </Box>
                    <Box className="p-3 bg-blue-100 rounded-full">
                      <Check className="text-blue-600" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Labor */}
            <Grid item xs={12} md={4}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="text-theme-600"
                      >
                        ค่าแรงทั้งหมด
                      </Typography>
                      <Typography variant="h4" className="font-bold mt-2">
                        {stats.totalLabor} hrs
                      </Typography>
                    </Box>
                    <Box className="p-3 bg-green-100 rounded-full">
                      <Groups className="text-green-600" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Estimated Labor */}
            <Grid item xs={12} md={4}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Typography variant="subtitle2" className="text-gray-600">
                        Estimated Labor
                      </Typography>
                      <Typography variant="h4" className="font-bold mt-2">
                        {stats.estimatedLabor} hrs
                      </Typography>
                    </Box>
                    <Box className="p-3 bg-orange-100 rounded-full">
                      <AccessTime className="text-orange-600" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default HROverview;
