import React, { Component } from 'react'
import { connect } from 'react-redux'
import SelectFlight from '../flight/selectFlight'

class WithdrawPay extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "AA001",
      dateTime : new Date(2019,1,1,8,0),
      ticketNumber : "AA0010011",
      results : null,
      actionCalled : false,
    }
  }

  handleChangeAddress(airlineAddress){
    this.setState(() => {
      return {airlineAddress : airlineAddress}
    })
  }

  handleChangeFlightNumber(flightNumber){
    this.setState(() => {
      return {flightNumber : flightNumber}
    })
  }

  handleDateTimeChange(date){
    this.setState(() => {
      return {dateTime : date}
    })
  }

  handleChangeTicketNumber(ticketNumber){
    this.setState(() => {
      return {ticketNumber : ticketNumber}
    })
  }


  handleWithdrawClaim (e){
    e.preventDefault()
    this.props.contractApp.withdrawClaim(this.props.contract, this.withdrawClaimCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime, this.state.ticketNumber)
  }

  withdrawClaimCallback (results){
    this.setState(() => {
      return {actionCalled : true, results : results}
    })
  }

  handleWithdrawAnother (e){
    e.preventDefault()
    this.setState(() => {
      return {airlineAddress : "", flightNumber : "", dateTime : new Date(), ticketNumber : null, actionCalled : false, results : {}}
    })
  }

  handleBackToWithdraw (e){
    e.preventDefault()
    this.setState(() => {
      return {actionCalled : false, results : {}}
    })
  }
  render() {
    const {results, actionCalled} = this.state;
    if (this.props.contractAddress == null){
      return (
        <div>

        </div>
      )
    }
    if (actionCalled == false){
      const airlines = this.props.contractApp.demoData.AirlineAddresses;
      return (
        <div>
          <h3 className='center'>Withdraw Pay</h3>
          <SelectFlight
            contractApp = {this.props.contractApp}
            handleChangeAddress={this.handleChangeAddress.bind(this)}
            handleChangeFlightNumber={this.handleChangeFlightNumber.bind(this)}
            handleDateTimeChange={this.handleDateTimeChange.bind(this)}
          />
          <br/>
          Ticket Number
          <br/>
          <input
            type="text"
            defaultValue={this.state.ticketNumber}
            onChange={this.handleChangeTicketNumber.bind(this)}
          />
          <br/>
          <button className="button" onClick={this.handleWithdrawClaim.bind(this)}>
              Withdraw Pay
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
                <button className="button" onClick={this.handleWithdrawAnother.bind(this)}>
                  Withdraw Another
                </button>
              }
               {results.successful === false &&
                <button className="button" onClick={this.handleBackToWithdraw.bind(this)}>
                  Back to Withdrawal
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

export default connect(mapStateToProps)(WithdrawPay)