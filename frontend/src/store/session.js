import { csrfFetch } from '../utils/csrf';

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER
  };
};

export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({
      credential,
      password
    })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};
export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  
  try {
    const response = await csrfFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ username, firstName, lastName, email, password })
    });

    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
  } catch (error) {
    // Clone the response before reading it
    // This is important because Response objects can only be read once
    const clonedResponse = error.clone();
    
    try {
      // Try to parse the error response as JSON
      const errorData = await error.json();
      return Promise.reject({
        errors: errorData.errors || {},
        message: errorData.message || "An error occurred during signup"
      });
    } catch (jsonError) {
      // If JSON parsing fails, try text
      console.error("Error parsing JSON from response:", jsonError);
      
      try {
        const errorText = await clonedResponse.text();
        return Promise.reject({
          message: errorText || "An error occurred during signup",
          errors: {}
        });
      } catch (textError) {
        // If all else fails
        console.error("Error getting text from response:", textError);
        return Promise.reject({
          message: "An error occurred during signup",
          errors: {}
        });
      }
    }
  }
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
      method: 'DELETE'
    });
    dispatch(removeUser());
    return response;
  };

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch("/api/session");
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
  };

export default sessionReducer;