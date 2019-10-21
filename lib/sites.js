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
    const url = new URL(options.url);
    getWHL(url, function getWHLCb(err, whl) {
        if (err) return callback(err);

        // Extract the array with the list from the larhger WHL object
        for (let i = 0; i < whlPropertiesRemove.length; i++) {
            if (Array.isArray(whl)) break;
            whl = whl[whlPropertiesRemove[i]];
        }
        console.log(`Retrieved WHL consists of ${whl.length} entries`);

        // Get the requested site data from the WHL
        getSiteData(whl, options.site, function getSiteCb(err, site) {
            if (err) return callback(err);

            // Return found site
            console.log(`Found site ${options.site}: ` + JSON.stringify(site));
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
 * Gets the WHL from URL
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
            parseXML(xml, {explicitArray: false}, function(err, fullWHL) {
                if (err) return callback(err);
                return callback(null, fullWHL);
            });
        });
    });
}

/**
 * Extract the WHL array from larger WHL object
 * @private
 * @param {object} whl the full WHL
 * @param {array} properties the highest level properties to skip
 * @param {function} callback function to be called upon completion
 */
function extractWHL(whl, properties = [], callback) {
    if (Array.isArray(whl)) return callback(null, whl);
    if (properties.length === 0) return callback(null, whl);
    console.log('Extracting properties:' + JSON.stringify(properties));
    if (Object.prototype.hasOwnProperty(whl, properties[0])) {
        extractWHL(whl[properties[0]], properties.slice(1), callback);
    }
    return callback(new Error(`Could not extract list from WHL object property "${properties[0]}"`), whl);
}
