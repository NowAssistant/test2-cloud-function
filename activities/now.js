'use strict';

module.exports = async (activity) => {
    try {
        activity.Response.Data = new Date().toISOString();
    } catch (error) {
        // return error response
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
