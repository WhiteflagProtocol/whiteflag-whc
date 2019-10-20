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

/*
 * Gracefully crash if an uncaught exception occurs and
 * ensure proper shutdonwn when process is stopped
 */
process.on('uncaughtException', uncaughtExceptionCb);
process.on('SIGINT', shutdownCb);
process.on('SIGTERM', shutdownCb);

// MAIN PROCESS FLOW //
args.parse(process.argv, function Cb(err, options) {
    if (err) errorHandler(err);
    console.error(`Retrieving site: ${options.site}`);
    sites.get(options.site, function Cb(err, site) {
        if (err) errorHandler(err);
        console.log(JSON.stringify(site));
        process.exit(0);
    });
});

// PRIVATE FUNCTIONS //
/**
 * Callback to log uncaught exceptions
 * @callback shutdownCb
 * @param {object} err error object if any error
 */
function shutdownCb() {
    console.log('Caught SIGINT or SIGTERM. Exiting.');
    return process.exit(0);
}

/**
 * Function to handle errors
 * @function errorHandler
 * @param {object} err error object if any error
 */
function errorHandler(err) {
    console.err(err.message);
    return process.exit(1);
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
