
function loadMMA(playerId, playerName,playerPrice, ownerAddress, locallyOwned) {
  var cardRow = $('#card-row');
  var cardTemplate = $('#card-template');

  if (locallyOwned) {
    cardTemplate.find('.btn-buy').attr('disabled', true);
  } else {
    cardTemplate.find('.btn-buy').removeAttr('disabled');
  }

  cardTemplate.find('.doggy-name').text(playerName);
  cardTemplate.find('.doggy-canvas').attr('id', "doggy-canvas-" + playerId); 
  cardTemplate.find('.doggy-owner').text(ownerAddress);
  cardTemplate.find('.doggy-owner').attr("href", "https://etherscan.io/address/" + ownerAddress);
  cardTemplate.find('.btn-buy').attr('data-id', playerId);
  cardTemplate.find('.doggy-price').text(parseFloat(playerPrice).toFixed(4)); 

  cardRow.append(cardTemplate.html());

}

 

var App = {
  contracts: {},
  CryptoMMAAddress: '0x383Bf1fD04D0901bbD674A580E0A621FCBb4799b',

  init() {
    return App.initWeb3();
  },

  initWeb3() {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    return App.initContract();
  },

  initContract() {
    $.getJSON('CryptoMMA.json', (data) => {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      const CryptoMMAArtifact = data;
      App.contracts.CryptoMMA = TruffleContract(CryptoMMAArtifact);

      // Set the provider for our contract
      App.contracts.CryptoMMA.setProvider(web3.currentProvider);

      // User our contract to retrieve the adrians that can be bought
      return App.loadMMA();
  });
  return App.bindEvents();
  },

  loadMMA() {
    web3.eth.getAccounts(function(err, accounts) {
      if (err != null) {
        console.error("An error occurred: " + err);
      } else if (accounts.length == 0) {
        console.log("User is not logged in to MetaMask");
      } else {
        // Remove existing cards
        $('#card-row').children().remove();
      }
    });
    // Get local address so we don't display our owned items
    var address = web3.eth.defaultAccount;
    let contractInstance = App.contracts.CryptoMMA.at(App.CryptoMMAAddress);
    return totalSupply = contractInstance.totalSupply().then((supply) => {
      for (var i = 0; i < supply; i++) {
        App.getDoggyDetails(i, address);
      }
    }).catch((err) => {
      console.log(err.message);
    });
  },

  getDoggyDetails(playerId, localAddress) {
    let contractInstance = App.contracts.CryptoMMA.at(App.CryptoMMAAddress);
    return contractInstance.getToken(playerId).then((MMAFIGHTER) => {
      var mmaJson = {
        'playerId'        	: playerId,
        'playerName'      	: MMAFIGHTER[0],        
        'playerPrice' 		: web3.fromWei(MMAFIGHTER[1]).toNumber(),       
        'ownerAddress'    : MMAFIGHTER[2]
      };
      // Check to see if we own the given Doggy
      if (mmaJson.ownerAddress !== localAddress) {
        loadMMA(
          mmaJson.playerId,
          mmaJson.playerName,     
          mmaJson.playerPrice,        
          mmaJson.ownerAddress,
          false
        );
      } else {
        loadMMA(
          mmaJson.playerId,
          mmaJson.playerName,        
          mmaJson.playerPrice,         
          mmaJson.ownerAddress,
          true
        );
      }
    }).catch((err) => {
      console.log(err.message);
    })
  },

  handlePurchase(event) {
    event.preventDefault();

    // Get the form fields
    var playerId = parseInt($(event.target.elements).closest('.btn-buy').data('id'));

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      let contractInstance = App.contracts.CryptoMMA.at(App.CryptoMMAAddress);
      contractInstance.priceOf(playerId).then((price) => {
        return contractInstance.purchase(playerId, {
          from: account,
          value: price,
        }).then(result => App.loadDoggies()).catch((err) => {
          console.log(err.message);
        });
      });
    });
  },

  /** Event Bindings for Form submits */
  bindEvents() {
    $(document).on('submit', 'form.doggy-purchase', App.handlePurchase);
  },
};

jQuery(document).ready(
  function ($) {
    App.init();
  }
);
