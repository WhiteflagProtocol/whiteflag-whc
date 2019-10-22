'use strict';
/**
 * @module lib/arguments
 * @summary Whiteflag WHL arguments module
 * @description Module that handles the command line arguments
 */
module.exports = {
    // WHL site functions
    get: getSites
};

// Node.js core and external modules //
const fs = require('fs');
const parseXML = require('xml2js').parseString;

// WHiteflag WHL modules //
const httpreq = require('./httpreq');

// Module constants //
const WHLNATURAL = 'natural';
const WHLURL = 'https://whc.unesco.org/en/list/xml/';
const whlPropertiesRemove = ['query', 'row'];

// MAIN MODULE FUNCTIONS //
/**
 * Gets the site information from the WHL
 * @function getSites
 * @alias module:lib/sites.get
 * @param {object} options the options for the request
 * @param {function} callback function to be called upon completion
 */
function getSites(options, callback) {
    // Get WHL from the web or file
    getWHL(options, function getWHLCb(err, whl) {
        if (err) return callback(err);
        if (options.verbose) console.log(`Retrieved WHL consists of ${whl.length} entries`);

        let sites = [];
        let count = 0;
        let skipped = 0;
        if (!options.sites) {
            // No site(s) specified; get all sites
            if (options.verbose) console.log('Extracting all sites from WHL');
            for (let i = 0; i < whl.length; i++) {
                const site = extractSite(whl, i);
                if (site.category.toLowerCase() !== WHLNATURAL) {
                    sites[count] = site;
                    count++;
                } else {
                    skipped++;
                }
            }
        } else {
            // Site(s) specified
            for (let i = 0; i < options.sites.length; i++) {
                const index = whl.findIndex(site => site.id_number === options.sites[i].toString());
                if (index >= 0) {
                    const site = extractSite(whl, index);
                    if (site.category.toLowerCase() !== WHLNATURAL) {
                        sites[count] = site;
                        count++;
                    } else {
                        skipped++;
                    }
                }
            }
        }
        // Results
        if (options.verbose) {
            if (skipped) console.log(`Skipped ${skipped} natural heritage sites from WHL`);
            console.log(`Processed data of ${sites.length} cultural heritage sites from WHL`);
        }
        return callback(null, sites);
    });
}

// PRIVATE FUNCTIONS //
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
            parseXML(xml, {explicitArray: false}, function parseXMLCb(err, whl) {
                if (err) return callback(new Error(`Cannot process XML data from ${options.file}: ${err.message}`));
                return callback(null, extractWHL(whl));
            });
        });
    } else {
        // Get WHL XML data from an internet resource
        if (!options.web) options.web = WHLURL;
        let url;
        try {
            url = new URL(options.web);
        } catch(err) {
            return callback(err);
        }
        // Perform HTTP request
        if (options.verbose) console.log(`Retrieving WHL from ${options.web}`);
        httpreq.get(url, function httpGetWHLCb(err, xml) {
            if (err) return callback(new Error(`Error while retrieving WHL from ${options.web}: ${err.message}`));

            // Parse the WHL XML data and return resulting list
            parseXML(xml, {explicitArray: false}, function parseXMLCb(err, whl) {
                if (err) return callback(new Error(`Cannot process XML data from ${options.web}: ${err.message}`));
                return callback(null, extractWHL(whl));
            });
        });
    }
}

/**
 * Puts WHL site data from the full list into an array
 * @private
 * @param {object} whl the full WHL
 * @returns {array} the clean WHL
 */
function extractWHL(whl) {
    // Extract the array with the list from the larger WHL object
    for (let i = 0; i < whlPropertiesRemove.length; i++) {
        if (Array.isArray(whl)) break;
        whl = whl[whlPropertiesRemove[i]];
    }
    return whl;
}

/**
 * Gets the site data from WHL data
 * @private
 * @param {array} whl the WHL
 * @param {number} id the WHL site index number
 * @returns {object} site data
 */
function extractSite(whl = [], index = 0) {
    // Get site data from WHL entryll
    const entry = whl[index];
    const site = {
        id: entry.id_number,
        name: entry.site,
        category: entry.category,
        url: entry.http_url,
        date: new Date(entry.date_inscribed),
        lat: entry.latitude,
        long: entry.longitude
    };
    // Return the results
    return site;
}
