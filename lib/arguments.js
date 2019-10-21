'use strict';
/**
 * @module lib/arguments
 * @summary Whiteflag WHL arguments module
 * @description Module that handles the command line arguments
 */
module.exports = {
    // argument functions
    parse: parseArguments
};

// Configure option parser //
const args = require('yargs')
    .usage('Usage: $0 -s <id> [-u <url>|-f <file>] [-m] [-t -w <file>] [-v]')
    .option('s', {
        alias: 'site',
        describe: 'The world heritage site id number',
        type: 'string',
        demandOption: true
    }).nargs('s', 1)
    .option('u', {
        alias: 'url',
        describe: 'The URL of the WHL in XML',
        type: 'string'
    }).nargs('u', 1)
    .option('f', {
        alias: 'file',
        describe: 'The file containing the WHL in XML',
        type: 'string'
    }).nargs('f', 1).conflicts('f', 'u')
    .option('m', {
        alias: 'message',
        describe: 'Send the Whiteflag message to stdout',
        type: 'boolean'
    })
    .option('t', {
        alias: 'transmit',
        describe: 'Send the Whiteflag message(s) on a blockhain',
        type: 'boolean'
    }).implies('t', 'w')
    .option('w', {
        alias: 'whiteflag',
        describe: 'The file with the Whiteflag transmission details',
        type: 'string'
    }).nargs('w', 1)
    .option('v', {
        alias: 'verbose',
        describe: 'Provide detailed output',
        type: 'boolean'
    });

// MAIN MODULE FUNCTIONS //
/**
 * Parses the provided command line arguments
 * @function parseArguments
 * @alias module:lib/arguments.parse
 * @param {array} argv array with arguments passed to process
 * @param {function} callback function to be called upon completion
 */
function parseArguments(argv, callback) {
    return callback(null, args.parse(argv));
}
