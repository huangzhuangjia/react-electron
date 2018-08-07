// 推荐歌单
import React, { Component } from 'react';
import API from '../../api'

class Index extends Component{
  constructor() {
    super()
  }
  getRecommendList() {
    API.getRecommendList('/personalized').then(res => {
      console.log(res)
    }).catch(res => {})
  }
  componentDidMount() {
    this.getRecommendList()
  }
  render() {
    return (
      <div className="recommend-wrapper">
      </div>
    )
  }
}

export default Index
