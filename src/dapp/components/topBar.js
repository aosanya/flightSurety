import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoadingBar from "./shared/loadingBar"
import ContractAddress from "./contractAddress"

class TopBar extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                <a className="navbar-brand" href="#">FlightSurety</a>
                <ContractAddress/>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>

                </button>
                <LoadingBar/>

            </nav>
        )
    }
}


function mapStateToProps (state) {
    return {

    }
}

export default connect(mapStateToProps)(TopBar)
