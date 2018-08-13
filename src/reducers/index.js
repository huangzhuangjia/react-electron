import { combineReducers } from 'redux'
import main from './modules/main'
import recommend from './modules/recommend'
import newSong from './modules/newSong'
import album from './modules/album'

const rootReducer = combineReducers({
  main,
  recommend,
  newSong,
  album
});

export default rootReducer;
