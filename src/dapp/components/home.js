import React from 'react';
import { NavLink as Link } from 'react-router-dom';

const Home = ( props ) => {
    return (
        <div>
            <h3 className='center'>Home</h3>
            <div className="row">
                <div className="column">
                    <Link exact to="/loadcontract" className="button" activeClassName="active">Create New Contract</Link>
                </div>
                <div className="column">
                    <Link exact to="/loadcontract" className="button" activeClassName="active">Load Existing Contract</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;