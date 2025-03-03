import React, { createContext } from 'react';
import socket from '../utils/socket';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
