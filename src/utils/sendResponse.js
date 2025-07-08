/**
 * Utility function to send consistent API responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (e.g. 200, 400, 500)
 * @param {Boolean} success - Operation success status
 * @param {String} message - Response message
 * @param {Object|null} data - Response data (optional)
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};
