export default class Sherlock {
  constructor(cb) {
    this.abi = fetch('/static/json/abi/Sherlock.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(window.settings.pool_address, abi, this.provider);
        let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();
        let signedContract = contract.connect(signer);
        if (cb)
          cb(signedContract);
      });
  }
}