import React, { Component } from 'react'
import Detail from './detail'

class Details extends Component {
  render() {
    const {results } = this.props;
    return (
      <div className="center-div">
        <div className="form-group auto-width">
          <div className={results.successful ? 'success' : 'warning'}><span className="Info">{results.message}</span></div>
          {results.successful === true &&
            Object.keys(results.summary).map((keyValue,indx) => (
                <Detail key={keyValue} title={results.summary[keyValue].title} value={results.summary[keyValue].value}/>
            ))
          }
        </div>
      </div>
    )
  }
}

export default Details