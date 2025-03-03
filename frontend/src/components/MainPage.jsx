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

  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  // selects 1st server upon loading
  useEffect(() => {
    if (servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id);
    }
  }, [servers, selectedServerId]);

  // fetches channels when server selected
  useEffect(() => {
    if (selectedServerId) {
      dispatch(fetchChannels(selectedServerId));
    }
  }, [dispatch, selectedServerId]);

  // selects 1st channel when loaded
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
          <>
            <ChannelList serverId={selectedServerId} setSelectedChannelId={setSelectedChannelId} />
            {selectedChannelId ? (
              <ChannelMessages channelId={selectedChannelId} />
            ) : (
              <div>Loading channels...</div>
            )}
          </>
        ) : (
          <div>Loading servers...</div>
        )}
      </div>
    </div>
  );
}
