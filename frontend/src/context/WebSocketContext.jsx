import { createContext, useContext, useEffect, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);

  useEffect(() => {
    const url = import.meta.env.PROD
      ? `wss://${window.location.host}` // Production
      : 'ws://localhost:8000';         // Development

    ws.current = new WebSocket(url);
    
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws.current}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);