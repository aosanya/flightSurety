import React, { Component } from 'react'
import { connect } from 'react-redux'

class Fund extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      contribution : null,
      actionCalled : false,
      results : {}
    }
  }

  handleChangeContribution(e){
    const newContribution = e.target.value

    this.setState(() => {
      return {contribution : newContribution}
    })
  }

  handleFund (e){
    e.preventDefault()
    this.props.contractApp.fund(this.props.contractAddress, this.fundingCallback.bind(this), web3.toWei(this.state.contribution,"ether"))
  }

  handleFundMore (e){
    e.preventDefault()
    this.setState(() => {
      return {contribution : 0, actionCalled : false, results : {}}
    })
  }

  handleBackToFunding (e){
    e.preventDefault()
    this.setState(() => {
      return {actionCalled : false, results : {}}
    })
  }

  fundingCallback (results){
    this.setState(() => {
      return {actionCalled : true, results : results}
    })
  }

  render() {
    const {results} = this.state;

    if (this.state.actionCalled == false){
      return (
        <div>
            <h3 className='center'>Contribute to Fund</h3>
            <div className="center-div">
              <div className="form-group auto-width">
                  Contribution(minimum is 10 Ether)
                  <br/>
                  <input
                    type="number"
                    className="currency"
                    defaultValue={this.state.contribution}
                    onChange={this.handleChangeContribution.bind(this)}
                  /> Ether
                  <br/>
                  <button className="button" onClick={this.handleFund.bind(this)}>
                      Contribute
                  </button>
                  <br/>
              </div>
            </div>

        </div>
      )
    }
    else{
      return (
        <div>
            <div className="form-group">
              <div className={results.successful ? 'success' : 'warning'}><span className="Info">{results.message}</span></div>
              {results.successful === true &&
                <button className="button" onClick={this.handleFundMore.bind(this)}>
                  Fund More
                </button>
              }
               {results.successful === false &&
                <button className="button" onClick={this.handleBackToFunding.bind(this)}>
                  Back to Funding
                </button>
              }
            </div>
        </div>
      )
    }
  }
}

function mapStateToProps ({ contract }) {
  return {
    contract: contract,
    contractAddress: contract ? contract.address : null
  }
}

export default connect(mapStateToProps)(Fund)