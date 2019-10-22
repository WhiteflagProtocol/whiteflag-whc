'use strict';
/**
 * @module lib/whiteflag
 * @summary Whiteflag protocol module
 * @description Module that handles whiteflag message
 */
module.exports = {
    // Whiteflag functions
    processData: processData
};

// Module constants //
const WFPROTECTIVESIGN = 'P';
const WFCULTURALPROPERTY = '52';
const WFRESOURCE = 'R';

/**
 * Processes site data to create and send Whiteflag messages
 * @function processData
 * @param {array} sites sites to be processed
 * @param {function} callback
 */
function processData(sites, options, callback) {
    let wfMessages = [];
    for (let i = 0; i < sites.length; i++) {
        let wfMessageSet = [];

        // Create a protective sign and send to stdout if option specified
        wfMessageSet[0] = createMessage(sites[i], WFPROTECTIVESIGN);
        if (options.verbose) console.log(`Created a ${messageType(wfMessageSet[0])} message for site ${sites[i].id}`);
        if (options.stdout) {
            process.stdout.write(JSON.stringify(wfMessageSet[0]));
            process.stdout.write('\n');
        }
        // Create a resource message and send to stdout if option specified
        wfMessageSet[1] = createMessage(sites[i], WFRESOURCE);
        if (options.verbose) console.log(`Created a ${messageType(wfMessageSet[1])} message for site ${sites[i].id}`);
        if (options.stdout) {
            process.stdout.write(JSON.stringify(wfMessageSet[1]));
            process.stdout.write('\n');
        }
        wfMessages[i] = wfMessageSet;
    }
    // All done
    return callback(null, wfMessages);
}

/**
 * Creates a Whiteflag message
 * @function createMessage
 */
function createMessage(site, type) {
    const WFMESSAGE = {
        MetaHeader: {},
        MessageHeader: {
            Prefix: 'WF',
            Version: '1',
            EncryptionIndicator: '0',
            DuressIndicator: '0',
            MessageCode: '',
            ReferenceIndicator: '0',
            ReferencedMessage: '0000000000000000000000000000000000000000000000000000000000000000'
        },
        MessageBody: {
            SubjectCode: '00',
            DateTime: '',
            Duration: 'P00D00H00M',
            ObjectType: '00',
            ObjectLatitude: '+99.99999',
            ObjectLongitude: '+999.99999',
            ObjectSizeDim1: '0000',
            ObjectSizeDim2: '0000',
            ObjectOrientation: '000'
        }
    };
    let wfMessage = {};

    // Create message header
    wfMessage.MessageHeader = WFMESSAGE.MessageHeader;
    wfMessage.MessageHeader.MessageCode = type;

    // Adapt message header and crate body based on type
    switch (type) {
        case WFPROTECTIVESIGN: {
            // Message Body
            wfMessage.MessageBody = WFMESSAGE.MessageBody;
            wfMessage.MessageBody.SubjectCode = WFCULTURALPROPERTY;
            wfMessage.MessageBody.DateTime = wfDateTime(site.date);
            wfMessage.MessageBody.ObjectLatitude = wfLatLong(site.lat, 'lat');
            wfMessage.MessageBody.ObjectLongitude = wfLatLong(site.long, 'long');
            break;
        }
        case WFRESOURCE: {
            // Message Header
            wfMessage.MessageHeader.ReferenceIndicator = '5';
            wfMessage.MessageHeader.ReferencedMessage = '';

            // Message Body
            wfMessage.MessageBody = {};
            wfMessage.MessageBody.ResourceMethod = '1';
            wfMessage.MessageBody.ResourceData = site.url;
            break;
        }
    }
    // Return resulting message
    return wfMessage;
}

// PRIVATE FUNCTIONS //
/**
 * Determines type of message
 * @private
 * @param {object} wfMessage Whiteflag message
 * @returns {string} message type
 */
function messageType(wfMessage) {
    // Check for valid message
    if (!wfMessage) return 'NULL';
    if (!wfMessage.MessageHeader) return 'INVALID';
    if (!wfMessage.MessageHeader.MessageCode) return 'unknown';

    // Check reference indicator
    let referenceCode = '';
    if (wfMessage.MessageHeader.ReferenceIndicator) referenceCode = `(${wfMessage.MessageHeader.ReferenceIndicator})`;

    // Determine message and return result
    if (wfMessage.MessageBody) {
        if (wfMessage.MessageBody.SubjectCode) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.SubjectCode}${referenceCode}`;
        if (wfMessage.MessageBody.CryptoDataType) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.CryptoDataType}${referenceCode}`;
        if (wfMessage.MessageBody.VerificationMethod) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.VerificationMethod}${referenceCode}`;
        if (wfMessage.MessageBody.ResourceMethod) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.ResourceMethod}${referenceCode}`;
    }
    return `${wfMessage.MessageHeader.MessageCode}${referenceCode}`;
}

/**
 * Create Whiteflag message datetime string
 * @private
 * @param {Date} date
 * @returns {string} Whiteflag datatime
 */
function wfDateTime(date) {
    let wfDate = date;
    try {
        // Check if date object or ISO string
        if (date instanceof Date) wfDate = date.toISOString();
    } catch(err) {
        return null;
    }
    // Return ISO string without milliseconds
    return wfDate.slice(0, 19) + 'Z';
}

/**
 * Format Whiteflag latitude
 * @private
 * @param {string} latlong latitude or longitude
 * @param {string} type 'lat' | 'long'
 * @returns {string} Whiteflag latitude or longitude
 */
function wfLatLong(latlong, type) {
    let dg;
    let dc;
    try {
        // Only 5 decimals allowed
        dc = latlong.split('.')[1].slice(0, 5);

        // Check degrees sign
        dg = latlong.split('.')[0];
        if (dg[0] !== '+' && dg[0] !== '-') {
            dg = '+' + dg;
        }
        // Check degrees leading zeros
        let n = 0;
        if (type === 'lat') n = 3;
        if (type === 'long') n = 4;
        if (n === 0) throw(new Error(`Specified wrong type for coordinate conversion: ${type}`));
        for (let i = 1; dg.length < n; i++) {
            dg = dg.slice(0, i) + '0' + dg.slice(i);
        }
    } catch(err) {
        return null;
    }
    // Return result
    return (dg + '.' + dc);
}
