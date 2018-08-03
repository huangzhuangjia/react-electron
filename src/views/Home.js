import React, {Component} from 'react'
import Recommend from './Recommend'

class Home extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className='home-wrapper'>
        <Recommend ref="recommend"/>
      </div>
    )
  }
}

export default Home
