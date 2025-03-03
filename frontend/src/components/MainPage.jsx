import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ServerList from './Servers/ServerList';
import ChannelList from './Channels/ChannelList';
import ChannelMessages from './Channels/ChannelMessages';
import './MainPage.css';
import { fetchServers } from '../store/servers';

export default function MainPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  return (
    <div className="main-container">
      <div className="sidebar">
        <ServerList />
      </div>
      <div className="channel-container">
        <ChannelList />
        <ChannelMessages />
      </div>
    </div>
  );
}
