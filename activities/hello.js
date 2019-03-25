'use strict';

module.exports = async () => {
  try {
    logger.info('\'Hello\' activity was called');

    Activity.Response.Data = 'hello, ' + Activity.Request.Path;
  } catch (error) {
    Activity.handleError(error);
  }
};
