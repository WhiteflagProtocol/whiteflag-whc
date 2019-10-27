'use strict';
/**
 * @module lib/httpreq
 * @summary Whiteflag WHL http requests module
 * @description Module that handles http requests
 */
module.exports = {
    // http functions
    get: httpGET,
    post: httpPOST
};

// Node.js core and external modules //
const http = require('http');
const https = require('https');

/**
 * Performs an HTTP GET request
 * @function get
 * @param {URL} url the URL of the request
 * @param {function} callback function to be called upon completion
 */
function httpGET(url, callback) {
    const options = {
        method: 'GET'
    };
    httpRequest(url, options, null, function httpGetCb(err, result) {
        if (err) return callback(new Error(`Could not complete request: ${err.message}`));
        return callback(null, result);
    });
}

/**
 * Performs an HTTP GET request
 * @function get
 * @param {URL} url the URL of the request
 * @param {data} data the data to be in the request body
 * @param {function} callback function to be called upon completion
 */
function httpPOST(url, data, callback) {
    const body = JSON.stringify(data);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    httpRequest(url, options, body, function httpPostCb(err, result) {
        if (err) return callback(new Error(`Could not complete request: ${err.message}`));
        return callback(null, result);
    });
}

// PRIVATE FUNCTIONS //
/**
 * Performs an HTTP request
 * @function httpRequest
 * @param {URL} url the URL of the request
 * @param {object} data the data to be in the request body
 * @param {function} callback function to be called upon completion
 */
function httpRequest(url, options, body, callback) {
    // Create request with protocol specified in url
    let req;
    const protocol = url.protocol.slice(0, -1);
    switch (protocol) {
        case 'http': {
            req = http.request(url, options, resCb);
            break;
        }
        case 'https': {
            req = https.request(url, options, resCb);
            break;
        }
        default: {
            // Method does not exist
            return callback(new Error(`Unsupported protocol for request: ${protocol}`));
        }
    }
    // Handle reqest errors
    req.on('error', function httpErrCb(err) {
        return callback(err);
    });
    req.on('timeout', function httpTimeoutCb(err) {
        req.abort();
        return callback(new Error(`Aborted request after timeout: ${err.message}`));
    });
    // Send request data
    if (body) req.write(body);
    req.end();

    // Callback functions
    function resCb(res) {
        if (res.statusCode < 200 || res.statusCode > 299) {
            return callback(new Error(`Received status code: ${res.statusCode}`));
        }
        let data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function httpProcessCb() {
            return callback(null, data);
        });
    }
}
