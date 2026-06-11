import React, { useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useLocation, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography,
  Tooltip,
} from '@mui/material';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import BusinessCenterOutlined from '@mui/icons-material/BusinessCenterOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import NavItem from './NavItem';
import { PassportAuth } from '../../contexts/AuthContext';
import { getStorage } from '../../utils/functions/localstorage';
import { accessRightSubMenu } from '../../utils/functions/accessRight';
import {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_MODULE_TITLE,
} from '../../constants/sidebarNavConfig';
import * as actions from '../../redux/actions';

/** ไอคอนหนึ่งต่อโมดูล — แถบซ้ายหลักเท่านั้น (อ่านง่าย) */
const SIDEBAR_MODULE_ICONS = {
  PROFILE: PersonOutlineOutlined,
  PROJECT: BusinessCenterOutlined,
  HUMEN: GroupsOutlined,
  FINANCE: AccountBalanceWalletOutlined,
  CUSTOMER: StorefrontOutlined,
  DIRECTOR: InsightsOutlined,
  MANAGEMENT: SettingsOutlined,
};

const items = SIDEBAR_NAV_ITEMS;

const DashboardSidebar = ({ me, onMobileClose, openMobile }) => {
  const {
    firstname = '',
    lastname = '',
    department: { name: departmentName = '' } = {},
  } = JSON.parse(getStorage('remember') || '{}');

  const { handleSignout } = useContext(PassportAuth);
  const history = useHistory();
  const location = useLocation();
  const [activeModuleName, setActiveModuleName] = React.useState('');

  const onSignOut = async () => {
    await handleSignout();
    history.push('/login');
  };

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const moduleGroups = React.useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const rowVisible =
        item.sub && item.sub.length > 0
          ? item.sub.some((s) =>
              accessRightSubMenu(me, item.name, s.href, s.level ?? 0),
            )
          : accessRightSubMenu(me, item.name, item.href, 0);
      if (!rowVisible) return;
      if (!groups[item.name]) {
        const ModuleIcon =
          SIDEBAR_MODULE_ICONS[item.name] || SettingsOutlined;
        groups[item.name] = {
          name: item.name,
          title: SIDEBAR_MODULE_TITLE[item.name] || item.title,
          moduleIcon: ModuleIcon,
          href: item.href,
          items: [],
        };
      }
      groups[item.name].items.push(item);
    });
    return Object.values(groups);
  }, [me]);

  useEffect(() => {
    const found = moduleGroups.find((m) =>
      m.items.some(
        (item) =>
          location.pathname.startsWith(item.href) ||
          (item?.sub &&
            item.sub.some((s) => location.pathname.startsWith(s.href))),
      ),
    );
    if (found) {
      setActiveModuleName(found.name);
    } else if (moduleGroups.length > 0 && !activeModuleName) {
      setActiveModuleName(moduleGroups[0].name);
    }
  }, [location.pathname, moduleGroups]);

  const activeGroup = moduleGroups.find((m) => m.name === activeModuleName);

  const content = (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
      }}
    >
      {/* Primary rail — ไอคอนโมดูล */}
      <Box
        sx={{
          width: 80,
          backgroundColor: '#1e1b4b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3,
          zIndex: 10,
          boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)', borderColor: '#fff' },
            }}
            src={me?.userData?.image?.url}
            alt={firstname}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
            width: '100%',
            alignItems: 'center',
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {moduleGroups.map((mod) => {
            const ModuleIcon = mod.moduleIcon;
            return (
              <Tooltip key={mod.name} title={mod.title} placement="right" arrow>
                <Box
                  onClick={() => {
                    setActiveModuleName(mod.name);
                    history.push(mod.href);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    color:
                      activeModuleName === mod.name
                        ? '#fff'
                        : 'rgba(255, 255, 255, 0.45)',
                    backgroundColor:
                      activeModuleName === mod.name
                        ? '#4f46e5'
                        : 'transparent',
                    boxShadow:
                      activeModuleName === mod.name
                        ? '0 4px 12px rgba(79, 70, 229, 0.4)'
                        : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      transform: 'translateY(-2px)',
                    },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 50,
                    height: 50,
                  }}
                >
                  <ModuleIcon sx={{ fontSize: 26 }} />
                </Box>
              </Tooltip>
            );
          })}
        </Box>
        <Divider
          sx={{ width: '40%', my: 2, borderColor: 'rgba(255,255,255,0.1)' }}
        />
        <Tooltip title="Sign Out" placement="right">
          <Box
            onClick={onSignOut}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.5)',
              transition: 'color 0.2s',
              '&:hover': { color: '#ef4444' },
            }}
          >
            <i
              className="fas fa-sign-out-alt"
              style={{ fontSize: '1.4rem' }}
            ></i>
          </Box>
        </Tooltip>
      </Box>

      {/* Secondary rail — ข้อความอย่างเดียว ไม่มีไอคอนรายการ */}
      <Box
        sx={{
          width: 240,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography
            variant="h6"
            color="primary.dark"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            {activeGroup?.title || 'Menu'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {departmentName}
          </Typography>
        </Box>
        <Divider sx={{ mb: 1, mx: 3 }} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pb: 2 }}>
          <List disablePadding>
            {(activeGroup?.items || [])
              .reduce((acc, item) => {
                if (item.sub && item.sub.length > 0) {
                  item.sub.forEach((subItem) => {
                    if (
                      accessRightSubMenu(
                        me,
                        item.name,
                        subItem.href,
                        subItem.level ?? 0,
                      )
                    ) {
                      acc.push({
                        ...subItem,
                        moduleName: item.name,
                      });
                    }
                  });
                } else if (accessRightSubMenu(me, item.name, item.href, 0)) {
                  acc.push({ ...item, moduleName: item.name });
                }
                return acc;
              }, [])
              .map((item, index) => (
                <div key={item.title + index}>
                  <NavItem
                    href={item.href}
                    title={item.title}
                    sub={item.sub}
                    me={me}
                    moduleName={item.moduleName}
                  />
                </div>
              ))}
          </List>
        </Box>
      </Box>
    </Box>
  );

  return (
    <div>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
          PaperProps={{
            sx: {
              width: 320,
              border: 'none',
            },
          }}
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden lgDown>
        <Drawer
          anchor="left"
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: 320,
              border: 'none',
              height: '100vh',
              top: 0,
            },
          }}
        >
          {content}
        </Drawer>
      </Hidden>
    </div>
  );
};

DashboardSidebar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
  me: PropTypes.object,
};

DashboardSidebar.defaultProps = {
  onMobileClose: () => {},
  openMobile: false,
};

export default DashboardSidebar;
