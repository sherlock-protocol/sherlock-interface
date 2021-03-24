// window.addEventListener('DOMContentLoaded', (event) => {
//   let provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase());
// 
//   window.insuranceHelpers = {
//     fetchContract: (cb) => {
//       let abi = fetch('/static/json/abi/Insurance.json')
//         .then(response => response.json())
//         .then(abi => {
//           let insurance = new _ethers.Contract(window.settings.pool_address, abi, provider);
//           let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner()
//           return insurance.connect(signer);
//         })
//     }
//   };
// });
export default class Insurance {
  constructor(cb) {
    this.provider = _ethers.getDefaultProvider('http://' + window.settings.network.toLowerCase() + ':8545');

    this.abi = fetch('/static/json/abi/Insurance.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(window.settings.pool_address, abi, this.provider);
        let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();
        let signedContract = contract.connect(signer);
        cb(signedContract);
      });
  }
}