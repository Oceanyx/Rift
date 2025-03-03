import { csrfFetch } from '../utils/csrf';
import socket from '../utils/socket';

const LOAD_MESSAGES = 'messages/loadMessages';
const ADD_MESSAGE = 'messages/addMessage';
const UPDATE_MESSAGE = 'messages/updateMessage';
const DELETE_MESSAGE = 'messages/deleteMessage';

const loadMessages = (messages) => ({
  type: LOAD_MESSAGES,
  payload: messages,
});

const addMessage = (message) => ({
  type: ADD_MESSAGE,
  payload: message,
});

const updateMessage = (message) => ({
  type: UPDATE_MESSAGE,
  payload: message,
});

const deleteMessage = (messageId) => ({
  type: DELETE_MESSAGE,
  payload: messageId,
});

export const fetchMessages = (channelId) => async (dispatch) => {
  const response = await csrfFetch(`/api/messages/channel/${channelId}`);
  const data = await response.json();
  dispatch(loadMessages(data.messages));
};

export const createMessage = (channelId, content) => async (dispatch) => {
  const response = await csrfFetch(`/api/messages/channel/${channelId}`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  dispatch(addMessage(data.message));
};

export const editMessage = (messageId, content) => async (dispatch) => {
  const response = await csrfFetch(`/api/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
  const data = await response.json();
  dispatch(updateMessage(data.message));
};

export const removeMessage = (messageId) => async (dispatch) => {
  await csrfFetch(`/api/messages/${messageId}`, { method: 'DELETE' });
  dispatch(deleteMessage(messageId));
};

const messagesReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_MESSAGES:
      return action.payload;
    case ADD_MESSAGE:
      return [...state, action.payload];
    case UPDATE_MESSAGE:
      return state.map(message =>
        message.id === action.payload.id ? action.payload : message
      );
    case DELETE_MESSAGE:
      return state.filter(message => message.id !== action.payload);
    default:
      return state;
  }
};

// WebSocket Integration
socket.on('MESSAGE_CREATED', (message) => {
  window.store.dispatch(addMessage(message));
});

socket.on('MESSAGE_UPDATED', (message) => {
  window.store.dispatch(updateMessage(message));
});

socket.on('MESSAGE_DELETED', ({ messageId }) => {
  window.store.dispatch(deleteMessage(messageId));
});

export default messagesReducer;
