import React from 'react';
import MessageList from '../Messages/MessageList';
import MessageInput from '../Messages/MessageInput';
import './ChannelMessages.css';

export default function ChannelMessages() {
  return (
    <div className="channel-messages">
      <MessageList />
      <MessageInput />
    </div>
  );
}
