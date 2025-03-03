// frontend/src/components/MessageInput/MessageInput.jsx
import { useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import './MessageInput.css';

const MessageInput = ({ channelId }) => {
  const [message, setMessage] = useState('');
  const ws = useWebSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !ws) return;

    ws.send(JSON.stringify({
      type: 'CREATE_MESSAGE',
      channelId,
      content: message
    }));
    setMessage('');
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        placeholder="Message #general"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="message-send-button">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;