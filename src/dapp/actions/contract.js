export const SET_CONTRACT = 'SET_CONTRACT'

export function setContract (contract) {
  console.log(contract)
  return {
    type: SET_CONTRACT,
    contract,
  }
}