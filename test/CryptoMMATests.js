/* eslint no-undef: "off" */
var CryptoMMA = artifacts.require('CryptoMMA');

contract('CryptoMMA', function (accounts) {
  var helpfulFunctions = require('./utils/CryptoMMAUtils')(CryptoMMA, accounts);
  var hfn = Object.keys(helpfulFunctions);
  for (var i = 0; i < hfn.length; i++) {
    global[hfn[i]] = helpfulFunctions[hfn[i]];
  }
  
  //async call update the database 
  //saving would player id  


  setCeo();

  for (x = 0; x < 5; x++) {
      checkPlayerCreation('Player' + x , x);
  }

  for (x = 0; x < 5; x++) {
    checkPlayerPurchase(x, 0.01);
  }
 
});
