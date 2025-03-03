import React from 'react';
import './ChannelList.css';

export default function ChannelList() {
  // Replace with Redux state once implemented
  const channels = [
    { id: 1, name: 'general' },
    { id: 2, name: 'random' }
  ];

  return (
    <div className="channel-list">
      <h3>Channels</h3>
      <ul>
        {channels.map(channel => (
          <li key={channel.id}>{channel.name}</li>
        ))}
      </ul>
    </div>
  );
}
