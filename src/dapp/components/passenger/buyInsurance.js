import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'
import SelectFlight from '../flight/selectFlight'

class BuyInsurance extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "AA001",
      dateTime : new Date(2019,1,1,8,0),
      ticketNumber : "AA0010011",
      premium : null,
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
    console.log(ticketNumber)
  }

  handleChangePremium(e){
    const newPremium = e.target.value

    this.setState(() => {
      return {premium : newPremium}
    })

    console.log(newPremium)
  }

  handleBuyPolicy (e){
    e.preventDefault()
    this.props.contractApp.buyPolicy(this.props.contract, this.buyPolicyCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime, this.state.ticketNumber, this.state.premium)
  }

  buyPolicyCallback (results){
    this.setState(() => {
      return {actionCalled : true, results : results}
    })
  }

  handleBuyMore (e){
    e.preventDefault()
    this.setState(() => {
      return {airlineAddress : "", flightNumber : "", dateTime : new Date(), ticketNumber : null, premium : null, actionCalled : false, results : {}}
    })
  }

  handleBackToBuy (e){
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
          <h3 className='center'>Buy Insurance</h3>
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
          Premium
          <br/>
            <input
              type="number"
              className="currency"
              defaultValue={this.state.premium}
              onChange={this.handleChangePremium.bind(this)}
            /> Ether
            <br/>
          <button className="button" onClick={this.handleBuyPolicy.bind(this)}>
              Buy Insurance
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
                <button className="button" onClick={this.handleBuyMore.bind(this)}>
                  Buy More
                </button>
              }
               {results.successful === false &&
                <button className="button" onClick={this.handleBackToBuy.bind(this)}>
                  Back to Buy Insurance
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

export default connect(mapStateToProps)(BuyInsurance)