import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { connect } from 'react-redux'

class Nav extends Component {
  render() {
    const { address } = this.props

    return (
      <div className="content">
      <nav className='nav'>
        <ul className="nav">
          <li className="nav">
            <NavLink to='/' exact activeClassName='active'>Home</NavLink>
          </li>

          {address !== null &&
            <li className="nav"><a href="#">Airlines</a>
              <ul className="nav dropdown">
                <li className="nav">
                  <NavLink to='/airline/register' exact activeClassName='active'>Register</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/airline/fund' exact activeClassName='active'>Fund</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/airline/airlinessummary' exact activeClassName='active'>Airlines Summary</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/airline/airlinesummary' exact activeClassName='active'>Airline Summary</NavLink>
                </li>
              </ul>
            </li>
          }

          {address !== null &&
            <li className="nav"><a href="#">Flights</a>
              <ul className="nav dropdown">
                <li className="nav">
                  <NavLink to='/flight/register' exact activeClassName='active'>Register</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/flight/flightstatus' exact activeClassName='active'>Fetch Status</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/flight/flightsummary' exact activeClassName='active'>Flight Summary</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/flight/creditInsurees' exact activeClassName='active'>Credit Insurees</NavLink>
                </li>
              </ul>
            </li>
          }

          {address !== null &&
            <li className="nav"><a href="#">Passengers</a>
              <ul className="nav dropdown">
                <li className="nav">
                  <NavLink to='/passenger/buyInsurance' exact activeClassName='active'>Buy Insurance</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/passenger/withdrawPay' exact activeClassName='active'>Withdraw Pay</NavLink>
                </li>
                <li className="nav">
                  <NavLink to='/passenger/policySummary' exact activeClassName='active'>Policy Summary</NavLink>
                </li>
              </ul>
            </li>
          }
        </ul>
      </nav>
      </div>
    )
  }
}

function mapStateToProps ({ contract }) {
  return {
    address: contract ? contract.address : null
  }
}

export default connect(mapStateToProps)(Nav)