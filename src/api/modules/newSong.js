import fetch from '../../service'

export default {
  // 获取歌单列表
  getNewSong(url) {
    return fetch.get(url)
  }
}
