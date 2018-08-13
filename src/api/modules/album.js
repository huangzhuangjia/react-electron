import fetch from '../../service'

export default {
  // 获取新碟列表
  getAlbumList(url) {
    return fetch.get(url)
  },
  // 获取新碟详情
  getAlbumDetail(url) {
    return fetch.get(url)
  }
}
