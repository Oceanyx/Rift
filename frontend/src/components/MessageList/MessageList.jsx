// frontend/src/components/MessageList/MessageList.jsx
import { useSelector } from 'react-redux';
import './MessageList.css';

const MessageList = () => {
  const messages = useSelector(state => state.websocket.messages);

  return (
    <div className="message-list-container">
      {messages.map(message => (
        <div key={message.id} className="message-item">
          <img 
            src={message.User.avatar_url} 
            alt="User Avatar" 
            className="message-avatar"
          />
          <div className="message-content">
            <div className="message-header">
              <span className="message-username">{message.User.username}</span>
              <span className="message-timestamp">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="message-text">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;