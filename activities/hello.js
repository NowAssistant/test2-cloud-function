'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    activity.Response.Data = 'hello, ' + activity.Request.Path;
  } catch (error) {
    api.handleError(error, activity);
  }
};
