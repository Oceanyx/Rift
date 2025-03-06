import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/session';
import CreateChannelModal from './CreateChannelModal';
import EditChannelModal from './EditChannelModal';
import './ChannelList.css';
import socket from '../../utils/socket';

export default function ChannelList({ serverId, selectedChannelId, setSelectedChannelId }) {
  const dispatch = useDispatch();
  const channels = useSelector(state => state.channels);
  const servers = useSelector(state => state.servers);
  const user = useSelector(state => state.session.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    if (selectedChannelId) {
      socket.emit('joinChannel', selectedChannelId);
    }
    return () => {
      if (selectedChannelId) {
        socket.emit('leaveChannel', selectedChannelId);
      }
    };
  }, [selectedChannelId]);

  // Find the current server based on serverId
  const currentServer = servers.find(server => server.id === serverId);
  // Check ownership by comparing the owner's id from the server to the current user's id.
  const isOwner = currentServer && user && currentServer.owner_id === user.id;

  // Function to select channel id 1 if it exists; otherwise, select the first channel in the server.
  const selectFirstChannel = () => {
    // Support both camelCase and snake_case for server id property
    const serverChannels = channels.filter(channel =>
      channel.serverId === serverId || channel.server_id === serverId
    );
    const channelOne = serverChannels.find(ch => ch.id === 1);
    if (channelOne) {
      setSelectedChannelId(1);
    } else if (serverChannels.length > 0) {
      setSelectedChannelId(serverChannels[0].id);
    }
  };

  const handleAddChannel = () => {
    if (!isOwner) {
      alert("You do not have permission to create a channel because you do not own the server.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="channel-list">
      {/* Server Name Box at the Top */}
      <div className="server-name-box">
        {currentServer ? currentServer.name : "Loading..."}
      </div>

      {/* "Channels" Header with `+` Button */}
      <div className="channels-header">
        <span>Channels</span>
        <button className="add-channel-button" onClick={handleAddChannel}>+</button>
      </div>

      <ul>
        {channels.map(channel => (
          <li
            key={channel.id}
            className={`channel-item ${channel.id === selectedChannelId ? 'selected' : ''}`}
            onClick={() => setSelectedChannelId(channel.id)}
          >
            #&nbsp;
            <>
              <span>{channel.name}</span>
              <EditChannelModal 
                channel={channel} 
                isOwner={isOwner}
                onDelete={selectFirstChannel} 
              />
            </>
          </li>
        ))}
      </ul>

      {user && (
        <div 
          className="profile-box" 
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img src={user.avatar_url} alt="User Avatar" className="profile-avatar" />
          <span className="profile-username">{user.username}</span>

          {/* Dropdown for Logout */}
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        serverId={serverId} 
      />
    </div>
  );
}
