const { injectString, capitalizeFirstLetter } = require('../helpers');

const getMessages = (msg, options = []) =>
    capitalizeFirstLetter(injectString(msg, options));

module.exports = {
    getMessages,
};
