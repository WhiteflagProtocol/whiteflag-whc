'use strict';
/**
 * @module lib/whiteflag
 * @summary Whiteflag protocol module
 * @description Module that handles whiteflag message
 */
module.exports = {
    // Whiteflag functions
    createMessages,
    sendMessages
};

// WHiteflag WHL modules //
const httpreq = require('./common/httpreq');

// Module constants //
const WFAPIURL = 'http://localhost:5746';
const WFAPIENDPOINT = '/messages/send';
const WFRESOURCE = 'R';
const WFRESOURCEREFCODE = '3';
const WFPROTECTIVESIGN = 'P';
const WFCULTURALPROPERTY = '52';

/**
 * Creates Whiteflag messages from WHL site data
 * @function createMessages
 * @alias module:lib/whiteflag.createMessages
 * @param {array} sites the WHL sites to be processed
 * @param {object} options the options provided on the command line
 * @param {function} callback
 */
function createMessages(sites, options, callback) {
    let counter = 0;
    let wfMessages = [];
    for (let i = 0; i < sites.length; i++) {
        // Create a protective sign and a resource message
        let wfMessageSet = [];
        wfMessageSet[0] = createMessage(sites[i], WFPROTECTIVESIGN);
        wfMessageSet[1] = createMessage(sites[i], WFRESOURCE);

        // Process message iaw specified options
        for (let m = 0; m < wfMessageSet.length; m++) {
            counter++;
            if (options.blockchain) wfMessageSet[m].MetaHeader.blockchain = options.blockchain;
            if (options.address) wfMessageSet[m].MetaHeader.originatorAddress = options.address;
            if (options.verbose) console.log(`Created message ${counter}/${(sites.length * 2)}: ${messageType(wfMessageSet[m])} for site ${sites[i].id}`);
            if (options.stdout) {
                process.stdout.write(JSON.stringify(wfMessageSet[m]));
                process.stdout.write('\n');
            }
        }
        // Add messages to message set
        wfMessages[i] = wfMessageSet;
    }
    // All done
    return callback(null, wfMessages);
}

/**
 * Sends Whiteflag messages to specified Whiteflag API
 * @function sendMessages
 * @alias module:lib/whiteflag.sendMessages
 * @param {array} wfMessages Whiteflag messages to be sent
 * @param {object} options the options provided on the command line
 * @param {function} callback
 */
function sendMessages(wfMessages, options, callback) {
    if (!options.transmit) return callback(null);
    iterateMessages(0, [], function iterateMessagesCb(err, skipped) {
        if (err) return callback(err);
        if (skipped && skipped.length > 0) {
            return callback(new Error(`Could not sent all Whiteflag messages for ${skipped.length} sites: ${JSON.stringify(skipped)}`));
        }
        return callback(null);
    });

    /**
    /* Iterates over all messages
     * @private
     */
    function iterateMessages(i = 0, skipped = [], callback) {
        // Return if completed
        if (i >= wfMessages.length) return callback(null);

        // Get next message set
        let wfMessageSet = wfMessages[i];

        // Send protective sign first
        if (options.verbose) console.log(`Sending message ${(i + 1)}/${(wfMessages.length * 2)}: ${messageType(wfMessageSet[0])} for site ${wfMessageSet[0].MetaHeader.whlSiteNumber}`);
        sendMessageDummy(wfMessageSet[0], options, function sendPMessageCb(err, result) {
            if (err) {
                // Error; also skip the related resource message
                console.error(`${err.message}`);
                console.warn(`Skipping message ${(i + 2)}/${(wfMessages.length * 2)}: ${messageType(wfMessageSet[1])} for site ${wfMessageSet[1].MetaHeader.whlSiteNumber}`);
                skipped.push(wfMessageSet[0].MetaHeader.whlSiteNumber);
                return iterateMessages((i + 1), skipped, callback);
            } else {
                // Send resource message refering to protective sign
                wfMessageSet[1].MessageHeader.ReferencedMessage = result.data.MetaHeader.transactionHash;
                if (options.verbose) console.log(`Sending message ${(i + 2)}/${(wfMessages.length * 2)}: ${messageType(wfMessageSet[1])} for site ${wfMessageSet[1].MetaHeader.whlSiteNumber}`);
                sendMessageDummy(wfMessageSet[1], options, function sendRMessageCb(err) {
                    if (err) console.error(err.message);
                    skipped.push(wfMessageSet[1].MetaHeader.whlSiteNumber);
                    return iterateMessages((i + 1), skipped, callback);
                });
            }
        });
    }
}

/**
 * Sends a Whiteflag message
 * @private
 * @param {object} wfMessage Whiteflag message to be sent
 * @returns {string} Whiteflag message type
 */
function sendMessageDummy(wfMessage, options, callback) {
    let result = { data: { MetaHeader: { transactionHash: '123' }}};
    return callback(null, result);
}
function sendMessage(wfMessage, options, callback) {
    // Determine Whiteflag API URL to send Whiteflag messages
    let url;
    if (!options.interface) options.interface = WFAPIURL;
    try {
        url = new URL(options.interface + WFAPIENDPOINT); // eslint-disable-line no-undef
    } catch(err) {
        return callback(err);
    }
    // Send Whiteflag message
    httpreq.post(url, wfMessage, function sendMessageCb(err, data) {
        if (err && !data) return callback(err);

        // Parse the returned data
        let result;
        try {
            result = JSON.parse(data);
        } catch(err) {
            return callback(err);
        }
        // Return result
        if (err) return callback(new Error(`${err.message}: ${JSON.stringify(result.errors)}`));
        return callback(null, result);
    });
}

// PRIVATE FUNCTIONS //
/**
 * Creates a Whiteflag message
 * @private
 * @param {object} site WHL site data
 * @param {string} type Whiteflag message code
 * @returns {string} Whiteflag message type
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

    // Create message metaheader
    wfMessage.MetaHeader = WFMESSAGE.MetaHeader;
    wfMessage.MetaHeader.whlSiteNumber = site.id;

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
            wfMessage.MessageHeader.ReferenceIndicator = WFRESOURCEREFCODE;
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

/**
 * Determines type of message
 * @private
 * @param {object} wfMessage a Whiteflag message
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
 * @returns {string} Whiteflag datetime
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
