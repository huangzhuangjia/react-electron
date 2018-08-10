import React, {Component} from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Progressbar from "progressbar.js"
import shuffleArray from 'shuffle-array'
import Home from './home'
import Search from './search'
import ListDetail from './listDetail'
import PlayDetail from './playDetail'
import store from "../store"
import RingLoading from '../components/ringLoading'
import ControlBar from '../components/controlBar'
import PlayList from '../components/playList'
import * as Actions from '../reducers/actions'
import eventEmitter from '../config/eventEmitter'
import * as Events from '../config/event-types'
import API from '../api'
import db from '../config/db'

const ipcRenderer = window.electron.ipcRenderer;

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      snackbar: false,
      playListState: false,
      snackbarText: '',
      playPercent: 0,
      audioDuration: 0,
      audioCurDuration: 0,
    };
  }

  switchPlay(state) {
    if (this.audio && this.audio.src && this.audio.src.indexOf('/null') == -1) {
      if (state) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
      store.dispatch(Actions.setPlayState(state));
      ipcRenderer.send('playSwitch', state);
    }
  }

  toUIPage() {
    store.dispatch(Actions.setPlayUiPage(true));
    setTimeout(() => {
      eventEmitter.emit(Events.UPDATETIMEPERCENT);
      eventEmitter.emit(Events.PLAYANIMATE);
    })
  }

  componentWillMount() {
    // 获取本地数据
    let volume = db.get('volume').value();
    let playOrder = db.get('playOrder').value() || 0;
    let playlist = db.get('playList').value() || [];
    let localPlayList = db.get('localPlayList').value() || [];
    // let recommendCatch = db.get('recommendCatch').value() || [];
    // let newestCatch = db.get('newestCatch').value() || [];
    // let albumCatch = db.get('albumCatch').value() || [];
    // store.dispatch(Actions.setRecommend(recommendCatch));
    // store.dispatch(Actions.setNewest(newestCatch));
    // store.dispatch(Actions.setAlbum(albumCatch));
    if (volume) {
      volume = parseFloat(volume);
    } else {
      volume = 0.5;
    }
    store.dispatch(Actions.setVolume(volume));
    store.dispatch(Actions.setPlayOrder(playOrder));
    store.dispatch(Actions.setPlayList(playlist));
    store.dispatch(Actions.setLocalPlayList(localPlayList));
    if (playOrder === 2) {
      this.createShuffleList();
    }
  }

  componentDidMount() {
    this.audio = document.getElementById('audio');
    this.audio.addEventListener('durationchange', () => {
      this.durationchange();
    });
    this.audio.addEventListener('timeupdate', () => {
      this.timeupdate();
    });
    this.audio.addEventListener('ended', () => {
      this.playNext(1);
    });
    ipcRenderer.on('next', () => {
      this.playNext(1);
    });
    ipcRenderer.on('pre', () => {
      this.playNext(-1);
    });
    ipcRenderer.on('switch', () => {
      this.switchPlay(!store.getState().main.playState);
    });
    eventEmitter.on(Events.NEXT, (type) => {
      this.playNext(type)
    });
    eventEmitter.on(Events.RINGLOADING, (state) => {
      if (state) {
        this.loadingOpen();
      } else {
        this.loadingClose();
      }
    });
    eventEmitter.on(Events.SWITCHORDER, () => {
      this.switchOrder();
    });
    eventEmitter.on(Events.CREATESHUFFLE, () => {
      this.createShuffleList();
    });
    eventEmitter.on(Events.SNACKBAROPEN, (text, dur) => {
      this.snackbarOpen(text, dur);
    });
    eventEmitter.on(Events.BATCHADD, (item) => {
      this.batchAddToPlayList(item);
    });
    eventEmitter.on(Events.INITAUDIO, (restore) => {
      this.initAudio(restore);
    });
    eventEmitter.on(Events.SWITCHPLAY, (state) => {
      this.switchPlay(state);
    });
    this.progress = new Progressbar.Circle('#progress', {
      strokeWidth: 2,
      trailWidth: 2,
      trailColor: 'rgba(102,102,102,0.2)',
      color: 'rgba(102,102,102, 1)',
    });
    let currentSongId = db.get('currentSongId').value();
    if(currentSongId) {
      this.restore(currentSongId);
    }
  }
  // 初始化播放器
  initAudio(restore) {
    let currentSong = store.getState().main.currentSong;
    let url = currentSong.url;
    if (!url) {
      this.snackbarOpen('获取资源失败', 2000);
      return;
    }
    this.getSongInfo(currentSong.id);
    this.audio.crossOrigin = 'anonymous';
    this.audio.src = url;
    if (!restore) {
      this.audio.currentTime = 0;
      this.audio.play();
      store.dispatch(Actions.setPlayState(true));
    }
  }
  // 获取歌曲信息
  getSongInfo(id) {
    API.getSongInfo(`/song/detail?ids=${id}`).then(res => {
      if (res.code === 200) {
        let songData = {};
        if (res.songs.length > 0) {
          songData = res.songs[0];
          store.dispatch(Actions.setSongInfo(songData));
          if (songData.name && songData.ar[0].name) {
            let playList = store.getState().main.playList || [];
            let songObj = {
              id: id,
              name: songData.name || '',
              ar: songData.ar[0].name || '',
              from: 'online',
            };
            let hasRepeat = false;
            playList.map((d) => {
              if (d.id && d.id === songObj.id) {
                hasRepeat = true;
              }
            });
            if (!hasRepeat) {
              playList.unshift(songObj);
              store.dispatch(Actions.setPlayList(playList));
              setTimeout(() => {
                this.savePlayList();
                if (store.getState().main.shuffleList.length > 0) {
                  this.insertSongToShuffleList([songObj])
                }
              })
            }
          }
        }
      }
    })
  }

  batchAddToPlayList(item) {
    let playList = store.getState().main.playList || [];
    let addItem = [];
    item.map((data) => {
      let repeat = false;
      playList.map((d, j) => {
        if (data.id === d.id) {
          repeat = true;
        }
      });
      if (!repeat) {
        addItem.push(data);
      }
    });
    playList = addItem.concat(playList);
    store.dispatch(Actions.setPlayList(playList));
    setTimeout(() => {
      this.savePlayList();
      eventEmitter.emit(Events.RINGLOADING, false);
      eventEmitter.emit(Events.SNACKBAROPEN, '添加成功!');
      if (store.getState().main.shuffleList.length > 0) {
        this.insertSongToShuffleList(addItem)
      } else {
        this.createShuffleList();
      }
    });
  }

  // 随机插入播放列表
  insertSongToShuffleList(item) {
    if (!item) return;
    let shuffleList = store.getState().main.shuffleList;
    let len = shuffleList.length;
    (item || []).map((data) => {
      let insertPosition = Math.floor(len * Math.random());
      shuffleList = shuffleList.splice(insertPosition, 0, data);
    });
    store.dispatch(Actions.setShuffleList(shuffleList));
  }

  resetPlayer() {
    store.dispatch(Actions.setCurrentSong({}));
    store.dispatch(Actions.setSongInfo({}));
    store.dispatch(Actions.setPlayState(false));
    this.audio.src = 'null';
  }

  // 音频播放时长
  durationchange() {
    let audioDuration = this.audio.duration;
    this.setState({
      audioDuration: audioDuration,
    });
  }

  // 播放时间更新进度加载
  timeupdate() {
    let currentTime = this.audio.currentTime;
    let audioDuration = this.state.audioDuration;
    let playPercent = currentTime / audioDuration;
    //连续setState会造成动画卡顿,直接操作DOM性能比较高
    // this.setState({
    //     playPercent: playPercent,
    //     audioCurDuration: currentTime,
    // });
    this.progress.animate(playPercent);
    if (store.getState().main.UIPage) {
      eventEmitter.emit(Events.PLAYPERCENT);
    }
  }

  // loading显示隐藏
  loadingOpen() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.setState({
      loading: true,
    });
    //如果请求超过10s则认为请求超时,关闭loading动画
    this.loadingTimer = setTimeout(() => {
      this.loadingClose();
      this.snackbarOpen('请求超时!', 1500);
    }, 10000);
  }

  loadingClose() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.setState({
      loading: false,
    });
  }

  // 创建随机播放列表
  createShuffleList() {
    let playlist = db.get('playList').value() || [];
    let shuffleList = shuffleArray(playlist, {copy: true});
    store.dispatch(Actions.setShuffleList(shuffleList));
  }

  // tips提示
  snackbarOpen(text, dur) {
    clearTimeout(this.snackbarTimer);
    this.setState({
      snackbar: true,
      snackbarText: text,
    });
    this.snackbarTimer = setTimeout(() => {
      this.snackbarClose();
    }, dur || 2000)
  }

  snackbarClose() {
    this.setState({
      snackbar: false,
    });
  }

  id2Song(id, restore) {
    eventEmitter.emit(Events.RINGLOADING, true);
    API.getMusicUrl(`/music/url?id=${id}`).then(data => {
      if (data.code === 200) {
        if (data.data.length > 0) {
          store.dispatch(Actions.setCurrentSong(data.data[0]));
          eventEmitter.emit(Events.INITAUDIO, restore);
        }
      }
      eventEmitter.emit(Events.RINGLOADING, false);
    })
  }
  // 切换播放列表的播放顺序
  switchOrder() {
    let playOrder = store.getState().main.playOrder;
    if (playOrder === 0) {
      playOrder = 1;
    } else if (playOrder === 1) {
      playOrder = 2;
    } else if (playOrder === 2) {
      playOrder = 0;
    }
    let tipItem = ['列表循环', '单曲循环', '随机播放'];
    store.dispatch(Actions.setPlayOrder(playOrder));
    eventEmitter.emit(Events.SNACKBAROPEN, tipItem[playOrder]);
    let shuffleList = store.getState().main.shuffleList;
    if (shuffleList && shuffleList === 0) {
      eventEmitter.emit(Events.CREATESHUFFLE);
    }
  }
  // 获取当前播放歌曲
  restore(id) {
    let playList = store.getState().main.playList;
    let curSong = {};
    playList.map((data) => {
      if(data.id === id) {
        curSong = data;
      }
    });
    if(curSong.from === 'online') {
      this.id2Song(curSong.id, true);
    }else if(curSong.from === 'local') {
      let localPlayList = store.getState().main.localPlayList || [];
      localPlayList.map((data) => {
        if(data.id === curSong.id) {
          this.initLocalAudio(data, true);
        }
      })
    }
    let currentTime = db.get('currentTime').value() || 0;
    if(currentTime > 0) {
      this.audio.currentTime = currentTime;
      this.timeupdate();
    }
  }
  // 切换下一首歌曲
  playNext(type) {
    let storeMain = store.getState().main;
    let playOrder = storeMain.playOrder,
      playList = storeMain.playList,
      shuffleList = storeMain.shuffleList,
      currentSong = storeMain.currentSong,
      nextIndex = 0,
      curIndex = 0,
      nextSong;
    if (playList.length === 0) {
      this.resetPlayer();
      return;
    }
    if (playOrder < 2) {
      playList.map((data, k) => {
        if (data.id === currentSong.id) {
          curIndex = k;
        }
      });
    } else {
      shuffleList.map((data, k) => {
        if (data.id === currentSong.id) {
          curIndex = k;
        }
      });
    }

    if (playOrder === 0 || playOrder === 2) {
      nextIndex = curIndex + type;
      if (nextIndex < 0) {
        nextIndex = playList.length - 1;
      } else if (nextIndex === playList.length) {
        nextIndex = 0;
      }
    } else if (playOrder === 1) {
      nextIndex = curIndex;
    }
    if (playOrder < 2) {
      nextSong = playList[nextIndex];
    } else {
      nextSong = shuffleList[nextIndex];
    }
    // 判断下一首播放歌曲是在线还是本地
    if (nextSong.from === 'online') {
      this.id2Song(nextSong.id);
    } else if (nextSong.from === 'local') {
      let localPlayList = store.getState().main.localPlayList || [];
      localPlayList.map((data) => {
        if (data.id === nextSong.id) {
          this.initLocalAudio(data);
        }
      })
    }
  }

  initLocalAudio(data, restore) {
    this.audio.src = data.url;
    let o = {
      id: data.id,
      name: data.name,
      al: {picUrl: data.cover},
      ar: [{name: data.artist}],
    };
    store.dispatch(Actions.setSongInfo(o));
    store.dispatch(Actions.setCurrentSong(o));
    if (!restore) {
      this.audio.currentTime = 0;
      this.audio.play();
      store.dispatch(Actions.setPlayState(true));
      let playList = store.getState().main.playList || [];
      let songObj = {
        id: data.id,
        name: data.name || '',
        ar: data.artist || '',
        from: 'local',
      };
      let hasRepeat = false;
      playList.map((d) => {
        if (d.id && d.id === songObj.id) {
          hasRepeat = true;
        }
      });
      if (!hasRepeat) {
        playList.unshift(songObj);
        store.dispatch(Actions.setPlayList(playList));
        setTimeout(() => {
          this.savePlayList();
          if (store.getState().main.shuffleList.length > 0) {
            this.insertSongToShuffleList([songObj])
          }
        })
      }
    }
  }
  // 保存当前列表信息在本地
  savePlayList() {
    let playList = store.getState().main.playList || [];
    db.set('playList', playList).write();
  }
  // 点击显示当前播放列表
  targetingCur() {
    let curPlayRow = document.getElementsByClassName('row-playing');
    this.setState({
      playListState: true,
    });
    if (curPlayRow.length > 0) {
      curPlayRow = curPlayRow[0];
      let top = curPlayRow.offsetTop - 40 * 5;
      if (top < 0) {
        top = 0;
      }
      this.refs.playList.refs.songListItem.scrollTop = top;
    }
  }

  listToPlay(data) {
    if (data.from === 'local') {
      let localPlayList = store.getState().main.localPlayList || [];
      localPlayList.map((song) => {
        if (data.id === song.id) {
          this.initLocalAudio(song);
        }
      })
    } else if (data.from === 'online') {
      this.id2Song(data.id);
    }
  }
  // 删除播放列表
  delList(id, key) {
    let playList = store.getState().main.playList || [];
    if (id === 'all') {
      playList = [];
    } else {
      if (playList[key].id === id) {
        playList.splice(key, 1);
      }
    }
    store.dispatch(Actions.setPlayList(playList));
    setTimeout(() => {
      this.savePlayList();
      if (store.getState().main.currentSong.id === id) {
        this.playNext(1);
      }
    });
  }

  render() {
    let state = this.state;
    let storeMain = store.getState().main;
    let songInfo = storeMain.songInfo;
    if (!songInfo.hasOwnProperty('al')) {
      songInfo.al = {};
    }
    if (!songInfo.hasOwnProperty('ar')) {
      songInfo.ar = [{}];
    }
    return (
      <Router>
        <div className="play-wrapper">
          {
            state.loading ?
              <div className="ringLoading-wrap">
                <RingLoading/>
              </div> : null
          }
          <PlayDetail/>
          {
            this.state.snackbar ?
              <div className="snackbar">{this.state.snackbarText}</div> : null
          }
          {/*播放列表*/}
          <PlayList playList={storeMain.playList}
                    playListState={state.playListState}
                    playOrder={storeMain.playOrder}
                    currentSong={storeMain.currentSong}
                    onClose={() => {
                      this.setState({
                        playListState: false,
                      })
                    }}
                    switchOrder={() => {
                      eventEmitter.emit(Events.SWITCHORDER)
                    }}
                    delList={this.delList.bind(this)}
                    listToPlay={this.listToPlay.bind(this)}
                    ref="playList"/>
          {/*控制条*/}
          <ControlBar isUIPage={storeMain.UIPage}
                      playState={storeMain.playState}
                      songInfo={songInfo}
                      toUIPage={this.toUIPage.bind(this)}
                      switchPlay={this.switchPlay.bind(this)}
                      targetingCur={this.targetingCur.bind(this)}/>
          <audio id="audio"></audio>
          {/*路由*/}
          <Switch>
            <Route path="/search" component={Search}/>
            <Route path="/home" component={Home}/>
            <Route path="/listDetail/:id" component={ListDetail}/>
            <Route path="/" component={Home}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
