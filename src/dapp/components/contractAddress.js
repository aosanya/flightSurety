import React, { Component } from 'react'
import { connect } from 'react-redux'

class CurrentContract extends Component {
  render() {
    const { address } = this.props
  return (
    <div className="details">
          Current Contract : {address}
    </div>
  )
}
}

function mapStateToProps ({ contract }) {
  return {
    address: contract ? contract.address : "No contract loaded."
  }
}

export default connect(mapStateToProps)(CurrentContract)