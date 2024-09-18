const generateTransactionId = () => {
    return 'TXN-' + Date.now();
  };
  
  module.exports = { generateTransactionId };
  