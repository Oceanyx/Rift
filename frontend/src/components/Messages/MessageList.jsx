import React from 'react';
import './MessageList.css';

export default function MessageList() {
  // Replace with Redux state for messages once implemented
  const messages = [
    { id: 1, content: 'Hello world!', user: { username: 'Alice' } },
    { id: 2, content: 'Hi there!', user: { username: 'Bob' } }
  ];

  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.id} className="message-item">
          <strong>{message.user.username}: </strong>{message.content}
        </div>
      ))}
    </div>
  );
}
