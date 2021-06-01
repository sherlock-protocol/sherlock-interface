import Erc20 from "./ether/Erc20.js"
import Sherlock from "./ether/Sherlock.js"

window.addEventListener('DOMContentLoaded', () => {

  let main = sherlock => {
    window.app.sherlock = sherlock;
  }

  let harvest = () => {
    app.addLoader(document.querySelector('#harvest'));

    window.app.sherlock["harvest(address)"](data.stake.address)
    .then(resp => {
      location.href = "/";
    });
  }

  // Fetch the contract
  let signedsherlock = new Sherlock(main);

  // Approve actions
  document.querySelector('#harvest #harvestButton').addEventListener('click', harvest);
});