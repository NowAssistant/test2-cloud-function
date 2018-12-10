'use strict';

const logger = require('@adenin/cf-logger');

module.exports = async (activity) => {
    try {
        // SQL action
        const message = 'This is an SQL action connector';

        logger.info(message);
        activity.message = message;
    } catch (error) {
        let m = error.message;

        if (error.stack) {
            m = m + ': ' + error.stack;
        }

        activity.Response.ErrorCode =
            (error.response && error.response.statusCode) || 500;

        activity.Response.Data = {
            ErrorText: m
        };
    }
};
