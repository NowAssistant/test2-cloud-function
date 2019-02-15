'use strict';

const handleError = require('@adenin/cf-activity').handleError;

module.exports = async (activity) => {
    try {
        activity.Response.Data = new Date().toISOString();
    } catch (error) {
        handleError(error, activity);
    }
};
