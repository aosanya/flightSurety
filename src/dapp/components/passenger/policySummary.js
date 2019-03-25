import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'
import SelectFlight from '../flight/selectFlight'


class PolicySummary extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "AA001",
      dateTime : new Date(2019,0,1,8,0),
      ticketNumber : "AA001001",
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

  handleFetchSummary (e){
    e.preventDefault()
    this.props.contractApp.fetchPolicySummary(this.props.contractAddress, this.fetchSummaryCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime)
  }

  fetchSummaryCallback (results){
    this.setState(() => {
      return {actionCalled : true, results : results}
    })
  }

  handleBack (e){
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
              <h3 className='center'>Policy Summary</h3>
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
              <button className="button" onClick={this.handleFetchSummary.bind(this)}>
                  Load Summary
              </button>
              <br/>
        </div>
      )
    }
    if (results == null){
      return (
        <div>
          <h3 className='center'>Policy Summary</h3>
          Loading summary
        </div>
      )
    }
    return (
      <div className="center-div">
        <div className="form-group auto-width">
            <h3 className='center'>Policy Summary</h3>
            {results.successful === true &&
                <Details results={results}/>
            }
            <button className="button" onClick={this.handleBack.bind(this)}>
              Back
            </button>
        </div>
      </div>
    )
  }
}

function mapStateToProps ({ contract }) {
  return {
    contract: contract,
    contractAddress: contract ? contract.address : null
  }
}

export default connect(mapStateToProps)(PolicySummary)