#!/usr/bin/env node
'use strict';
/**
 * @module index
 * @summary Whiteflag WHL main module
 * @description Module called first when invoking the Whiteflag WHL utility
 */

// Whiteflag WHL modules //
const args = require('./lib/arguments');
const sites = require('./lib/sites');
const whiteflag = require('./lib/whiteflag');

/*
 * Gracefully crash if an uncaught exception occurs and
 * ensure proper shutdonwn when process is stopped
 */
process.on('uncaughtException', uncaughtExceptionCb);
process.on('SIGINT', interruptCb);
process.on('SIGTERM', interruptCb);

// MAIN //
main(function mainCb(err) {
    if (err) errorHandler(err);
    process.exit(0);
});

// PRIVATE FUNCTIONS //
/**
 * Main process function
 * @function main
 * @param {function} callback
 */
function main(callback) {
    args.parse(process.argv, function argumentsCb(err, options) {
        if (err) return callback(err);

        // Get the requested site
        sites.get(options, function sitesCb(err, site) {
            if (err) return callback(err);

            // Process Whiteflag messages
            whiteflag.processData(site, options, function wfProcessDataCb(err) {
                if (err) return callback(err);
                return callback(null);
            });
        });
    });
}

/**
 * Function to handle errors
 * @function errorHandler
 * @param {object} err error object if any error
 */
function errorHandler(err) {
    console.error(err.message);
    return process.exit(2);
}

/**
 * Callback to log uncaught exceptions
 * @callback interruptCb
 * @param {object} err error object if any error
 */
function interruptCb() {
    console.log('Caught SIGINT or SIGTERM. Exiting.');
    return process.exit(130);
}

/**
 * Callback to log uncaught exceptions
 * @callback uncaughtExceptionCb
 * @param {object} err error object if any error
 */
function uncaughtExceptionCb(err) {
    if (err.stack) {
        console.error(`UNCAUGHT EXCEPTION: ${err.stack}`);
    } else {
        console.error(`UNCAUGHT EXCEPTION: ${err.toString()}`);
    }
    return process.exit(2);
}
