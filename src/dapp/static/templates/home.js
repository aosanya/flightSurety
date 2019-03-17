export default function home () {
  return (
        `<div class="row">
          <div class="button-div column">
            <button class="btn-fetchOne" style="width: 200px" id="button" type="button" data-id="createNewContract">Create New Contract</button>
          </div>
          <div class="button-div column">
            <button style="width: 200px" id="button" type="button" data-id="loadContractForm">Load Existing Contract</button>
          </div>
        </div>`
  )
}
