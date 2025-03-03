import { useSelector } from 'react-redux';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import './ChannelView.css';

const ChannelView = () => {
  const currentChannel = useSelector(state => state.channels.currentChannel);

  return (
    <div className="channel-view-container">
      <div className="channel-header">
        <h2 className="channel-name">#{currentChannel?.name}</h2>
        <div className="channel-topic">{currentChannel?.description}</div>
      </div>
      <MessageList />
      <MessageInput channelId={currentChannel?.id} />
    </div>
  );
};

export default ChannelView;