export default class Erc20 {
  constructor(token, cb) {
    this.abi = fetch('/static/json/abi/erc20.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(token, abi, window.app.provider);
        let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();
        let signed = contract.connect(signer);
        cb(signed);
      });
  }
}