'use strict';
/**
 * @module lib/arguments
 * @summary Whiteflag WHL arguments module
 * @description Module that handles the command line arguments
 */
module.exports = {
    // WHL site functions
    get: getSite
};

// Node.js core and external modules //
const fs = require('fs');
const parseXML = require('xml2js').parseString;

// WHiteflag WHL modules //
const httpreq = require('./httpreq');

// Module constants //
const WHLURL = 'https://whc.unesco.org/en/list/xml/';
const whlPropertiesRemove = ['query', 'row'];

// MAIN MODULE FUNCTIONS //
/**
 * Gets the site information from the WHL
 * @function getSite
 * @alias module:lib/arguments.parse
 * @param {object} options the options for the request
 * @param {function} callback function to be called upon completion
 */
function getSite(options, callback) {
    // Get WHL from the web
    // eslint-disable-next-line no-undef
    getWHL(options, function getWHLCb(err, whl) {
        if (err) return callback(err);

        // Extract the array with the list from the larhger WHL object
        for (let i = 0; i < whlPropertiesRemove.length; i++) {
            if (Array.isArray(whl)) break;
            whl = whl[whlPropertiesRemove[i]];
        }
        if (options.verbose) console.log(`Retrieved WHL consists of ${whl.length} entries`);

        // Get the requested site data from the WHL
        getSiteData(whl, options.site, function getSiteCb(err, site) {
            if (err) return callback(err);

            // Return found site
            if (options.verbose) console.log(`Data of world heritage site ${options.site}: ` + JSON.stringify(site));
            return callback(null, site);
        });
    });
}

// PRIVATE FUNCTIONS //
/**
 * Gets the site data from WHL data
 * @private
 * @param {array} whl the WHL
 * @param {string} id the WHL site id number
 * @param {function} callback function to be called upon completion
 */
function getSiteData(whl = {}, id = 0, callback) {
    // Get entry from list
    const index = whl.findIndex(site => site.id_number === id);
    if (index < 0) {
        return callback(new Error(`Site ${id} does not exist`));
    }
    // Get site data from entry
    const entry = whl[index];
    const site = {
        name: entry.site,
        category: entry.category,
        url: entry.http_url,
        lat: entry.latitude,
        long: entry.longitude
    };
    return callback(null, site);
}

/**
 * Gets the WHL XML data from URL or file and converts it to native object
 * @private
 * @param {URL} url the URL of the WHL list in XML
 * @param {function} callback function to be called upon completion
 */
function getWHL(options, callback) {
    if (options.file) {
        // Get WHL XML data from file
        if (options.verbose) console.log(`Reading WHL from ${options.file}`);
        fs.readFile(options.file, function fileGetWHLCb(err, xml) {
            if (err) return callback(new Error(`Error while reading WHL from file: ${err.message}`));

            // Parse the WHL XML data
            parseXML(xml, {explicitArray: false}, function(err, whl) {
                if (err) return callback(new Error(`Cannot process XML data from ${options.file}: ${err.message}`));
                return callback(null, whl);
            });
        });
    } else {
        // Get WHL XML data from an internet resource
        if (!options.url) options.url = WHLURL;
        if (options.verbose) console.log(`Retrieving WHL from ${options.url}`);
        httpreq.get(new URL(options.url), function httpGetWHLCb(err, xml) {
            if (err) return callback(new Error(`Error while retrieving WHL from ${options.url}: ${err.message}`));

            // Parse the WHL XML data
            parseXML(xml, {explicitArray: false}, function(err, whl) {
                if (err) return callback(new Error(`Cannot process XML data from ${options.url}: ${err.message}`));
                return callback(null, whl);
            });
        });
    }
}
