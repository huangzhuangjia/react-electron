import { SET_ALBUM_LIST } from "../action-types";

const initState = {
  albumList: []
};

const Album = (state = initState, action) => {
  switch (action.type) {
    case SET_ALBUM_LIST:
      return Object.assign({}, state, {
        albumList: action.value
      });
    default:
      return state
  }
};

export default Album;