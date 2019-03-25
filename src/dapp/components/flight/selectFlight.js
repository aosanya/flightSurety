import React, { Component } from 'react'
import DateTimePicker from 'react-datetime-picker';

class SelectFlight extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            airlineAddress : "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
            flightNumber : "AA001",
            dateTime : new Date(2019,0,1,8,0)
        }
    }

    handleChangeAddress(e){
        const airlineAddress = e.target.value

        this.setState(() => {
            return {airlineAddress : airlineAddress}
        })

        this.props.handleChangeAddress(airlineAddress)
    }

    handleChangeFlightNumber(e){
        const flightNumber = e.target.value

        this.setState(() => {
            return {flightNumber : flightNumber}
        })
        this.props.handleChangeFlightNumber(flightNumber)
    }

    handleDateTimeChange(date){
        this.setState(() => {
            return {dateTime : date}
        })
        this.props.handleDateTimeChange(date)
    }

    handleChangeTicketNumber(e){
        const ticketNumber = e.target.value

        this.setState(() => {
            return {ticketNumber : ticketNumber}
        })
        this.props.handleChangeTicketNumber(ticketNumber)
    }

  render() {
    const airlines = this.props.contractApp.demoData.AirlineAddresses;
    return (
      <div>
        Airline Address
        <br/>
        <select value={this.state.airlineAddress} onChange={this.handleChangeAddress.bind(this)}>
        {
            airlines.map((keyValue,indx) => (
            <option key={keyValue} value={keyValue}>{keyValue}</option>
            ))
        }
        </select>
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
      </div>
    )
  }
}

export default SelectFlight