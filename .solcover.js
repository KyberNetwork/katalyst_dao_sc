module.exports = {
  mocha: {
    timeout: 150000
  },
  providerOptions: {
    default_balance_ether: 100000000000000,
    total_accounts: 20,
  },
  skipFiles: ['mock/'],
  istanbulReporter: ['html', 'json']
};
