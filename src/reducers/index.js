import { combineReducers } from 'redux';
import main from './modules/main'
import Recommend from './modules/recommend';

const rootReducer = combineReducers({
  main,
  Recommend,
});

export default rootReducer;
