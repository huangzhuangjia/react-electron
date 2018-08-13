import React from 'react';
import {Link} from 'react-router-dom';
import LazyImg from 'lazy-img-react';
import store from '../../store';
import * as Actions from '../../reducers/actions';
import * as Events from "../../config/event-types";
import eventEmitter from "../../config/eventEmitter";
import API from '../../api';
import config from '../../config'

export default class Ablum extends React.Component {
  constructor() {
    super();
    this.state = {
      offset: 0,
      limit: 30,
      loading: false,
      total: 0,
    }
  }

  getAlbum() {
    this.setState({
      loading: true,
    });
    eventEmitter.emit(Events.RINGLOADING, true);
    API.getAlbumList(`/top/album?offset=${this.state.offset}&limit=${this.state.limit}`).then(data => {
      if (data.code === 200) {
        this.setState({
          total: data.total,
          loading: false,
        });
        let albumList = store.getState().album.albumList || [];
        albumList = albumList.concat(data.albums || []);
        store.dispatch(Actions.setAlbumList(albumList));
      } else {
        this.doFailed();
      }
      eventEmitter.emit(Events.RINGLOADING, false);
    }).catch((err) => {
      console.error(err);
      eventEmitter.emit(Events.RINGLOADING, false);
      this.doFailed();
    })
  }

  doFailed() {
    if (this.state.offset > 0) {
      this.setState({
        offset: this.state.offset - 1,
        loading: false,
      })
    }
  }

  loadingMore() {
    if (this.state.loading) return;
    this.setState({
      offset: this.state.offset + 1,
    });
    setTimeout(() => {
      this.getAlbum();
    })
  }

  render() {
    let albumList = store.getState().album.albumList || [];
    return (
      <div className="album">
        <div className="item-list">
          {
            albumList.map((data, k) => {
              return (
                <Link to={`/albumDetail/${data.id}`} key={k}>
                  <div className="album-itembox clearfix">
                    <div className="cover">
                      <LazyImg src={data.picUrl}
                               placeholder={config.defaultCover}/>
                    </div>
                    <div className="info">
                      <div className="name">{data.name}</div>
                      <div className="singer">{data.artist.name}</div>
                    </div>
                  </div>
                </Link>
              )
            })
          }
          {
            albumList.length < this.state.total ?
              <div className="loadingmore iconfont icon-fanhui-copy"
                   onClick={this.loadingMore.bind(this)}>
              </div> : null
          }
          {
            (albumList.length == this.state.total && albumList.length > 0) ?
              <div className="loadingend">没有了~~</div> : null
          }
          {
            albumList.length == 0 ?
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