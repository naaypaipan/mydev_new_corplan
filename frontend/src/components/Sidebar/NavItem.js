import React, { useState, useEffect } from 'react';
import {
  NavLink as RouterLink,
  matchPath,
  useLocation,
  useHistory,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Collapse,
  List,
  ListItemButton,
  Box,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import _ from 'lodash';
import { accessRightSubMenu } from '../../utils/functions/accessRight';

const NavItem = ({ href, title, sub, moduleName, me }) => {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();

  const active = href
    ? !!matchPath(location.pathname, {
        path: href,
        exact: !_.size(sub),
      })
    : false;

  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (_.size(sub)) {
      const isChildActive = sub.some((item) =>
        matchPath(location.pathname, { path: item.href }),
      );
      if (isChildActive) setOpen(true);
    }
  }, [location.pathname, sub]);

  const handleClick = () => {
    if (_.size(sub)) {
      setOpen(!open);
    } else {
      history.push(href);
    }
  };

  const commonSx = {
    borderRadius: 2,
    mb: 0.5,
    py: 1.2,
    px: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
    },
  };

  return (
    <Box sx={{ px: 1.5, py: 0.5 }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          ...commonSx,
          ...(active &&
            !_.size(sub) && {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              fontWeight: 600,
            }),
          ...(!active && {
            color: 'text.secondary',
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: active ? 600 : 500 }}>
            {title}
          </Typography>
        </Box>

        {_.size(sub) > 0 && (
          <Box
            component="span"
            sx={{
              ml: 1,
              display: 'flex',
              color: 'text.secondary',
              '& .MuiSvgIcon-root': { fontSize: 20 },
            }}
          >
            {open ? <ExpandMore /> : <KeyboardArrowRight />}
          </Box>
        )}
      </ListItemButton>

      {_.size(sub) > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mt: 0.5 }}>
            {_.map(sub, (item, index) => {
              if (
                accessRightSubMenu(
                  me,
                  moduleName,
                  item.href,
                  item.level ?? 0,
                )
              ) {
                const isSubActive = matchPath(location.pathname, {
                  path: item.href,
                });
                return (
                  <ListItemButton
                    key={index}
                    component={RouterLink}
                    to={item.href}
                    sx={{
                      borderRadius: 2,
                      pl: 3,
                      py: 1,
                      mb: 0.5,
                      color: isSubActive ? 'primary.main' : 'text.secondary',
                      backgroundColor: isSubActive
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: isSubActive
                          ? 'primary.main'
                          : alpha(theme.palette.text.secondary, 0.4),
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isSubActive ? 600 : 400 }}
                    >
                      {item.title}
                    </Typography>
                  </ListItemButton>
                );
              }
              return null;
            })}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  sub: PropTypes.array,
  me: PropTypes.object,
  moduleName: PropTypes.string,
};

export default NavItem;
