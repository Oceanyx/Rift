import { csrfFetch } from '../utils/csrf';

const LOAD_MESSAGES = 'messages/loadMessages';
const ADD_MESSAGE = 'messages/addMessage';

const loadMessages = (messages) => ({
  type: LOAD_MESSAGES,
  payload: messages,
});

export const fetchMessages = (channelId) => async (dispatch) => {
  const response = await csrfFetch(`/api/messages/channel/${channelId}`);
  const data = await response.json();
  dispatch(loadMessages(data.messages));
};

export const addMessage = (message) => ({
  type: ADD_MESSAGE,
  payload: message,
});

const messagesReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_MESSAGES:
      return action.payload;
    case ADD_MESSAGE:
      return [...state, action.payload];
    default:
      return state;
  }
};

export default messagesReducer;
