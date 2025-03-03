import React from 'react';
import { useSelector } from 'react-redux';
import './ServerList.css';

export default function ServerList() {
  const servers = useSelector(state => state.servers);

  return (
    <div className="server-list">
      <h2>Your Servers</h2>
      <ul>
        {servers.map(server => (
          <li key={server.id}>
            {server.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
