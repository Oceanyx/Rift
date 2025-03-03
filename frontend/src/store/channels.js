import { csrfFetch } from '../utils/csrf';

const LOAD_CHANNELS = 'channels/loadChannels';

const loadChannels = (channels) => ({
  type: LOAD_CHANNELS,
  payload: channels,
});

export const fetchChannels = (serverId) => async (dispatch) => {
  const response = await csrfFetch(`/api/channels/server/${serverId}`);
  const data = await response.json();
  dispatch(loadChannels(data.channels));
};

const channelsReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_CHANNELS:
      return action.payload;
    default:
      return state;
  }
};

export default channelsReducer;
