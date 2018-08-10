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
// 获取歌曲音量
export function setVolume(val) {
  return {
    type: Types.SET_VOLUME,
    value: val
  }
}
// 获取播放顺序
export function setPlayOrder(val) {
  return {
    type: Types.SET_PLAY_ORDER,
    value: val
  }
}
// 获取播放状态
export function setPlayState(val) {
  return {
    type: Types.SET_PLAY_STATE,
    value: val
  }
}
// 获取随机播放列表
export function setShuffleList(val) {
  return {
    type: Types.SET_SHUFFLE_LIST,
    value: val
  }
}
// 获取当前播放歌曲
export function setCurrentSong(val) {
  return {
    type: Types.SET_CURRENT_SONG_INFO,
    value: val
  }
}
// 获取本地播放歌曲
export function setLocalPlayList(val) {
  return {
    type: Types.SET_LOCAL_PLAY_LIST,
    value: val
  }
}
// 获取最新歌曲
export function setNewest(val) {
  return {
    type: Types.SET_NEWEST,
    value: val
  }
}
