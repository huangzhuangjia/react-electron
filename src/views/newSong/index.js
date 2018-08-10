import React, {Component} from 'react'
import LazyImg from 'lazy-img-react'
import * as Actions from '../../reducers/actions'
import eventEmitter from '../../config/eventEmitter'
import * as Events from '../../config/event-types'
import store from "../../store"
import API from '../../api'
import config from '../../config'

class NewSong extends Component {
  getNewest() {
    eventEmitter.emit(Events.RINGLOADING, true);
    API.getNewSong(`/personalized/newsong`).then(data => {
      if (data.code === 200) {
        store.dispatch(Actions.setNewest(data.result || []));
      }
      eventEmitter.emit(Events.RINGLOADING, false);
    })
  }

  id2Song(id) {
    API.getMusicUrl(`/music/url?id=${id}`).then(data => {
      if (data.code === 200) {
        if (data.data.length > 0) {
          store.dispatch(Actions.setCurrentSong(data.data[0]));
          eventEmitter.emit(Events.INITAUDIO);
        }
      }
    })
  }

  render() {
    let newestList = store.getState().newSong.newestList || [];
    let currentSong = store.getState().main.currentSong || {};
    return (
      <div className="newest">
        <div className="item-list">
          {
            newestList.map((data, k) => {
              return (
                <div key={k} className={`song-itembox ${currentSong.id === data.id ? 'song-itembox-active' : ''}`}
                     onDoubleClick={this.id2Song.bind(this, data.id)}>
                  <div className="cover"><LazyImg src={data.song.album.picUrl} placeholder={config.defaultCover}/>
                  </div>
                  <div className="info">
                    <div className="name">{data.song.name}</div>
                    <div className="singer">{data.song.artists[0].name}</div>
                  </div>
                </div>
              )
            })
          }
          {
            newestList.length === 0 ?
              <div className="loadingempty">
                <span className="iconfont icon-wujilu"></span>
                <p>~空空如也~</p>
              </div> : null
          }
        </div>
      </div>
    )
  }
}

export default NewSong
