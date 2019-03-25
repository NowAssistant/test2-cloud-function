'use strict';

const api = require('./common/api');

module.exports = async () => {
  try {
    logger.info('\'Posts\' activity was called');

    const response = await api('/posts');

    if (Activity.isErrorResponse(response)) return;

    Activity.Response.Data.items = response.body;
  } catch (error) {
    Activity.handleError(error);
  }
};
