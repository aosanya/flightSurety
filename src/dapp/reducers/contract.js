import { SET_CONTRACT } from '../actions/contract'

export default function contract (state = null, action) {
  switch (action.type) {
    case SET_CONTRACT :
      return action.contract
    default :
      return state
  }
}