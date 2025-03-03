import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ServerList from './ServerList';
import ChannelList from './ChannelList';
import ChatWindow from './ChatWindow';
import Login from './Login';
import { restoreUser } from '../store/session';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <ServerList />
      </div>
      <div className="channel-pane">
        <ChannelList />
      </div>
      <div className="chat-pane">
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;
