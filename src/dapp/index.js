import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import  Home from "./components/home"
import  Register from "./components/airline/register"
import  LoadContract from "./components/contract/loadContract"
import Nav from "./components/nav"
import './flightsurety.css';
import Contract from '../../utils/contract';
class App extends React.Component {
    constructor( props ) {
        super( props );
    }
    render() {
        return(
            <BrowserRouter>
                <Nav/>
                <div className="content">
                    <Switch  >
                        <Route exact path="/" component={ Home } />
                        <Route exact path="/loadcontract" component={ LoadContract } />
                        <Route path="/airline/register" component={ Register } />
                        <Route path="/passenger/buyInsurance" component={ Register } />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}
// render inside `app-root` element
ReactDOM.render( <App />, document.getElementById( 'app-root' ) );