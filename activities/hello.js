'use strict';

const utils = require('./common/utils');

module.exports = async (activity) => {
    try {
        activity.Response.Data = 'hello, ' + activity.Request.Path;
    } catch (error) {
        utils.handleError(error, activity);
    }
};
