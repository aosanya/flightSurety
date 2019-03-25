import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'
import DateTimePicker from 'react-datetime-picker';

class FlightSummary extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "A1 1000",
      dateTime : new Date(2019,0,1,8,0),
      results : null,
      actionCalled : false,
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

  handleFetchSummary (e){
    e.preventDefault()
    this.props.contractApp.fetchFlightSummary(this.props.contract, this.fetchSummaryCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime / 1000)
  }

  fetchSummaryCallback (results){
    console.log(results)
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
      return (
        <div>
              <h3 className='center'>Flight Summary</h3>
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
          <h3 className='center'>Flight Summary</h3>
          Loading summary
        </div>
      )
    }
    return (
      <div className="center-div">
        <div className="form-group auto-width">
            <h3 className='center'>Flight Summary</h3>
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

export default connect(mapStateToProps)(FlightSummary)