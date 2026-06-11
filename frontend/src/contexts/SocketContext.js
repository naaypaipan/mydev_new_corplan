import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to backend — same origin in production, REACT_APP_API_URL in dev
    const apiUrl = (process.env.REACT_APP_API_URL || '').trim();
    // Extract base URL (remove /api/v1 or /api/v2 suffix)
    const baseUrl = apiUrl.replace(/\/api\/v\d+$/, '').trim();

    console.log('[Socket.IO] Connecting to:', baseUrl || '(same origin)');

    const newSocket = io(baseUrl || undefined, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket.IO] ✅ Connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket.IO] ❌ Disconnected:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Socket.IO] ⚠️ Connection error:', err.message);
    });

    // Listen for any event for debugging
    newSocket.onAny((event, ...args) => {
      console.log('[Socket.IO] 📩 Event:', event, args);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
