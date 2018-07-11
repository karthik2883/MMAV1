require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');

const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
  new HDWalletProvider(mnemonic, rpcEndpoint);

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 4189382
    },
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 4189382
    },
    ganache: {
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 4189382
    },
  },
};
