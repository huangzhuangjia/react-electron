import { SET_NEWEST } from "../action-types";

const initState = {
  newestList: []
};

const Recommend = (state = initState, action) => {
  switch (action.type) {
    case SET_NEWEST:
      return Object.assign({}, state, {
        newestList: action.value
      });
    default:
      return state
  }
};

export default Recommend;
