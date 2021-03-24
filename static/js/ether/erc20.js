export default class Erc20 {
  constructor(token, cb) {
    this.provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');

    this.abi = fetch('/static/json/abi/erc20.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(token, abi, this.provider);
        let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();
        let signed = contract.connect(signer);
        cb(signed);
      });
  }
}