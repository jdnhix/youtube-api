var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var contentOwnerId = '1BPD_EtLBg7l1adJDNMc8A';
var tommeeProfitChannel = 'UC4e7J19VFdz05QPtdHnuLbQ';
var sampleUploadsPlaylist = 'UU4e7J19VFdz05QPtdHnuLbQ';
var sampleVideoId = 'PDboeQfAsww';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtubepartner'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), getChannels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Will return all the channels associated with our Content Owner Id.
 * From what's returned we need to capture the id for the uploads playlist so that we
 * can get all the video ids for the channel.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function getChannels(auth) {
    var service = google.youtube('v3');
    service.channels.list({
        auth: auth,
        part: 'snippet, contentDetails',
        onBehalfOfContentOwner: contentOwnerId,
        managedByMe: true,
        maxResults: 0
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var channels = response.data.items;
        if (channels.length == 0) {
            console.log('No channel found.');
        } else {
/*            channels.map(r => {
                console.log(r)
            });*/
            console.log(`First uploads playlist is ${channels[0].contentDetails.relatedPlaylists.uploads}`);
            getUploadsPlaylist(auth, channels[0].contentDetails.relatedPlaylists.uploads);
        }
    });
}

function getUploadsPlaylist(auth, playlistId) {
    var service = google.youtube('v3');
    service.playlistItems.list({
        auth: auth,
        part: 'contentDetails',
        onBehalfOfContentOwner: contentOwnerId,
        playlistId: playlistId,
        maxResults: 50
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var listItems = response.data.items;
        if (listItems.length == 0) {
            console.log('No items found.');
        } else {
/*            listItems.map(v => {
                console.log(v)
            });*/
            console.log(`First uploads playlist is ${listItems[0].contentDetails.videoId}`);
            getMetricsForVideo(auth, listItems[0].contentDetails.videoId);
        }
    });
}

function getMetricsForVideo(auth, videoId) {
    var service = google.youtubeAnalytics('v2');
    service.reports.query({
        auth: auth,
        startDate: '2019-06-01',
        endDate: '2019-06-30',
        filters: 'video==' + videoId,
        ids: 'contentOwner==' + contentOwnerId,
        metrics: 'views,likes'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var videoMetrics = response.data.rows;
        if (videoMetrics.length == 0) {
            console.log('No items found.');
        } else {
            videoMetrics.map(v => {
                console.log(v)
            });
        }
    });
}

// https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutubepartner&response_type=code&client_id=539368439937-r7mc8cvpfvi1k4jnd95eudlabtrman4i.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob




