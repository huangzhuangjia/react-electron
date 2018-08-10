import {
  SET_PLAY_UI_PAGE,
  SET_SONG_INFO,
  SET_VOLUME,
  SET_PLAY_ORDER,
  SET_PLAY_LIST,
  SET_SHUFFLE_LIST,
  SET_PLAY_STATE,
  SET_CURRENT_SONG_INFO,
  SET_LOCAL_PLAY_LIST
} from '../action-types';

const initState = {
  // 是否进入播放页面
  UIPage: false,
  // 歌曲信息
  songInfo: {},
  // 音量
  volume: 0,
  // 播放顺序
  playOrder: 0,
  // 播放列表
  playList: [],
  // 随机播放列表
  shuffleList: [],
  // 播放状态
  playState: false,
  // 当前歌曲
  currentSong: {},
  // 本地播放列表
  localPlayList: []
};

const main = (state = initState, action) => {
  switch (action.type) {
    case SET_PLAY_UI_PAGE:
      return Object.assign({}, state, {
        UIPage: action.value
      })
    case SET_SONG_INFO:
      return Object.assign({}, state, {
        songInfo: action.value
      });
    case SET_VOLUME:
      return Object.assign({}, state, {
        volume: action.value
      });
    case SET_PLAY_ORDER:
      return Object.assign({}, state, {
        playOrder: action.value
      });
    case SET_PLAY_LIST:
      return Object.assign({}, state, {
        playList: action.value
      });
    case SET_SHUFFLE_LIST:
      return Object.assign({}, state, {
        shuffleList: action.value
      });
    case SET_PLAY_STATE:
      return Object.assign({}, state, {
        playState: action.value
      });
    case SET_CURRENT_SONG_INFO:
      return Object.assign({}, state, {
        currentSong: action.value
      });
    case SET_LOCAL_PLAY_LIST:
      return Object.assign({}, state, {
        localPlayList: action.value
      });
    default:
      return state
  }
};

export default main;
