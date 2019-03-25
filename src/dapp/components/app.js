import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from "./home"
import RegisterAirline from "./airline/register"
import Fund from "./airline/fund"
import AirlinesSummary from "./airline/airlinesSummary"
import AirlineSummary from "./airline/airlineSummary"

import RegisterFlight from "./flight/register"
import FlightSummary from "./flight/flightSummary"

import PolicySummary from "./passenger/policySummary"
import BuyInsurance from "./passenger/buyInsurance"

import LoadContract from "./contract/loadContract"
import Nav from "./nav"
import TopBar from "./TopBar"


import ContractApp from '../utils/Contract';
class App extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {contractApp : new ContractApp(this.contractChanged.bind(this))}
    }

    componentDidMount() {

    }

    contractChanged(contract) {
        this.setState(() => ({
            contract
        }))
    }

    render() {

        return(
            <BrowserRouter>
                <TopBar contractApp={this.state.contractApp}/>
                <Nav/>

                    <div className="content">
                        <div className="center-div">
                            <div className="form-group auto-width">
                                <Switch  >
                                    <Route exact path="/" render={(props) => <Home {...props} contractApp={this.state.contractApp} />} />
                                    <Route exact path="/loadcontract" render={(props) => <LoadContract {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/airline/register" render={(props) => <RegisterAirline {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/airline/fund" render={(props) => <Fund {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/airline/airlinessummary" render={(props) => <AirlinesSummary {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/airline/airlinesummary" render={(props) => <AirlineSummary {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/flight/register" render={(props) => <RegisterFlight {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/flight/flightSummary" render={(props) => <FlightSummary {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/passenger/policySummary" render={(props) => <PolicySummary {...props} contractApp={this.state.contractApp} />}  />
                                    <Route path="/passenger/buyInsurance" render={(props) => <BuyInsurance {...props} contractApp={this.state.contractApp} />}  />
                                </Switch>
                            </div>
                        </div>
                    </div>

            </BrowserRouter>
        );
    }
}

function mapStateToProps ({ contract, loadingBar }) {
    return {
        isloading : loadingBar.default == 1
    }
}

export default connect(mapStateToProps)(App)

