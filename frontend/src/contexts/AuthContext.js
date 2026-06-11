import React from 'react';
import PropTypes from 'prop-types';
import { authMethods } from '../utils/functions/authMethods';

const AuthProvider = ({ children }) => {
  const handleSignin = async (username, password) => {
    console.log('[AuthContext] กำลังเข้าสู่ระบบ');
    try {
      await authMethods.signin(username, password);
    } catch (e) {
      throw new Error(e);
    }
  };
  const handleSignup = async (username, password, email, data) => {
    console.log('[AuthContext]  กำลังลงทะเบียน');
    await authMethods.signup(username, password, email, data);
  };

  const handleSignout = async () => {
    console.log('[AuthContext] กำลังลงชื่อออก');
    await authMethods.signout();
  };

  return (
    <PassportAuth.Provider
      value={{
        handleSignin,
        handleSignup,
        handleSignout,
      }}
    >
      {children}
    </PassportAuth.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default AuthProvider;
export const PassportAuth = React.createContext();
