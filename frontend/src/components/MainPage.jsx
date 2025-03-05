import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ServerList from './Servers/ServerList';
import ChannelList from './Channels/ChannelList';
import ChannelMessages from './Channels/ChannelMessages';
import { fetchServers } from '../store/servers';
import { fetchChannels } from '../store/channels';
import './MainPage.css';

export default function MainPage() {
  const dispatch = useDispatch();
  const servers = useSelector(state => state.servers);
  const channels = useSelector(state => state.channels);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  // Fetch servers on mount
  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  // Auto-select the first server when servers load
  useEffect(() => {
    if (servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id);
    }
  }, [servers, selectedServerId]);

  // Fetch channels when a server is selected
  useEffect(() => {
    if (selectedServerId) {
      dispatch(fetchChannels(selectedServerId));
    }
  }, [dispatch, selectedServerId]);

  // Auto-select the first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  return (
    <div className="main-container">
      <div className="sidebar">
        <ServerList setSelectedServerId={setSelectedServerId} />
      </div>
      <div className="channel-container">
        {selectedServerId ? (
          <div className="channel-inner-container">
            <div className="channel-list-container">
              <ChannelList 
                serverId={selectedServerId} 
                setSelectedChannelId={setSelectedChannelId} 
              />
            </div>
            <div className="channel-messages-container">
              {selectedChannelId ? (
                <ChannelMessages channelId={selectedChannelId} />
              ) : (
                <div>Loading channels...</div>
              )}
            </div>
          </div>
        ) : (
          <div>Loading servers...</div>
        )}
      </div>
    </div>
  );
}
