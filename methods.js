var {google} = require('googleapis');

var contentOwnerId = '1BPD_EtLBg7l1adJDNMc8A';
var tommeeProfitChannel = 'UC4e7J19VFdz05QPtdHnuLbQ';
var sampleUploadsPlaylist = 'UU4e7J19VFdz05QPtdHnuLbQ';
var sampleVideoId = 'PDboeQfAsww';

//todo so i need to make so that:
//i can either get one or all channel id's
//save the result of that to a var
// set up 'getuploadsplaylist' so that i eitehr pass in an channel id or nothing and it gets all
// pass in the var of channel id and save the res of that call
//pass that var int get metrics, which is set up the same way

module.exports.methods = {


    //returns the upload playlist id for all channels owned by the content owner.
    // If a channel id is passed in, it will return the upload playlist id of that specific channel
    async getChannelUploads(auth, channelIds = '') {
        const playlistIds = []
        if (channelIds) {
            return (await new Promise((resolve, reject) => {
                    var service = google.youtube('v3');
                    service.channels.list({
                        auth: auth,
                        part: 'snippet, contentDetails',
                        onBehalfOfContentOwner: contentOwnerId,
                        managedByMe: true,
                        maxResults: 0
                    }, function (err, response) {
                        if (err) {
                            console.log('The API returned an error: ' + err);
                            return;
                        }
                        var channels = response.data.items;
                        if (channels.length === 0) {
                            console.log('No channel found.');
                        } else {
                            channels.forEach(channel => {
                                if (channelIds.includes(channel.id))
                                    playlistIds.push(channel.contentDetails.relatedPlaylists.uploads)
                            })
                            resolve(playlistIds)
                        }
                    });
                }
            ))
        } else {
            return (await new Promise((resolve, reject) => {
                var service = google.youtube('v3');
                service.channels.list({
                    auth: auth,
                    part: 'snippet, contentDetails',
                    onBehalfOfContentOwner: contentOwnerId,
                    managedByMe: true,
                    maxResults: 0
                }, function (err, response) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        return;
                    }
                    var channels = response.data.items;
                    if (channels.length === 0) {
                        console.log('No channel found.');
                    } else {
                        channels.forEach(channel => {
                            playlistIds.push(channel.contentDetails.relatedPlaylists.uploads)
                        })
                        resolve(playlistIds)
                    }
                });
            }))
        }

    },

//todo have these functions take care of one, map on the outside
    async getVideos(auth, playlistId) {
        return (await new Promise((resolve, reject) => {
            let videoIds = []
            const service = google.youtube('v3');
            service.playlistItems.list({
                auth: auth,
                part: 'snippet, contentDetails',
                onBehalfOfContentOwner: contentOwnerId,
                playlistId: playlistId,
                maxResults: 50
            }, function (err, response) {
                if (response.data) {
                    const listItems = response.data.items
                    listItems.map(item => {
                        videoIds.push(item.contentDetails.videoId)
                    });
                    resolve(videoIds)
                }
            });
        }))
    },

    async getMetricsForVideo(auth, videoId, options) {
        var service = google.youtubeAnalytics('v2');
        const {metrics} = options
        const metricNames = metrics.split(',')
        const {startDate} = options
        const {endDate} = options
        const filters = 'video==' + videoId
        const ids = 'contentOwner==' + contentOwnerId

        return (await new Promise((resolve, reject) => {
            service.reports.query({
                auth,
                startDate,
                endDate,
                filters,
                ids,
                metrics
            }, function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var videoMetrics = response.data.rows[0];
                if (videoMetrics.length === 0) {
                    console.log('No items found.');
                } else {
                    let index = 0
                    const metricValues = {}
                    videoMetrics.forEach(v => {
                        metricValues[`${metricNames[index]}`] = v
                        ++index
                    });
                    resolve(metricValues)
                }
            });
        }))
    }


}

