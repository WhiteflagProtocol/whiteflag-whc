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
