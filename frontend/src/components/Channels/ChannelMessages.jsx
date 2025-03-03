import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import MessageList from '../Messages/MessageList';
import MessageInput from '../Messages/MessageInput';
import { fetchMessages } from '../../store/messages';
import './ChannelMessages.css';

export default function ChannelMessages({ channelId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMessages(channelId));
  }, [dispatch, channelId]);

  return (
    <div className="channel-messages">
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}
