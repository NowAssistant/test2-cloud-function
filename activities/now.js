'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    activity.Response.Data = new Date().toISOString();
  } catch (error) {
    api.handleError(error, activity);
  }
};
