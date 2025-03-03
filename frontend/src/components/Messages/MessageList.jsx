import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, removeMessage, editMessage } from '../../store/messages';
import './MessageList.css';

export default function MessageList({ channelId }) {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages);
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (channelId) {
      dispatch(fetchMessages(channelId));
    }
  }, [dispatch, channelId]);

  const handleEdit = (message) => {
    setEditMode(message.id);
    setEditContent(message.content);
  };

  const handleSave = (messageId) => {
    dispatch(editMessage(messageId, editContent));
    setEditMode(null);
  };

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className="message-item">
          {editMode === message.id ? (
            <>
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button onClick={() => handleSave(message.id)}>Save</button>
              <button onClick={() => setEditMode(null)}>Cancel</button>
            </>
          ) : (
            <>
              <strong>{message.User?.username}: </strong>
              <span>{message.content}</span>
              <button onClick={() => handleEdit(message)}>Edit</button>
              <button onClick={() => dispatch(removeMessage(message.id))}>
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
