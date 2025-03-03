import React, { useState } from 'react';
import socket from '../../utils/socket';
import './MessageInput.css';

export default function MessageInput() {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For example, emit to channel with id 1. Adjust based on your state/props.
    socket.emit('sendMessage', { channelId: 1, content: message });
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-input"
      />
      <button type="submit" className="message-send-button">Send</button>
    </form>
  );
}
