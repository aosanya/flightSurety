import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'
import SelectFlight from './selectFlight'

class CreditInsurees extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
      flightNumber : "AA001",
      dateTime : new Date(2019,1,1,8,0),
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

  handleCreditInsurees (e){
    e.preventDefault()
    this.props.contractApp.creditInsurees(this.props.contract, this.creditInsureesCallback.bind(this), this.state.airlineAddress, this.state.flightNumber, this.state.dateTime)
  }

  creditInsureesCallback (results){
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
              <h3 className='center'>Credit Insurees</h3>
              <SelectFlight
                contractApp = {this.props.contractApp}
                handleChangeAddress={this.handleChangeAddress.bind(this)}
                handleChangeFlightNumber={this.handleChangeFlightNumber.bind(this)}
                handleDateTimeChange={this.handleDateTimeChange.bind(this)}
              />
              <br/>
              <button className="button" onClick={this.handleCreditInsurees.bind(this)}>
                Credit Insurees
              </button>
              <br/>
        </div>
      )
    }
    if (results == null){
      return (
        <div>
          <h3 className='center'>Credit Insurees</h3>
          Loading request details
        </div>
      )
    }
    return (
      <div className="center-div">
        <div className="form-group auto-width">
            <h3 className='center'>Credit Insurees</h3>
            {results.successful === true &&
                <Details results={results}/>
            }
            {results.successful === false &&
                <div className={results.successful ? 'success' : 'warning'}><span className="Info">{results.message}</span></div>
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

export default connect(mapStateToProps)(CreditInsurees)