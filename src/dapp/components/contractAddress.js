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
  console.log(contract)
  var msg = "No contract loaded."
  if (contract !== null){
    console.log(contract.address)
    if (contract.address == undefined){
      msg = "Loading contract, please wait..."
    }
    else{
      msg = contract.address;
    }
  }

  return {
    address: msg
  }
}

export default connect(mapStateToProps)(CurrentContract)