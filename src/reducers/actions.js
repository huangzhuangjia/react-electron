import * as Types from './action-types';

export function setPlayList(val) {
  return {
    type: Types.SET_PLAY_LIST,
    value: val
  }
}
// 获取推荐歌单
export function setRecommendList(list) {
  return {
    type: Types.SET_RECOMMEND_LIST,
    value: list
  }
}

// 获取播放状态
export function setPlayUiPage(val) {
  return {
    type: Types.SET_PLAY_UI_PAGE,
    value: val
  }
}

// 获取歌曲信息
export function setSongInfo(val) {
  return {
    type: Types.SET_SONG_INFO,
    value: val
  }
}

export function setPlayOrder(val) {
  return {
    type: Types.SET_PLAY_ORDER,
    value: val
  }
}

export function setPlayState(val) {
  return {
    type: Types.SET_PLAY_STATE,
    value: val
  }
}

export function setShuffleList(val) {
  return {
    type: Types.SET_SHUFFLE_LIST,
    value: val
  }
}

export function setCurrentSong(val) {
  return {
    type: Types.SET_CURRENT_SONG_INFO,
    value: val
  }
}
