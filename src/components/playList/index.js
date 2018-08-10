import React, {Component} from 'react'
import PropTypes from 'prop-types'
import eventEmitter from "../../config/eventEmitter";
import * as Events from "../../config/event-types";

const playOrderMap = [
  {icon: 'icon-list-loop', name: '列表循环'},
  {icon: 'icon-single-loop', name: '单曲循环'},
  {icon: 'icon-bofangye-caozuolan-suijibofang', name: '随机播放'}
];
const propTypes = {
  playList: PropTypes.array,
  playListState: PropTypes.bool,
  playOrder: PropTypes.number,
  currentSong: PropTypes.object,
  onClose: PropTypes.func,
  switchOrder: PropTypes.func,
  delList: PropTypes.func,
  listToPlay: PropTypes.func,
};
const defaultTypes = {
  playList: [],
  playListState: false,
  playOrder: 0,
  currentSong: {},
  onClose: () => {},
  switchOrder: () => {},
  delList: () => {},
  listToPlay: () => {},
};

class PlayList extends Component {
  render() {
    let {
      playList,
      playListState,
      playOrder,
      currentSong,
      onClose,
      switchOrder,
      delList,
      listToPlay
    } = this.props;
    return (
      <div className={`play-list-dialog ${playListState ? 'play-list-dialog-active' : ''}`}>
        <div className={`mask ${playListState ? 'mask-active' : ''}`} onClick={onClose}></div>
        <div className={`list-wrap ${playListState ? 'list-wrap-active' : ''}`}>
          <div className="list-wrap-head">
            <div className="label" onClick={switchOrder}>
              <i className={`iconfont ${playOrderMap[playOrder].icon}`}></i>{playOrderMap[playOrder].name} ({playList.length || 0})
            </div>
            <div className="clear iconfont icon-shanchu" onClick={() => {
              delList('all')
            }}></div>
          </div>
          <div className="list-item" ref="songListItem">
            {
              playList.map((data, k) => {
                return (
                  <div className={`${currentSong.id === data.id ? 'row-playing' : ''} row`} key={k}
                       onDoubleClick={() => {
                         listToPlay(data)
                       }}>
                    <div className="info">{data.name}<span> - {data.ar}</span></div>
                    <span className="del iconfont icon-guanbi" onClick={() => {
                      delList(data.id, k)
                    }}></span>
                  </div>
                )
              })
            }
          </div>
          <div className="list-wrap-foot" onClick={onClose}>关闭</div>
        </div>
      </div>
    )
  }
}

PlayList.propTypes = propTypes;
PlayList.defaultTypes = defaultTypes;
export default PlayList
