export default class erc20 {
  constructor(token, cb) {
      this.provider = _ethers.getDefaultProvider({
        name: window.settings.network.toLowerCase(),
        chainId: parseInt(window.settings.chainid),
      });
    
    this.abi = fetch('/static/json/abi/erc20.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(token, abi, this.provider);
        let signer = new _ethers.providers.Web3Provider(window.ethereum).getSigner();
        this.contract = contract.connect(signer);
        
        cb(this);
      });
  }
}