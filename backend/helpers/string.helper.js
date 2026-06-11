/* eslint-disable node/no-unsupported-features/es-syntax */
const methods = {
  injectString(str, arr) {
    if (typeof str !== "string" || !(arr instanceof Array)) {
      return false;
    }

    return str.replace(
      /({\d})/g,
      (i) => arr[i.replace(/{/, "").replace(/}/, "")]
    );
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
};

module.exports = {
  ...methods,
};
