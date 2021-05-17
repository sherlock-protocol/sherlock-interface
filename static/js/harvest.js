import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.addEventListener('DOMContentLoaded', () => {

  let main = sherlock => {
    window.app.sherlock = sherlock;
  }

  let harvest = () => {
    console.log(window.app.sherlock);
    window.app.sherlock["harvest(address)"](data.token.address)
    .then(resp => {
      location.href = "/";
    });
  }

  // Fetch the contract
  let signedsherlock = new Sherlock(main);

  // Approve actions
  document.querySelector('#harvest #harvestButton').addEventListener('click', harvest);
});