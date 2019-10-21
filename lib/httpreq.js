'use strict';
/**
 * @module lib/httpreq
 * @summary Whiteflag WHL http requests module
 * @description Module that handles http requests
 */
module.exports = {
    // http functions
    get
};

// Node.js core and external modules //
const https = require('https');

/**
 * Gets the WHL from URL
 * @private
 * @param {URL} url the URL of the WHL list in XML
 * @param {function} callback function to be called upon completion
 */
function get(url, callback) {
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
