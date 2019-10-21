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

/**
 * Processes site data to create and send Whiteflag messages
 * @function processData
 * @param {object} site
 * @param {function} callback
 */
function processData(site, options, callback) {
    // Create a protective sign and send to stdout if option specified
    let wfMessageP = createMessage(site, WFPROTECTIVESIGN);
    if (options.verbose) console.log(`Created a ${messageType(wfMessageP)} message for site ${options.site}`);
    if (options.message) {
        process.stdout.write(JSON.stringify(wfMessageP, null, 2));
        process.stdout.write('\n');
    }
    // Create a resource message and send to stdout if option specified
    let wfMessageR = createMessage(site, WFRESOURCE);
    if (options.verbose) console.log(`Created a ${messageType(wfMessageR)} message for site ${options.site}`);
    if (options.message) {
        process.stdout.write(JSON.stringify(wfMessageR, null, 2));
        process.stdout.write('\n');
    }
    // All done
    return callback(null, null);
}

/**
 * Creates a Whiteflag message
 * @function createMessage
 */
function createMessage(site, type) {
    let wfMessage = {};
    wfMessage.MessageHeader = WFMESSAGE.MessageHeader;
    wfMessage.MessageHeader.MessageCode = type;
    switch (type) {
        case WFPROTECTIVESIGN: {
            wfMessage.MessageBody = WFMESSAGE.MessageBody;
            wfMessage.MessageBody.SubjectCode = WFCULTURALPROPERTY;
            wfMessage.MessageBody.DateTime = '';
            wfMessage.MessageBody.ObjectLatitude = site.lat;
            wfMessage.MessageBody.ObjectLongitude = site.long;
            break;
        }
        case WFRESOURCE: {
            wfMessage.MessageBody = {};
            wfMessage.MessageBody.ResourceMethod = '1';
            wfMessage.MessageBody.ResourceData = site.url;
            break;
        }
    }
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

    // Determine message
    if (wfMessage.MessageBody) {
        if (wfMessage.MessageBody.SubjectCode) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.SubjectCode}${referenceCode}`;
        if (wfMessage.MessageBody.CryptoDataType) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.CryptoDataType}${referenceCode}`;
        if (wfMessage.MessageBody.VerificationMethod) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.VerificationMethod}${referenceCode}`;
        if (wfMessage.MessageBody.ResourceMethod) return `${wfMessage.MessageHeader.MessageCode}${wfMessage.MessageBody.ResourceMethod}${referenceCode}`;
    }
    return `${wfMessage.MessageHeader.MessageCode}${referenceCode}`;
}
