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

// Configure option parser //
const args = require('yargs')
    .usage('Usage: $0 -s <id> [-p]  [-t -c <file>]')
    .option('s', {
        alias: 'site',
        describe: 'The world heritage site id number',
        type: 'string',
        demandOption: true
    })
    .nargs('s', 1)
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
    })
    .nargs('c', 1)
    .implies('t', 'c');

// MAIN MODULE FUNCTIONS //
/**
 * Parses the provided command line arguments 
 * @function parseArguments
 * @alias module:lib/arguments.parse
 * @param {function} callback function called after parsing
 */
function parseArguments(argv) {
    return args.parse(argv);
}
