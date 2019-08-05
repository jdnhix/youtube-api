const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;



// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtubepartner'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';


module.exports.auth = async () => {
    let oAuth = {}
    try {
        const clientSecret = await readClientSecretFile()
        oAuth = await authorize(JSON.parse(clientSecret))
    } catch(err) {
        console.log('Error reading client secret file', err)
    }
    return oAuth
}

const readClientSecretFile = async() => {
    return await new Promise( (resolve, reject) => {
        fs.readFile('client_secret.json', async(err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = async (credentials) => {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);


    const token = await new Promise( (resolve, reject) => {
        fs.readFile(TOKEN_PATH, async (err, token) => {
            if (err) {
                console.log('hitme')
                console.log(getNewToken(oauth2Client))
                resolve(getNewToken(oauth2Client))
            } else {
                resolve(token)
                oauth2Client.credentials = JSON.parse(token);

            }
        })
    })

    const test = await token
    console.log(test)

//    console.log(token)
//     const test = await token.then((t) => {
//         return t
//     })
//     console.log(test)


}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {OAuth2Client} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = async (oauth2Client) => {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            return oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                // oauth2Client.credentials = token;
                storeToken(token);
                return token;
            });
        });
    }
    catch {
        console.log('Error')
    }
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
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
    console.log('Token stored to ' + TOKEN_PATH);
}



// https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutubepartner&response_type=code&client_id=539368439937-r7mc8cvpfvi1k4jnd95eudlabtrman4i.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob




