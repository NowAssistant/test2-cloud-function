'use strict';

module.exports = async () => {
  try {
    logger.info('\'Now\' activity was called');

    Activity.Response.Data = new Date().toISOString();
  } catch (error) {
    Activity.handleError(error);
  }
};
