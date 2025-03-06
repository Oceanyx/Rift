import { csrfFetch } from '../utils/csrf';

const LOAD_CHANNELS = 'channels/loadChannels';
const ADD_CHANNEL = 'channels/addChannel';
const UPDATE_CHANNEL = 'channels/updateChannel';
const DELETE_CHANNEL = 'channels/deleteChannel';

const loadChannels = (channels) => ({
  type: LOAD_CHANNELS,
  payload: channels,
});

const addChannel = (channel) => ({
  type: ADD_CHANNEL,
  payload: channel,
});

const updateChannel = (channel) => ({
  type: UPDATE_CHANNEL,
  payload: channel,
});

const deleteChannel = (channelId) => ({
  type: DELETE_CHANNEL,
  payload: channelId,
});

export const fetchChannels = (serverId) => async (dispatch) => {
  const response = await csrfFetch(`/api/channels/server/${serverId}`);
  const data = await response.json();
  dispatch(loadChannels(data.channels));
};

export const createChannel = (serverId, name) => async (dispatch) => {
  const response = await csrfFetch(`/api/channels/server/${serverId}`, {
    method: 'POST',
    body: JSON.stringify({ name, type: 'text' })
  });
  const data = await response.json();
  dispatch(addChannel(data.channel));
};

export const editChannel = (channelId, name) => async (dispatch, getState) => {
    const currentChannel = getState().channels.find(channel => channel.id === channelId);
    const type = currentChannel ? currentChannel.type : 'text';
  
    const response = await csrfFetch(`/api/channels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, type })
    });
    const data = await response.json();
    dispatch(updateChannel(data.channel));
  };

export const removeChannel = (channelId) => async (dispatch) => {
  await csrfFetch(`/api/channels/${channelId}`, { method: 'DELETE' });
  dispatch(deleteChannel(channelId));
};

const channelsReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_CHANNELS:
      return action.payload;
    case ADD_CHANNEL:
      if (state.find(channel => channel.id === action.payload.id)) {
        return state;
      }
      return [...state, action.payload];
    case UPDATE_CHANNEL:
      return state.map(channel =>
        channel.id === action.payload.id ? action.payload : channel
      );
    case DELETE_CHANNEL:
      return state.filter(channel => channel.id !== action.payload);
    default:
      return state;
  }
};

export {
  loadChannels,
  addChannel,
  updateChannel,
  deleteChannel
};

export default channelsReducer;

