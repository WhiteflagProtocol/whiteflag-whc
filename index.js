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
main(function mainCb(err, exitcode = 0) {
    if (err) errorHandler(err, exitcode);
    process.exit(exitcode);
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
        sites.get(options, function sitesCb(err, sites) {
            if (err) return callback(err, 2);
            if (sites.length === 0) return callback(null, 1);

            // Process Whiteflag messages
            whiteflag.processData(sites, options, function wfProcessDataCb(err) {
                if (err) return callback(err);
                return callback(null, 0);
            });
        });
    });
}

/**
 * Function to handle errors
 * @function errorHandler
 * @param {object} err error object if any error
 */
function errorHandler(err, exitcode = 2) {
    console.error(err.message);
    return process.exit(exitcode);
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
