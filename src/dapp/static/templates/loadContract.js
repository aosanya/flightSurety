export default function loadContractForm () {
    return (
        `<div class="Hidden" name="loadContractForm" id="loadContractForm">
            <h3>Load Contract</h3>
            <div class="form-group">
                Contract Address
                <br>
                <input type="text" id="contractAddress" name="contractAddress" value=0xdabdf31eb842269a089bf05749ee86ef1fed9e52><br>
                <div class=button-div>
                    <button id="button" type="button" data-id="loadContract">Load Contract</button>
                </div>
            </div>
            <div class=form-break></div>
        </div>`
    )
}