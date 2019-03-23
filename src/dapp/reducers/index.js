import { combineReducers } from 'redux'
import contract from './contract'
import { loadingBarReducer } from 'react-redux-loading'

export default combineReducers({
  contract,
  loadingBar: loadingBarReducer,
})