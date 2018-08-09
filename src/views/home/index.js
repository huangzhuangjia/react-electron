import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import Swiper from 'swiper'
import Recommend from '../recommend'
import eventEmitter from '../../config/eventEmitter'
import * as Events from '../../config/event-types'
const remote = window.electron.remote

class Home extends Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      tabs: [
        {id: 0, name: '推荐歌单'},
        {id: 1, name: '最新单曲'},
        {id: 2, name: '新碟上架'},
        {id: 3, name: '本地歌曲'},
      ]
    }
  }

  closeWindow() {
    // this.catchData();
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
            <div className="swiper-slide">2</div>
            <div className="swiper-slide">3</div>
            <div className="swiper-slide">4</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home
