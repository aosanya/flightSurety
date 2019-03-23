import React, { Component } from 'react'

class Detail extends Component {
  render() {
    return (
        <div className="detail">
            <div className="detailTitle">{this.props.title}</div>
            <div className="detailInfo">{this.props.value.toString()}</div>
        </div>
    )
  }
}

export default Detail