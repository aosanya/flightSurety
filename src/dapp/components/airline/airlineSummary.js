import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'

class AirlineSummary extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      airlineAddress : "",
      results : null,
      actionCalled : false,
    }
  }

  handleChangeAirlineAddress(e){
    const airlineAddress = e.target.value

    this.setState(() => {
      return {airlineAddress : airlineAddress}
    })
  }

  handleFetchSummary (e){
    e.preventDefault()
    this.props.contractApp.fetchAirlineSummary(this.props.contractAddress, this.fetchAirlineSummaryCallback.bind(this), this.state.airlineAddress)
  }

  fetchAirlineSummaryCallback (results){
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
        <div className="center-div">
            <div className="form-group auto-width">
              <h3 className='center'>Airline Summary</h3>
              Airline Address
              <br/>
              <input
                type="text"
                defaultValue={this.state.address}
                onChange={this.handleChangeAirlineAddress.bind(this)}
              />
              <br/>
              <button className="button" onClick={this.handleFetchSummary.bind(this)}>
                  Load Summary
              </button>
              <br/>
          </div>
        </div>
      )
    }
    if (results == null){
      return (
        <div>
          <h3 className='center'>Airline Summary</h3>
          Loading summary
        </div>
      )
    }
    return (
      <div className="center-div">
        <div className="form-group auto-width">
            <h3 className='center'>Airline Summary</h3>
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

export default connect(mapStateToProps)(AirlineSummary)