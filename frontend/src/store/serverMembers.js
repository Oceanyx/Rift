import { csrfFetch } from '../utils/csrf';

const LOAD_MEMBERS = 'serverMembers/loadMembers';

const loadMembers = (members) => ({
  type: LOAD_MEMBERS,
  payload: members,
});

export const fetchServerMembers = (serverId) => async (dispatch) => {
  const response = await csrfFetch(`/api/server-members/server/${serverId}`);
  const data = await response.json();
  dispatch(loadMembers(data.members));
};

const serverMembersReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_MEMBERS:
      return action.payload;
    default:
      return state;
  }
};

export default serverMembersReducer;
