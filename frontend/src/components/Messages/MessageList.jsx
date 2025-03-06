import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, removeMessage, editMessage } from '../../store/messages';
import './MessageList.css';

export default function MessageList({ channelId }) {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages);
  const sessionUser = useSelector((state) => state.session.user);
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

  // Group consecutive messages from the same user
  const groupedMessages = [];
  let currentGroup = null;
  messages.forEach((message) => {
    if (!currentGroup || currentGroup.user?.id !== message.User?.id) {
      if (currentGroup) groupedMessages.push(currentGroup);
      currentGroup = { user: message.User, messages: [message] };
    } else {
      currentGroup.messages.push(message);
    }
  });
  if (currentGroup) groupedMessages.push(currentGroup);

  return (
    <div className="message-list">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="message-group">
          <div className="message-header">
            <img
              className="message-avatar"
              src={group.user?.avatar_url || '/default-avatar.png'}
              alt={`${group.user?.username}'s avatar`}
            />
            <span className="message-username">{group.user?.username}</span>
          </div>
          <div className="message-content">
            {group.messages.map((message) => (
              <div key={message.id} className="message-item">
                {editMode === message.id ? (
                  <div className="edit-section">
                    <input
                      type="text"
                      className="edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="action-buttons">
                      <button className="action-btn" onClick={() => handleSave(message.id)}>
                        Save
                      </button>
                      <button className="action-btn" onClick={() => setEditMode(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="message-text">{message.content}</span>
                    {sessionUser && sessionUser.id === group.user.id && (
                      <div className="action-buttons">
                        <button className="action-btn" onClick={() => handleEdit(message)}>
                          Edit
                        </button>
                        <button className="action-btn" onClick={() => dispatch(removeMessage(message.id))}>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
