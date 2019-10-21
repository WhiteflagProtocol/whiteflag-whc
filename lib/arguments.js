'use strict';
/**
 * @module lib/arguments
 * @summary Whiteflag WHL arguments module
 * @description Module that handles the command line arguments
 */
module.exports = {
    // CLI functions
    parse: parseArguments
};

// Module constants //
const WHLURL = 'https://whc.unesco.org/en/list/xml/';

// Configure option parser //
const args = require('yargs')
    .usage('Usage: $0 -s <id> [-u <url> | -f <file>] [-p] [-t -c <file>]')
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
    }).nargs('u', 1).default('u', WHLURL)
    .option('f', {
        alias: 'file',
        describe: 'The file containing the WHL in XML',
        type: 'string'
    }).nargs('f', 1)
    .conflicts('u', 'f')
    .option('p', {
        alias: 'print',
        describe: 'Print the Whiteflag message on screen',
        type: 'boolean'
    })
    .option('t', {
        alias: 'transmit',
        describe: 'Send the Whiteflag message(s)',
        type: 'boolean'
    })
    .option('c', {
        alias: 'config',
        describe: 'The file with the Whiteflag configuration',
        type: 'string'
    }).nargs('c', 1)
    .implies('t', 'c');

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
