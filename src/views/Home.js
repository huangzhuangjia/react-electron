import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import Recommend from './recommend'
import eventEmitter from '../config/eventEmitter'
import * as Events from '../config/event-types'

const electron = window.electron
const remote = electron.remote;


class Home extends Component {
  constructor() {
    super()
  }
  closeWindow() {
    // this.catchData();
    remote.getCurrentWindow().close();
  }

  minWindow() {
    remote.getCurrentWindow().minimize();
  }
  componentDidMount() {
    eventEmitter.on(Events.CLOSEWINDOW, () => {
      this.closeWindow();
    });
    eventEmitter.on(Events.MINWINDOW, () => {
      this.minWindow();
    });
  }
  render() {
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
        <Recommend ref="recommend"/>
      </div>
    )
  }
}

export default Home
