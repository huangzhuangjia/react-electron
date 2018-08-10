import Main from './modules/main'
import Recommend from './modules/recommend'
import ListDetail from './modules/listDetail'
import NewSong from './modules/newSong'

export default {
  ...Main,
  ...Recommend,
  ...ListDetail,
  ...NewSong
}
