'use strict';

const {handleError} = require('@adenin/cf-activity');

module.exports = async (activity) => {
  try {
    activity.Response.Data = 'hello, ' + activity.Request.Path;
  } catch (error) {
    handleError(error, activity);
  }
};
