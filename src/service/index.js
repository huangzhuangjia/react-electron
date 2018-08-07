import axios from 'axios'
import qs from 'qs'
import config from '../config'

let instance = axios.create({
  baseURL: config.baseUrl,
});

function handleResponse (res) {
  const Code = res.data.code
  if (Code === 200) {
    return Promise.resolve(res.data)
  }
  return Promise.reject(res.data)
}

export default {
  get(url) {
    return instance.get(url).then(handleResponse)
  },
  post (url, param) {
    return instance.post(url, qs.stringify(param)).then(handleResponse)
  }
}
