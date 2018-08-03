import { combineReducers } from 'redux';
import playList from './modules/playList';

const rootReducer = combineReducers({
  playList,
});

export default rootReducer;
