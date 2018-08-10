import { combineReducers } from 'redux';
import main from './modules/main'
import recommend from './modules/recommend';
import newSong from './modules/newSong'

const rootReducer = combineReducers({
  main,
  recommend,
  newSong,
});

export default rootReducer;
