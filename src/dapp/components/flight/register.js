import React, { Component } from 'react'
import { connect } from 'react-redux'
import DateTimePicker from 'react-datetime-picker';

class Register extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "A1 1000",
      dateTime : new Date(2019,0,1,8,0),
      actionCalled : false,
      results : {}
    }
  }

  handleChangeAddress(e){
    const airlineAddress = e.target.value

    this.setState(() => {
      return {airlineAddress : airlineAddress}
    })
  }

  handleChangeFlightNumber(e){
    const flightNumber = e.target.value

    this.setState(() => {
      return {flightNumber : flightNumber}
    })
  }

  handleDateTimeChange(date){
    this.setState(() => {
      return {dateTime : date}
    })
  }

  handleRegisterFlight (e){
    e.preventDefault()
    this.props.contractApp.registerFlight(this.props.contract, this.registerFlightCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime / 1000)
  }

  handleRegisterAnother (e){
    e.preventDefault()
    this.setState(() => {
      return {airlineAddress : "", flightNumber : "", dateTime : new Date(), actionCalled : false, results : {}}
    })
  }

  handleBackToRegistration (e){
    e.preventDefault()
    this.setState(() => {
      return {actionCalled : false, results : {}}
    })
  }

  registerFlightCallback (results){
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
                defaultValue={this.state.airlineAddress}
                onChange={this.handleChangeAddress.bind(this)}
              />
              <br/>
              Flight Number
              <br/>
              <input
                type="text"
                defaultValue={this.state.flightNumber}
                onChange={this.handleChangeFlightNumber.bind(this)}
              />
              <br/>
              Flight Date and Time
              <br/>
              <DateTimePicker
                onChange={this.handleDateTimeChange.bind(this)}
                value={this.state.dateTime}
              />
              <br/>
              <button className="button" onClick={this.handleRegisterFlight.bind(this)}>
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

