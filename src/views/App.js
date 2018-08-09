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
import * as Actions from '../reducers/actions'
import eventEmitter from '../config/eventEmitter'
import * as Events from '../config/event-types'
import db from '../config/db';

const ipcRenderer = window.electron.ipcRenderer;
const coverImg = require('../assets/image/logo.png');
const playOrderMap = [
  {icon: 'icon-list-loop', name: '列表循环'},
  {icon: 'icon-single-loop', name: '单曲循环'},
  {icon: 'icon-bofangye-caozuolan-suijibofang', name: '随机播放'}
];

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
    if(this.audio && this.audio.src && this.audio.src.indexOf('/null') == -1) {
      if(state) {
        this.audio.play();
      }else {
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
    eventEmitter.on(Events.RINGLOADING, (state) => {
      if(state) {
        this.loadingOpen();
      }else {
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
    this.progress = new Progressbar.Circle('#progress', {
      strokeWidth: 2,
      trailWidth: 2,
      trailColor: 'rgba(102,102,102,0.2)',
      color: 'rgba(102,102,102, 1)',
    });
  }

  batchAddToPlayList(item) {
    let playList = store.getState().main.playList || [];
    let addItem = [];
    item.map((data, k) => {
      let repeat = false;
      playList.map((d, j) => {
        if(data.id === d.id) {
          repeat = true;
        }
      });
      if(!repeat) {
        addItem.push(data);
      }
    });
    playList = addItem.concat(playList);
    store.dispatch(Actions.setPlayList(playList));
    setTimeout(() => {
      this.savePlayList();
      eventEmitter.emit(Events.RINGLOADING, false);
      eventEmitter.emit(Events.SNACKBAROPEN, '添加成功!');
      if(store.getState().main.shuffleList.length > 0) {
        this.insertSongToShuffleList(addItem)
      }else {
        this.createShuffleList();
      }
    });
  }

  insertSongToShuffleList(item) {
    if(!item) return;
    let shuffleList = store.getState().main.shuffleList;
    let len = shuffleList.length;
    (item || []).map((data, k) => {
      let insertPosition = Math.floor(len * Math.random());
      shuffleList = shuffleList.splice(insertPosition, 0, data);
    });
    store.dispatch(Actions.setShuffleList(shuffleList));
  }

  durationchange() {
    let audioDuration = this.audio.duration;
    this.setState({
      audioDuration: audioDuration,
    });
  }

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
    if(store.getState().main.UIPage) {
      eventEmitter.emit(Events.PLAYPERCENT);
    }
  }

  loadingOpen() {
    if(this.loadingTimer) {
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
    if(this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    this.setState({
      loading: false,
    });
  }

  createShuffleList() {
    let playlist = db.get('playList').value() || [];
    let shuffleList = shuffleArray(playlist, {copy: true });
    store.dispatch(Actions.setShuffleList(shuffleList));
  }

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

  switchOrder() {
    let playOrder = store.getState().main.playOrder;
    if(playOrder === 0) {
      playOrder = 1;
    }else if(playOrder === 1) {
      playOrder = 2;
    }else if(playOrder === 2) {
      playOrder = 0;
    }
    let tipItem = ['列表循环', '单曲循环', '随机播放'];
    store.dispatch(Actions.setPlayOrder(playOrder));
    eventEmitter.emit(Events.SNACKBAROPEN, tipItem[playOrder]);
    let shuffleList = store.getState().main.shuffleList;
    if(shuffleList && shuffleList === 0) {
      eventEmitter.emit(Events.CREATESHUFFLE);
    }
  }

  playNext(type) {

  }

  savePlayList() {
    let playList = store.getState().main.playList || [];
    db.set('playList', playList).write();
  }

  targetingCur() {
    let curPlayRow = document.getElementsByClassName('row-playing');
    if(curPlayRow.length > 0) {
      curPlayRow = curPlayRow[0];
      let top = curPlayRow.offsetTop - 40 * 5;
      if(top < 0) {
        top = 0;
      }
      this.refs.songListItem.scrollTop = top;
    }
  }

  delList(id, key) {
    let playList = store.getState().main.playList || [];
    if(id === 'all') {
      playList = [];
    }else {
      if(playList[key].id === id) {
        playList.splice(key, 1);
      }
    }
    store.dispatch(Actions.setPlayList(playList));
    setTimeout(() => {
      this.savePlayList();
      this.playNext(1);
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
            state.loading?
              <div className="ringLoading-wrap">
                <RingLoading/>
              </div>:null
          }
          <PlayDetail/>
          {
            this.state.snackbar?
              <div className="snackbar">{this.state.snackbarText}</div>:null
          }
          <div className={`play-list-dialog ${state.playListState ? 'play-list-dialog-active' : ''}`}>
            <div className={`mask ${state.playListState ? 'mask-active' : ''}`} onClick={() => {
              this.setState({
                playListState: false,
              })
            }}></div>
            <div className={`list-wrap ${state.playListState ? 'list-wrap-active' : ''}`}>
              <div className="list-wrap-head">
                <div className="label" onClick={() => {
                  eventEmitter.emit(Events.SWITCHORDER)
                }}><i
                  className={`iconfont ${playOrderMap[storeMain.playOrder].icon}`}></i>{playOrderMap[storeMain.playOrder].name} ({storeMain.playList.length || 0})
                </div>
                <div className="clear iconfont icon-shanchu" onClick={this.delList.bind(this, 'all')}></div>
              </div>
              <div className="list-item" ref="songListItem">
                {
                  storeMain.playList.map((data, k) => {
                    return (
                      <div className={`${storeMain.currentSong.id == data.id ? 'row-playing' : ''} row`} key={k}
                           onDoubleClick={this.listToPlay.bind(this, data)}>
                        <div className="info">{data.name}<span> - {data.ar}</span></div>
                        <span className="del iconfont icon-guanbi" onClick={this.delList.bind(this, data.id, k)}></span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
          <div className={`fix-control ${storeMain.UIPage ? '' : 'fix-control-active'}`}>
            <div className="cover" onClick={this.toUIPage.bind(this)}>
              <img src={coverImg}/>
            </div>
            <div className="info" onClick={this.toUIPage.bind(this)}>
              <div className="name">{songInfo.name || ''}</div>
              <div className="singer">{songInfo.ar[0].name || ''}</div>
            </div>
            <div className={`play-icon`} onClick={(e) => {
              this.switchPlay(!storeMain.playState);
            }}>
              <div className={`icon iconfont ${storeMain.playState ? 'icon-weibiaoti519' : 'icon-bofang2'}`}></div>
              <div className="progress" id="progress"></div>
            </div>
            <div className="play-list iconfont icon-liebiao" onClick={() => {
              this.targetingCur();
              this.setState({
                playListState: true,
              })
            }}></div>
          </div>
          <audio id="audio"></audio>
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
