import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessage } from '../../store/messages';
import './MessageInput.css';

export default function MessageInput({ channelId }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      dispatch(createMessage(channelId, content));
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="message-input"
      />
      <button type="submit" className="message-send-button">Send</button>
    </form>
  );
}
