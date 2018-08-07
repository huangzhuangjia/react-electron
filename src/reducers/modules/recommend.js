import { SETRECOMMENDLIST } from "../action-types";

const initState = {
  recommendList: []
};

const Recommend = (state = initState, action) => {
  switch (action.type) {
    case SETRECOMMENDLIST:
      return Object.assign({}, state, {
        recommendList: action.value
      });
    default:
      return state
  }
};

export default Recommend;
