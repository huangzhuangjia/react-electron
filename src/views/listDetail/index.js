import React, {Component} from 'react';
import store from '../../store';
import eventEmitter from '../../config/eventEmitter';
import * as Events from '../../config/event-types';
import * as Actions from '../../reducers/actions';
import API from '../../api';

class ListDetail extends Component {
  constructor() {
    super();
    this.state = {
      id: '2151736437',
      listData: {},
      scrollState: false,
    }
  }

  componentWillMount() {
    let id = this.props.match.params.id;
    if (!id) return;
    this.setState({
      id: id,
    })
  }

  componentDidMount() {
    this.getListDetail();
  }

  getListDetail() {
    let id = this.state.id;
    eventEmitter.emit(Events.RINGLOADING, true);
    API.getPlayList(`/playlist/detail?id=${id}`).then(res => {
      if (res.code === 200) {
        this.setState({
          listData: res.playlist,
        })
      }
      eventEmitter.emit(Events.RINGLOADING, false);
    })
  }


  id2Song(id) {
    eventEmitter.emit(Events.RINGLOADING, true);
    API.getMusicUrl(`/music/url?id=${id}`).then(res => {
      if (res.code === 200) {
        if (res.data.length > 0) {
          store.dispatch(Actions.setCurrentSong(res.data[0]));
          eventEmitter.emit(Events.INITAUDIO);
        }
      }
      eventEmitter.emit(Events.RINGLOADING, false);
    })
  }

  scroll(e) {
    let top = e.target.scrollTop;
    if (top > 200) {
      if (!this.state.scrollState) {
        this.setState({
          scrollState: true,
        })
      }
    } else {
      if (this.state.scrollState) {
        this.setState({
          scrollState: false,
        })
      }
    }
  }

  goBack() {
    this.props.history.goBack();
  }

  saveToList() {
    let tracks = this.state.listData.tracks || [];
    let item = [];
    eventEmitter.emit(Events.RINGLOADING, true);
    tracks.map((data) => {
      item.push({
        id: data.id,
        name: data.name || '',
        ar: data.ar[0].name || '',
        from: 'online'
      })
    });
    eventEmitter.emit(Events.BATCHADD, item);
  }

  render() {
    let state = this.state;
    let listData = state.listData;
    let tracks = listData.tracks || [];
    let currentSong = store.getState().main.currentSong || {};
    return (
      <div className="listDetail-wrapper">
        <div className={`windowsHead ${state.scrollState ? '' : 'windowsHead-transparent'}`}>
          <div className="back iconfont icon-fanhui" onClick={this.goBack.bind(this)}></div>
          <div className="dragbar"></div>
          <div className="btns">
            <span className="iconfont icon-zuixiaohua3" onClick={() => {
              eventEmitter.emit(Events.MINWINDOW)
            }}></span>
            <span className="close iconfont icon-guanbi" onClick={() => {
              eventEmitter.emit(Events.CLOSEWINDOW)
            }}></span>
          </div>
        </div>
        <div className="wrap" onScroll={this.scroll.bind(this)}>
          <div className="listCoverBanner">
            <div className="play iconfont icon-tianjiaqiyedangan" onClick={this.saveToList.bind(this)}></div>
            <div className="cover">
              <img src={listData.coverImgUrl || ''} draggable={false}/>
            </div>
          </div>
          <div className="listInfo">
            <div className="name">{listData.name || ''}</div>
            <div className="desc">{listData.description || ''}</div>
          </div>
          <div className="song-list">
            {
              tracks.map((data, k) => {
                return (
                  <div className={`song ${currentSong.id === data.id ? 'song-active' : ''}`} key={k}
                       onDoubleClick={this.id2Song.bind(this, data.id)}>
                    <div className="key">{k + 1}</div>
                    <div className="r">
                      <div className="name">{data.name || ''}</div>
                      <div className="singer">{data.ar[0].name || ''}</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>
    )
  }
}

export default ListDetail
