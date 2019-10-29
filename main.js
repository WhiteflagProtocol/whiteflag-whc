#!/usr/bin/env node
'use strict';
/**
 * @module main
 * @summary Whiteflag WHL main module
 * @description Module called first when invoking the Whiteflag WHL utility
 */

// Node.js core and external modules //
const yargs = require('yargs');

// Whiteflag WHL modules //
const whl = require('./lib/whl');
const whiteflag = require('./lib/whiteflag');

/*
 * Gracefully crash if an uncaught exception occurs and
 * ensure proper shutdown when process is stopped
 */
process.on('uncaughtException', uncaughtExceptionCb);
process.on('SIGINT', interruptCb);
process.on('SIGTERM', interruptCb);

// EXECUTE MAIN PROCESS FUNCTION //
main(function mainCb(err, exitcode = 0) {
    if (err) return errorHandler(err, exitcode);
    return process.exit(exitcode);
});

// MAIN FUNCTIONS //
/**
 * Main process function
 * @function main
 * @param {function} callback
 */
function main(callback) {
    // Parse command line options
    const options = parseArguments(process.argv);

    // Get the requested WHL site data
    whl.getSites(options, function whlGetSitesCb(err, sites) {
        if (err) return callback(err, 2);
        if (sites.length === 0) return callback(null, 1);

        // Create Whiteflag messages from WHL site data
        whiteflag.createMessages(sites, options, function wfCreateMessagesCb(err, wfMessages) {
            if (err) return callback(err);

            // Send the Whiteflag messages
            whiteflag.sendMessages(wfMessages, options, function wfSendMessagesCb(err) {
                if (err) return callback(err, 2);
                return callback(null, 0);
            });
        });
    });
}

// CALLBACK AND HANDLER FUNCTIONS //
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

/**
 * Parses the provided command line arguments
 * @private
 * @param {array} argv array with arguments passed to process
 * @returns {object} parsed options provided on the command line
 */
function parseArguments(argv) {
    // Define arguments
    const args = yargs
    .usage('Usage: $0 [-s <id> ...] [-w <url>|-f <file>]\n             [-t -i <url> -b <blockchain> -a <address>] [-ov]')
    .config()
    .option('s', {
        alias: 'sites',
        describe: 'Specify the world heritage site(s) by <id> number',
        type: 'array'
    })
    .option('w', {
        alias: 'web',
        describe: 'The <url> of the WHL in XML on the web',
        type: 'string',
        requiresArg: true,
        conflicts: 'f'
    })
    .option('f', {
        alias: 'file',
        describe: 'The <file> containing the WHL in XML',
        type: 'string',
        requiresArg: true,
        normalize: true,
        conflicts: 'w'
    })
    .option('t', {
        alias: 'transmit',
        describe: 'Transmit the Whiteflag message(s)',
        type: 'boolean',
        implies: ['i', 'b', 'a']
    })
    .option('i', {
        alias: 'interface',
        describe: 'The Whiteflag API REST interface <url>',
        type: 'string',
        requiresArg: true
    })
    .option('b', {
        alias: 'blockchain',
        describe: 'The <blockhain> to be used',
        type: 'string',
        requiresArg: true
    })
    .option('a', {
        alias: 'address',
        describe: 'The blockchain <address> to be used',
        type: 'string',
        requiresArg: true
    })
    .option('o', {
        alias: 'stdout',
        describe: 'Send the Whiteflag message(s) to stdout',
        type: 'boolean'
    })
    .option('v', {
        alias: 'verbose',
        describe: 'Provide detailed processing output',
        type: 'boolean'
    });
    return args.parse(argv);
}
