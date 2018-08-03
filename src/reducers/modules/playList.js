import * as TYPE from '../action-types';

const state = {
  playList: []
};

const playList = (state = state, action) => {
  switch (action.type) {
    case TYPE.SETPLAYLIST:
      return Object.assign({}, state, {
        playList: action.value
      })
  }
};

export default playList;
