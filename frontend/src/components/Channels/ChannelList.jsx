import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChannel, editChannel, removeChannel } from '../../store/channels';
import './ChannelList.css';

export default function ChannelList({ serverId, setSelectedChannelId }) {
  const dispatch = useDispatch();
  const channels = useSelector(state => state.channels);
  const [newChannelName, setNewChannelName] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newChannelName.trim()) {
      dispatch(createChannel(serverId, newChannelName));
      setNewChannelName('');
    }
  };

  const handleEdit = (channelId) => {
    if (editName.trim()) {
      dispatch(editChannel(channelId, editName));
      setEditMode(null);
      setEditName('');
    }
  };

  return (
    <div className="channel-list">
      <h3>Channels</h3>
      <ul>
        {channels.map(channel => (
          <li
            key={channel.id}
            className="channel-item"
            onClick={() => setSelectedChannelId(channel.id)}
          >
            {editMode === channel.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleEdit(channel.id)}>Save</button>
                <button onClick={() => setEditMode(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span onClick={() => setEditMode(channel.id)}>{channel.name}</span>
                <button onClick={() => dispatch(removeChannel(channel.id))}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="channel-form">
        <input
          type="text"
          placeholder="New channel name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
        />
        <button onClick={handleCreate}>Create</button>
      </div>
    </div>
  );
}
