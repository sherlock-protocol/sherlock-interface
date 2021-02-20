window.addEventListener('DOMContentLoaded', (event) => {
  let setStakeEl = document.querySelector("#setStake");
  let provider = _ethers.getDefaultProvider({
    name: window.settings.network.toLowerCase(),
    chainId: parseInt(window.settings.chainid),
  });

  // The address from the above deployment example
  let contractAddress = window.settings.pool_address;

  // let contract = new _ethers.Contract(contractAddress, abi, provider);
  // console.log(contract);
  // contract.getFunds(app.getCookie("wallet")).then(response => {
  //   console.log(response);
  // }).catch(err => {
  //   console.log(err);
  // });
  // let setStake = () => {
  //   let form = document.querySelector('form#stakeForm');
  //   if (form) {
  //     if (app.validateForm(form)) {
  //       console.log('Form valid');
  //     } else {
  //       console.log('Form invalid');
  //     }
  //   }
  // }
  // 
  // setStakeEl.addEventListener('click', setStake);
  let fetchContract = () => {
    let abi = fetch('/static/json/abi/pool.json')
      .then(response => response.json())
      .then(abi => {
        let contract = new _ethers.Contract(window.settings.pool_address, abi, provider);
        window.contract = contract;
      });
  }
  fetchContract();
});