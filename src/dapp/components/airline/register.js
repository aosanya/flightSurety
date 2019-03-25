import React, { Component } from 'react'
import { connect } from 'react-redux'

class Register extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      address : "",
      actionCalled : false,
      results : {}
    }
  }

  handleChangeAddress(e){
    const address = e.target.value

    this.setState(() => {
      return {address : address}
    })
  }

  handleRegisterAirline (e){
    e.preventDefault()
    this.props.contractApp.registerAirline(this.props.contract, this.registerAirlineCallback.bind(this), this.state.address)
  }

  handleRegisterAnother (e){
    e.preventDefault()
    this.setState(() => {
      return {address : "", actionCalled : false, results : {}}
    })
  }

  handleBackToRegistration (e){
    e.preventDefault()
    this.setState(() => {
      return {actionCalled : false, results : {}}
    })
  }

  registerAirlineCallback (results){
    this.setState(() => {
      return {actionCalled : true, results : results}
    })
  }

  render() {
    const {results} = this.state;

    if (this.state.actionCalled == false){
      return (
        <div>
            <h3 className='center'>Register Airline</h3>
              Airline Address
              <br/>
              <input
                type="text"
                defaultValue={this.state.address}
                onChange={this.handleChangeAddress.bind(this)}
              />
              <br/>
              <button className="button" onClick={this.handleRegisterAirline.bind(this)}>
                  Register
              </button>
              <br/>
        </div>
      )
    }
    else{
      return (
        <div>
            <div className="form-group">
              <div className={results.successful ? 'success' : 'warning'}><span className="Info">{results.message}</span></div>
              {results.successful === true &&
                <button className="button" onClick={this.handleRegisterAnother.bind(this)}>
                  Register Another
                </button>
              }
               {results.successful === false &&
                <button className="button" onClick={this.handleBackToRegistration.bind(this)}>
                  Back to Registration
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

export default connect(mapStateToProps)(Register)