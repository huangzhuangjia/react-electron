import fetch from '../../service'

export default {
  // 获取推荐歌单
  getRecommendList(url) {
    return fetch.get(url)
  }
}
