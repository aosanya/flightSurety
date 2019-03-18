import React, { Component } from 'react'

class LoadContract extends Component {
  render() {
    return (
      <div>
        <h3 className='center'>Load Contract</h3>
        <div className="form-group">
            Contract Address
            <br/>
            <input type="text" id="contractAddress" name="contractAddress" value='0xdabdf31eb842269a089bf05749ee86ef1fed9e52'/>
            <br/>
            <button className="button" id="button" type="button" data-id="loadContract">Load Contract</button>

        </div>
      </div>
    )
  }
}

export default LoadContract