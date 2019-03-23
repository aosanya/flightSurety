import { NavLink as Link } from 'react-router-dom';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setContract } from '../actions/contract'

class Home extends Component {
    handleCreateNewContract (e){
        this.props.contractApp.contract = null;
        this.props.contractApp.createNewContract(this.handleContractCreated.bind(this))
    }

    handleContractCreated (contract){
        this.props.dispatch(setContract(contract))
    }

    render() {
        console.log(this.props.contract)
        return (
            <div>
                <h3 className='center'>Home</h3>
                <div className="row">
                    <div className="column">
                        <button className="button" onClick={this.handleCreateNewContract.bind(this)}>
                            Create New Contract
                        </button>
                    </div>
                    <div className="column">
                        <Link exact to="/loadcontract" className="button" activeClassName="active">Load Existing Contract</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(Home)