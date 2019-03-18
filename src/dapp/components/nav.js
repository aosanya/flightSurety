import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Nav () {
  return (
    <div className="content">
    <nav className='nav'>
      <ul className="nav">
        <li className="nav">
          <NavLink to='/' exact activeClassName='active'>Home</NavLink>
        </li>
        <li className="nav"><a href="#">Airlines</a>
          <ul className="nav dropdown">
            <li className="nav">
              <NavLink to='/registerAirline' exact activeClassName='active'>Register</NavLink>
            </li>
            <li className="nav">
              <NavLink to='/fundAirline' exact activeClassName='active'>Fund</NavLink>
            </li>
          </ul>
        </li>
        <li className="nav"><a href="#">Flights</a>
          <ul className="nav dropdown">
            <li className="nav">
              <NavLink to='/registerFlight' exact activeClassName='active'>Register</NavLink>
            </li>
            <li className="nav">
              <NavLink to='/creditInsurees' exact activeClassName='active'>Credit Insurees</NavLink>
            </li>
          </ul>
        </li>
        <li className="nav"><a href="#">Passengers</a>
          <ul className="nav dropdown">
            <li className="nav">
              <NavLink to='/buyInsurance' exact activeClassName='active'>Buy Insurance</NavLink>
            </li>
            <li className="nav">
              <NavLink to='/withdrawClaim' exact activeClassName='active'>Withdraw Claim</NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    </div>
  )
}