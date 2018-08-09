import { SET_RECOMMEND_LIST } from "../action-types";

const initState = {
  recommendList: []
};

const Recommend = (state = initState, action) => {
  switch (action.type) {
    case SET_RECOMMEND_LIST:
      return Object.assign({}, state, {
        recommendList: action.value
      });
    default:
      return state
  }
};

export default Recommend;
