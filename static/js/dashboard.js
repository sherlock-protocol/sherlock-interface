window.addEventListener('DOMContentLoaded', (event) => {
  const network = {
    name: "kovan",
    chainId: 0x2a,
    // ensAddress: 0x2a
  };
  let setStakeEl = document.querySelector("#setStake");
  let provider = _ethers.getDefaultProvider(network, {
    infura: "21ea206b0394489fa99ade05cf9cb614",
  });

  // The address from the above deployment example
  let contractAddress = "0x6E36a59b4b4dBD1d47ca2A6D22A1A45d26765601";
  let abi = [{
    "inputs": [{
      "internalType": "address",
      "name": "_token",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "_stakeToken",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "_strategyManager",
      "type": "address"
    }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "previousOwner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }],
    "name": "accruedDebt",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }, {
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "addProfileBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "amountOfProtocolsCovered",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "cancelWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "_staker",
      "type": "address"
    }],
    "name": "claimFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }],
    "name": "coveredFunds",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "depositStrategyManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "_staker",
      "type": "address"
    }],
    "name": "getFunds",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "getTotalStakedFunds",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }, {
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }, {
      "internalType": "address",
      "name": "_payout",
      "type": "address"
    }],
    "name": "insurancePayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }],
    "name": "payOffDebt",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }],
    "name": "premiumPerBlock",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "name": "profileBalances",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "name": "profilePremiumLastPaid",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "name": "profiles",
    "outputs": [{
      "internalType": "uint256",
      "name": "maxFundsCovered",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "percentagePremiumPerBlock",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "name": "protocols",
    "outputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "",
      "type": "bytes32"
    }],
    "name": "protocolsCovered",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "redirectStakeToStrategy",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }, {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }, {
      "internalType": "bool",
      "name": "_forceOpenDebtPay",
      "type": "bool"
    }, {
      "internalType": "address",
      "name": "_balanceReceiver",
      "type": "address"
    }],
    "name": "removeProtocol",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bool",
      "name": "_redirect",
      "type": "bool"
    }],
    "name": "setRedirectStakeToStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "_strategyManager",
      "type": "address"
    }],
    "name": "setStrategyManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_timeLock",
      "type": "uint256"
    }],
    "name": "setTimeLock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "stakeFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "stakeToken",
    "outputs": [{
      "internalType": "contract IStake",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "stakesWithdraw",
    "outputs": [{
      "internalType": "uint256",
      "name": "blockInitiated",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "stake",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "strategyManager",
    "outputs": [{
      "internalType": "contract IStrategyManager",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "timeLock",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "token",
    "outputs": [{
      "internalType": "contract IERC20",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "tryPayOffDebtAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes32",
      "name": "_protocol",
      "type": "bytes32"
    }, {
      "internalType": "uint256",
      "name": "_maxFundsCovered",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_percentagePremiumPerBlock",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "_premiumLastPaid",
      "type": "uint256"
    }, {
      "internalType": "bool",
      "name": "_forceOpenDebtPay",
      "type": "bool"
    }],
    "name": "updateProfiles",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "withdrawStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_amount",
      "type": "uint256"
    }],
    "name": "withdrawStrategyManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
  
  let contract = new _ethers.Contract(contractAddress, abi, provider);
  console.log(contract);
  contract.getFunds(app.getCookie("wallet")).then(response => {
    console.log(response);
  }).catch(err => {
    console.log(err);
  });
  let setStake = () => {
    let form = document.querySelector('form#stakeForm');
    if(form) {
      if(app.validateForm(form)) {
        console.log('Form valid');
      } else {
        console.log('Form invalid');
      }
    }
  }
  
  setStakeEl.addEventListener('click', setStake);
  

});