import { csrfFetch } from '../utils/csrf';

const LOAD_SERVERS = 'servers/loadServers';

const loadServers = (servers) => ({
  type: LOAD_SERVERS,
  payload: servers,
});

export const fetchServers = () => async (dispatch) => {
  const response = await csrfFetch('/api/servers/me');
  const data = await response.json();
  dispatch(loadServers(data.servers));
};

const serversReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_SERVERS:
      return action.payload;
    default:
      return state;
  }
};

export default serversReducer;
