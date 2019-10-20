'use strict';
/**
 * @module lib/arguments
 * @summary Whiteflag WHL arguments module
 * @description Module that handles the command line arguments
 */
module.exports = {
    // CLI functions
    get: getSite
};

// Node.js core and external modules //
const https = require('https');
const parseXML = require('xml2js').parseString;

// Module constants //
// eslint-disable-next-line no-undef
const WHLURL = new URL('https://whc.unesco.org/en/list/xml/');

// MAIN MODULE FUNCTIONS //
/**
 * Gets the site information from the WHL 
 * @function getSite
 * @alias module:lib/arguments.parse
 * @param {string} id the WHL site id number
 * @param {function} callback function to be called upon completion
 */
function getSite(id, callback) {
    getWHL(WHLURL, function getWHLCb(err, whl) {
        if (err) return callback(err);
        const index = whl.query.row.findIndex(site => site.id_number === id);
        return callback(null, whl.query.row[index]);
    });
}

// PRIVATE FUNCTIONS //
/**
 * Gets the WHL from 
 * @private
 * @param {URL} url the URL of the WHL list in XML
 * @param {function} callback function to be called upon completion
 */
function getWHL(url, callback) {
    https.get(url, function(res) {
        let xml = '';
        res.on('data', function(chunk) {
            xml += chunk;
        });
        res.on('error', function(err) {
            return callback(err);
        });
        res.on('timeout', function(err) {
            return callback(err);
        });
        res.on('end', function() {
            parseXML(xml, {explicitArray: false}, function(err, whl) {
                if (err) return callback(err);
                callback(null, whl);
            });
        });
    });
}
