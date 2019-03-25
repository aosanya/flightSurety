import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setContract } from '../../actions/contract'

class LoadContract extends Component {
  constructor( props ) {
    super( props );
    this.state = {address : "0x8e4c131b37383e431b9cd0635d3cf9f3f628edae"}
  }

  handleChange(e){
    const address = e.target.value

    this.setState(() => ({
      address
    }))
  }

  handleLoadContract (e){
    e.preventDefault()

      this.props.contractApp.contract = null;
      console.log(this.state.address)
      this.props.contractApp.loadContract(this.state.address, this.handleContractLoaded.bind(this))
  }

  handleContractLoaded (contract){
      this.props.dispatch(setContract(contract))
  }


  render() {
    return (
      <div>
        <h3 className='center'>Load Contract</h3>
          Contract Address
          <br/>
          <input type="text" id="contractAddress" name="contractAddress"
          onChange={this.handleChange.bind(this)}
          value={this.state.address}/>
          <br/>
          <button className="button" onClick={this.handleLoadContract.bind(this)}>
            Load Contract
          </button>
      </div>
    )
  }
}

export default connect()(LoadContract)