import { csrfFetch } from '../utils/csrf';

const LOAD_ROLES = 'roles/loadRoles';

const loadRoles = (roles) => ({
  type: LOAD_ROLES,
  payload: roles,
});

export const fetchRoles = (serverId) => async (dispatch) => {
  const response = await csrfFetch(`/api/roles/server/${serverId}`);
  const data = await response.json();
  dispatch(loadRoles(data.roles));
};

const rolesReducer = (state = [], action) => {
  switch (action.type) {
    case LOAD_ROLES:
      return action.payload;
    default:
      return state;
  }
};

export default rolesReducer;
