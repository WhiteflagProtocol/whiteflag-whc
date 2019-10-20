#!/usr/bin/env node
'use strict';
/**
 * @module index
 * @summary Whiteflag WHL main module
 * @description Module called first when invoking the Whiteflag WHL utility
 */

// Whiteflag WHL modules //
const args = require('./lib/arguments');

/*
 * Gracefully crash if an uncaught exception occurs and
 * ensure proper shutdonwn when process is stopped
 */
process.on('uncaughtException', uncaughtExceptionCb);
process.on('SIGINT', shutdownCb);
process.on('SIGTERM', shutdownCb);

// MAIN PROCESS FLOW //
let options = args.parse(process.argv);
console.log(`Retrieving site: ${options.site}`);
process.exit(0);

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
 * Callback to log uncaught exceptions
 * @callback uncaughtExceptionCb
 * @param {object} err error object if any error
 */
function uncaughtExceptionCb(err) {
    if (err.stack) {
        console.log(`UNCAUGHT EXCEPTION: ${err.stack}`);
    } else {
        console.log(`UNCAUGHT EXCEPTION: ${err.toString()}`);
    }
    return process.exit(2);
}
