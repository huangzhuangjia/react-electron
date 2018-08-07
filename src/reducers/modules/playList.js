import { SETPLAYLIST } from '../action-types';

const initState = {
  playList: []
};

const playList = (state = initState, action) => {
  switch (action.type) {
    case SETPLAYLIST:
      return Object.assign({}, state, {
        playList: action.value
      })
    default:
      return state
  }
};

export default playList;
