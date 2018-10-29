const logger = require("@adenin/cf-logger");

module.exports = async activity => {
  try {
    // Card action
    logger.info('This is a card action connector');
  } catch (error) {
    var m = error.message;
    if (error.stack) m = m + ': ' + error.stack;

    activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;

    activity.Response.Data = { ErrorText: m };
  }

  return activity;
};
