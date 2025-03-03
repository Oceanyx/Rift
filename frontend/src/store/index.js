import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import sessionReducer from './session';
import serversReducer from './servers';
import channelsReducer from './channels';
import messagesReducer from './messages';
import rolesReducer from './roles';
import serverMembersReducer from './serverMembers';

const rootReducer = combineReducers({
  session: sessionReducer,
  servers: serversReducer,
  channels: channelsReducer,
  messages: messagesReducer,
  roles: rolesReducer,
  serverMembers: serverMembersReducer,
});

let enhancer = applyMiddleware(thunk);

const configureStore = (preloadedState) => createStore(rootReducer, preloadedState, enhancer);

export default configureStore;
