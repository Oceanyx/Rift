import { useSelector } from 'react-redux';
import './ServerList.css';

export default function ServerList({ setSelectedServerId }) {
  const servers = useSelector(state => state.servers);

  return (
    <div className="server-list">
      <h3>Your Servers</h3>
      <ul>
        {servers.map(server => (
          <li key={server.id} onClick={() => setSelectedServerId(server.id)}>
            {server.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
