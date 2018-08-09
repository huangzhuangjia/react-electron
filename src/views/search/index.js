import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Swiper from 'swiper'
import SingleSearch from './singleSearch'
import AlbumSearch from './albumSearch'
import SingerSearch from './singerSearch'
import SongListSearch from './songListSearch'

class Search extends Component{
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      keyword: '',
      keywordCache: '',
      tabs: [
        {id: 0, name: '单曲'},
        {id: 1, name: '专辑'},
        {id: 2, name: '歌手'},
        {id: 3, name: '歌单'},
      ],
      singleLoad: false,
      singerLoad: false,
      albumLoad: false,
      listLoad: false,
      limit: 30,
      singleItem: [],
      singleCount: 0,
      singleOffset: 0,
      singerItem: [],
      singerCount: 0,
      singerOffset: 0,
      albumItem: [],
      albumCount: 0,
      albumOffset: 0,
      listItem: [],
      listCount: 0,
      listOffset: 0,
      loading: false,
    }
  }
  switchTab(index) {
    this.mySwiper.slideTo(index);
    this.setState({
      activeTab: index,
    });
    setTimeout(() => {
      this.search();
    })
  }

  search(paging) {

  }

  componentDidMount() {
    this.mySwiper = new Swiper('.search-tab-wrapper', {
      allowTouchMove: false,
      on:{
        transitionEnd: () => {
          this.setState({
            activeTab: this.mySwiper.activeIndex
          });
        },
      },
    });
  }

  loadingMore() {
    let typeKey = ['single', 'album', 'singer', 'list'];
    let activeTab = this.state.activeTab;
    let curOffset = this.state[`${typeKey[activeTab]}Offset`];
    let newOffset = {};
    newOffset[`${typeKey[activeTab]}Offset`] = curOffset + 1;
    this.setState(newOffset);
    setTimeout(() => {
      this.search(true);
    });
  }

  render() {
    let state = this.state;
    return (
      <div className="search-wrapper">
        <div className="search-area">
          <Link to="/"><div className="searchBtn iconfont icon-fanhui"></div></Link>
          <input ref="search" type="text" placeholder="搜索音乐、歌单、歌手"
                 onChange={(e) => {
                   this.setState({
                     keywordCache: e.target.value,
                   })
                 }}
                 onKeyDown={(e) => {
                   if(e.keyCode === 13) {
                     if(e.target.value === state.keyword) {
                       return;
                     }else {
                       this.setState({
                         keyword: e.target.value,
                         singleLoad: false,
                         singerLoad: false,
                         albumLoad: false,
                         listLoad: false,
                       });
                       setTimeout(() => {
                         this.search();
                       });

                     }

                   }
                 }}/>
          {
            state.keywordCache?
              <div className="clear iconfont icon-guanbi" onClick={() => {
                this.setState({
                  keyword: '',
                  keywordCache: '',
                });
                this.refs.search.value = '';
              }}></div>:null
          }
        </div>
        <div className="search-tab">
          {
            state.tabs.map((data, k) => {
              return(
                <div key={k} className={`tab ${state.activeTab === data.id?'cur':''}`} onClick={this.switchTab.bind(this, data.id)}>{data.name}</div>
              )
            })
          }
        </div>
        <div className="search-tab-wrapper">
          <div className="swiper-wrapper">
            <div className="swiper-slide"><SingleSearch data={state.singleItem} load={this.loadingMore.bind(this)} count={state.singleCount}/></div>
            <div className="swiper-slide"><AlbumSearch data={state.albumItem} load={this.loadingMore.bind(this)} count={state.albumCount}/></div>
            <div className="swiper-slide"><SingerSearch data={state.singerItem} load={this.loadingMore.bind(this)} count={state.singerCount}/></div>
            <div className="swiper-slide"><SongListSearch data={state.listItem} load={this.loadingMore.bind(this)} count={state.listCount}/></div>
          </div>
        </div>
      </div>
    )
  }
}

export default Search
