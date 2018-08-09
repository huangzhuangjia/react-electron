// NeteaseCloudMusicApi 开启服务
const IS_DEV = process.env.NODE_ENV === 'development'
const config = {
  baseUrl: IS_DEV ? 'http://localhost:3001' : 'http://39.105.103.128/fluentapi/api/',
  defaultCover: '//39.105.103.128/fluentapi/placeholderCover.png'
}
export default config
