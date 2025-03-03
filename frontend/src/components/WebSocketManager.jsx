// frontend/src/components/WebSocketManager.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useWebSocket } from '../context/WebSocketContext';

const messageHandlers = {
  MESSAGE_CREATED: (dispatch, payload) => {
    dispatch({ type: 'messages/add', payload });
  },
  SERVER_UPDATED: (dispatch, payload) => {
    dispatch({ type: 'servers/update', payload });
  },
  USER_TYPING: (dispatch, payload) => {
    dispatch({ type: 'ui/setTyping', payload });
  }
};

const WebSocketManager = () => {
  const dispatch = useDispatch();
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    const handler = (event) => {
      const { type, payload } = JSON.parse(event.data);
      messageHandlers[type]?.(dispatch, payload);
    };

    ws.addEventListener('message', handler);
    return () => ws.removeEventListener('message', handler);
  }, [ws, dispatch]);

  return null;
};

export default WebSocketManager;