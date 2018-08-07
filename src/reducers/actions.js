import * as Types from './action-types';

export function setPlayList(val) {
  return {
    type: Types.SETPLAYLIST,
    value: val
  }
}
// 获取推荐歌单
export function setRecommendList(list) {
  return {
    type: Types.SETRECOMMENDLIST,
    value: list
  }
}
