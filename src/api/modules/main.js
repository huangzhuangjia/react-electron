import fetch from '../../service'

export default {
  // 获取歌曲
  getMusicUrl(url) {
    return fetch.get(url)
  }
}
