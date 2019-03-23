import React, { Component } from 'react'
import { connect } from 'react-redux'
import Details from '../shared/details'

class AirlinesSummary extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      results : null
    }
    if (this.props.contractAddress !== null){
      this.props.contractApp.fetchAirlinesSummary(this.props.contractAddress, this.fetchAirlinesSummaryCallback.bind(this))
    }
  }


  fetchAirlinesSummaryCallback (results){
    this.setState(() => {
      return {results : results}
    })
  }

  render() {
    const {results} = this.state;
    if (this.props.contractAddress == null){
      return (
        <div>

        </div>
      )
    }
    if (results == null){
      return (
        <div>
            Loading summary
        </div>
      )
    }
    return (

      <div className="center-div">
        <div className="form-group auto-width">
            <h3 className='center'>Airlines Summary</h3>
            {results.successful === true &&
                <Details results={results}/>
            }
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

export default connect(mapStateToProps)(AirlinesSummary)