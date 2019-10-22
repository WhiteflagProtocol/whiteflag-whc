'use strict';
/**
 * @module lib/httpreq
 * @summary Whiteflag WHL http requests module
 * @description Module that handles http requests
 */
module.exports = {
    // http functions
    get: httpGET
};

// Node.js core and external modules //
const https = require('https');

/**
 * Performs an HTTP GET request
 * @function get
 * @param {URL} url the URL of the request
 * @param {function} callback function to be called upon completion
 */
function httpGET(url, callback) {
    https.get(url, function(res) {
        let data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('error', function httpErrCb(err) {
            return callback(err);
        });
        res.on('timeout', function httpTimeoutCb(err) {
            return callback(err);
        });
        res.on('end', function httpProcessCb() {
            return callback(null, data);
        });
    });
}
