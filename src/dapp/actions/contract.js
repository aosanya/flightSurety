export const SET_CONTRACT = 'SET_CONTRACT'

export function setContract (contract) {
  return {
    type: SET_CONTRACT,
    contract,
  }
}