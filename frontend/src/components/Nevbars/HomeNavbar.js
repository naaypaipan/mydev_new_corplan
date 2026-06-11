import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';
import { Box, IconButton, useTheme, alpha } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { PassportAuth } from '../../contexts/AuthContext';

export function HomeNavbar({ onMobileNavOpen }) {
  const history = useHistory();
  const theme = useTheme();
  // const { handleSignout } = useContext(PassportAuth);

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        marginLeft: { lg: '320px' }, // Offset for the 320px Sidebar
        width: { lg: 'calc(100% - 320px)' }, // Explicit width calculation
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        px: 3,
        py: 2, // Increased vertical padding slightly
        display: { xs: 'flex', lg: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'left 0.2s',
      }}
    >
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        <IconButton
          color="inherit"
          onClick={onMobileNavOpen}
          sx={{
            color: 'text.secondary',
            '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <Box flexGrow={1} />
      {/* Add profile menu or notifications here later if needed */}
    </Box>
  );
}

HomeNavbar.propTypes = {
  onMobileNavOpen: PropTypes.func,
};

export default HomeNavbar;
