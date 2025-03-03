// frontend/src/components/ServerList/ServerList.jsx
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { fetchServers } from '../../store/servers'; // Import the action
import './ServerList.css';

const ServerList = () => {
  const dispatch = useDispatch();
  // Get servers with a fallback to empty array
  const servers = useSelector(state => state.servers?.list || []);
  
  // Fetch servers when component mounts
  useEffect(() => {
    dispatch(fetchServers());
  }, [dispatch]);

  return (
    <div className="server-list-container">
      <NavLink to="/" className="server-icon home-server">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
        </svg>
      </NavLink>
      <div className="server-separator" />
      {servers.map(server => (
        <NavLink 
          key={server.id}
          to={`/servers/${server.id}`}
          className="server-icon"
        >
          <img src={server.icon_url} alt={server.name} />
        </NavLink>
      ))}
    </div>
  );
};

export default ServerList;