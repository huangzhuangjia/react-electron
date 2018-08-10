// 播放控制条
import React, {Component} from 'react'
import PropTypes from 'prop-types'

const coverImg = require('../../assets/image/logo.png');
const propTypes = {
  isUIPage: PropTypes.bool,
  playState: PropTypes.bool,
  songInfo: PropTypes.object,
  toUIPage: PropTypes.func,
  switchPlay: PropTypes.func,
  targetingCur: PropTypes.func,
};
const defaultProps = {
  isUIPage: false,
  playState: false,
  songInfo: {},
  toUIPage: () => {
  },
  switchPlay: () => {
  },
  targetingCur: () => {
  }
};

class ControlBar extends Component {
  render() {
    let {
      isUIPage,
      playState,
      toUIPage,
      songInfo,
      switchPlay,
      targetingCur
    } = this.props;
    return (
      <div className={`fix-control ${isUIPage ? '' : 'fix-control-active'}`}>
        <div className="cover" onClick={toUIPage}>
          <img src={coverImg}/>
        </div>
        <div className="info" onClick={toUIPage}>
          <div className="name">{songInfo.name || ''}</div>
          <div className="singer">{songInfo.ar && songInfo.ar[0].name || ''}</div>
        </div>
        <div className={`play-icon`} onClick={(e) => {
          switchPlay(!playState)
        }}>
          <div className={`icon iconfont ${playState ? 'icon-weibiaoti519' : 'icon-bofang2'}`}></div>
          <div className="progress" id="progress"></div>
        </div>
        <div className="play-list iconfont icon-liebiao" onClick={targetingCur}></div>
      </div>
    )
  }
}

ControlBar.propTypes = propTypes;
ControlBar.defaultProps = defaultProps;
export default ControlBar
