import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import Moment from 'moment'
import Swiper from 'swiper'
import Recommend from '../recommend'
import NewSong from '../newSong'
import Album from '../ablum'
import eventEmitter from '../../config/eventEmitter'
import * as Events from '../../config/event-types'
import store from "../../store"
import db from '../../config/db'

const remote = window.electron.remote;

class Home extends Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      recommendLoad: false,
      newestLoad: false,
      albumLoad: false,
      tabs: [
        {id: 0, name: '推荐歌单'},
        {id: 1, name: '最新单曲'},
        {id: 2, name: '新碟上架'},
        {id: 3, name: '本地歌曲'},
      ]
    }
  }
  // 缓存数据到本地
  catchData() {
    let vol = store.getState().main.volume;
    let playOrder = store.getState().main.playOrder;
    let currentSongId = store.getState().main.currentSong.id || '';
    let currentTime = document.getElementById('audio').currentTime;
    db.set('volume', vol).write();
    db.set('playOrder', playOrder).write();
    db.set('currentSongId', currentSongId).write();
    db.set('currentTime', currentTime).write();
    let recommendList = store.getState().recommend.recommendList || [];
    let newestList = store.getState().newSong.newestList || [];
    let albumList = store.getState().album.albumList || [];
    let albumTotal = this.refs.album.state.total;
    let albumOffset = this.refs.album.state.offset;
    let catchTimestamp = new Date().getTime();
    db.set('recommendCatch', recommendList).write();
    db.set('newestCatch', newestList).write();
    db.set('albumCatch', albumList).write();
    db.set('albumOffsetCatch', albumOffset).write();
    db.set('albumTotalCatch', albumTotal).write();
    db.set('catchTimestamp', catchTimestamp).write();
  }

  closeWindow() {
    this.catchData();
    remote.getCurrentWindow().close();
  }

  minWindow() {
    remote.getCurrentWindow().minimize();
  }

  switchTab(index) {
    this.mySwiper.slideTo(index);
    this.setState({
      activeTab: index,
    })
  }

  initList() {
    let activeTab = this.state.activeTab;
    if(activeTab === 0 && !this.state.recommendLoad) {
      this.refs.recommend.getRecommendList();
      this.setState({
        recommendLoad: true,
      });
    }else if(activeTab === 1 && !this.state.newestLoad) {
      this.refs.newSong.getNewest();
      this.setState({
        newestLoad: true,
      });
    }else if(activeTab === 2 && !this.state.albumLoad) {
      this.refs.album.getAlbum();
      this.setState({
        albumLoad: true,
      });
    }
  }
  componentWillMount() {
    let catchTimestamp = db.get('catchTimestamp').value() || 0;
    let albumOffsetCatch = db.get('albumOffsetCatch').value() || 0;
    let albumTotalCatch = db.get('albumTotalCatch').value() || 0;
    let now = new Date().getTime();
    /**
     * 首页数据一天一更新,载入后先判断缓存的数据是否在当天如果不在了再去获取更新
     */
    if(Moment(catchTimestamp).isSame(now, 'day')) {
      let recommendList = store.getState().recommend.recommendList || [],
        newestList = store.getState().newSong.newestList || [],
        albumList = store.getState().album.albumList || [];
      let recommendLoad = false,
        newestLoad = false,
        albumLoad = false;
      if(recommendList.length > 0) {
        recommendLoad = true;
      }
      if(newestList.length > 0) {
        newestLoad = true;
      }
      if(albumList.length > 0) {
        albumLoad = true;
        setTimeout(() => {
          this.refs.album.setState({
            offset: albumOffsetCatch,
            total: albumTotalCatch,
          });
        }, 500)
      }
      this.setState({
        recommendLoad: recommendLoad,
        newestLoad: newestLoad,
        albumLoad: albumLoad,
      });
      setTimeout(() => {
        this.initList();
      }, 300);
    }else {
      setTimeout(() => {
        this.initList();
      }, 500);
    }
  }

  componentDidMount() {
    eventEmitter.on(Events.CLOSEWINDOW, () => {
      this.closeWindow();
    });
    eventEmitter.on(Events.MINWINDOW, () => {
      this.minWindow();
    });
    this.mySwiper = new Swiper('.home-tab-wrapper', {
      on:{
        transitionEnd: () => {
          this.setState({
            activeTab: this.mySwiper.activeIndex
          });
          setTimeout(() => {
            this.initList();
          })
        },
      },
    });
  }
  render() {
    let state = this.state;
    return (
      <div className='home-wrapper'>
        <div className="windowsHead">
          <Link to="/search"><div className="back search iconfont icon-sousuo1"></div></Link>
          <div className="dragbar"></div>
          <div className="btns">
            <span className="iconfont icon-zuixiaohua3" onClick={this.minWindow.bind(this)}></span>
            <span className="close iconfont icon-guanbi" onClick={this.closeWindow.bind(this)}></span>
          </div>
        </div>
        <div className="home-tab">
          {
            state.tabs.map((data, k) => {
              return(
                <div key={k} className={`tab ${state.activeTab === data.id ? 'cur' : ''}`} onClick={this.switchTab.bind(this, data.id)}>{data.name}</div>
              )
            })
          }
        </div>
        <div className="home-tab-wrapper">
          <div className="swiper-wrapper">
            <div className="swiper-slide"><Recommend ref="recommend" active={state.activeTab}/></div>
            <div className="swiper-slide"><NewSong ref="newSong" active={state.activeTab}/></div>
            <div className="swiper-slide"><Album ref="album" active={state.activeTab}/></div>
            <div className="swiper-slide">4</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home
