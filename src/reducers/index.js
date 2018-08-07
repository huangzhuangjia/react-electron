import { combineReducers } from 'redux';
import playList from './modules/playList';
import Recommend from './modules/recommend';

const rootReducer = combineReducers({
  playList,
  Recommend,
});

export default rootReducer;
