import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setContract } from '../../actions/contract'
import { showLoading, hideLoading } from 'react-redux-loading'
class LoadContract extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      appAddress : ""
    }

  }

  handleAppAddressChange(e){
    const appAddress = e.target.value

    this.setState(() => ({
      appAddress : appAddress
    }))
  }



  handleLoadContract (e){
    e.preventDefault()
    this.props.dispatch(showLoading())
      this.props.contractApp.contract = null;
      this.props.contractApp.loadContract(this.state.appAddress, this.handleContractLoaded.bind(this))
  }

  handleContractLoaded (contract){
      this.props.dispatch(setContract(contract))
      this.props.dispatch(hideLoading())
  }

  render() {
    return (
      <div>
        <h3 className='center'>Load Contract</h3>
          App Contract Address
          <br/>
          <input type="text" id="contractAppAddress" name="contractAppAddress"
          onChange={this.handleAppAddressChange.bind(this)}
          value={this.state.appAddress}/>
          <br/>
          <button className="button" onClick={this.handleLoadContract.bind(this)}>
            Load Contracts
          </button>
      </div>
    )
  }
}

export default connect()(LoadContract)