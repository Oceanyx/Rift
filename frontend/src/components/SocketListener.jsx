// src/components/SocketListener.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addChannel, updateChannel, deleteChannel } from '../store/channels';
import { addMessage, updateMessage, deleteMessage } from '../store/messages';
import socket from '../utils/socket';


export default function SocketListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleServerEvent = (payload) => {
      console.log('Socket event received:', payload);

      // Handle channel-related events
      if (payload.type === 'CHANNEL_CREATED') {
        dispatch(addChannel(payload.channel));
      } else if (payload.type === 'CHANNEL_UPDATED') {
        dispatch(updateChannel(payload.channel));
      } else if (payload.type === 'CHANNEL_DELETED') {
        dispatch(deleteChannel(Number(payload.channelId)));
      }

      // Handle message-related events
      else if (payload.type === 'MESSAGE_CREATED') {
        dispatch(addMessage(payload.message));
      } else if (payload.type === 'MESSAGE_UPDATED') {
        dispatch(updateMessage(payload.message));
      } else if (payload.type === 'MESSAGE_DELETED') {
        dispatch(deleteMessage(Number(payload.messageId)));
      }
    };

    socket.on('server-event', handleServerEvent);
    socket.on('channel-event', handleServerEvent);

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off('server-event', handleServerEvent);
      socket.off('channel-event', handleServerEvent);
    };
  }, [dispatch]);

  return null;
}
