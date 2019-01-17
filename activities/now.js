'use strict';

const utils = require('./common/utils');

module.exports = async (activity) => {
    try {
        activity.Response.Data = utils.now();
    } catch (error) {
        let m = error.message;

        if (error.stack) {
            m = m + ': ' + error.stack;
        }

        activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;

        activity.Response.Data = {
            ErrorText: m
        };
    }
};
