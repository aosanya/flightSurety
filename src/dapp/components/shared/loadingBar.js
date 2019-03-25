import React, { Component } from 'react'
import { connect } from 'react-redux'

class LoadingBar extends Component {
    render() {
        return (

                <div className="loadingBar fixedTopRight" name="loadingBar">
                    {this.props.isloading == true &&
                        <ul>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                    }
                </div>

        )
    }
}

function mapStateToProps ({loadingBar}) {
    console.log(loadingBar.default == 1)
    return {
        isloading : loadingBar.default == 1
    }
}

export default connect(mapStateToProps)(LoadingBar)