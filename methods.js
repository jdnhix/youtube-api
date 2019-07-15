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

    getChannels(auth, id = '') {

        if (id) {
            var service = google.youtube('v3');
            service.channels.list({
                auth: auth,
                part: 'snippet, contentDetails',
                onBehalfOfContentOwner: contentOwnerId,
                id: id,
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
                    /*            channels.map(r => {
                                    console.log(r)
                                });*/
                    console.log(`First uploads playlist is ${channels[0].contentDetails.relatedPlaylists.uploads}`);
                    // getUploadsPlaylist(auth, channels[0].contentDetails.relatedPlaylists.uploads);
                }
            });
        } else {
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
                    /*            channels.map(r => {
                                    console.log(r)
                                });*/
                    console.log(`First uploads playlist is ${channels}`);
                    // getUploadsPlaylist(auth, channels[0].contentDetails.relatedPlaylists.uploads);
                }
            });

        }
    },

}

function getUploadsPlaylist(auth, playlistId) {
    var service = google.youtube('v3');
    service.playlistItems.list({
        auth: auth,
        part: 'contentDetails',
        onBehalfOfContentOwner: contentOwnerId,
        playlistId: playlistId,
        maxResults: 50
    }, function (err, response) {
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
    //todo make all paramaters variables
    var service = google.youtubeAnalytics('v2');
    const metrics = 'views,likes'
    const metricNames = metrics.split(',')
    service.reports.query({
        auth: auth,
        startDate: '2019-06-01',
        endDate: '2019-06-30',
        filters: 'video==' + videoId,
        ids: 'contentOwner==' + contentOwnerId,
        metrics: metrics
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var videoMetrics = response.data.rows[0];
        if (videoMetrics.length === 0) {
            console.log('No items found.');
        } else {
            videoMetrics.forEach(v => {
                console.log(`${metricNames[videoMetrics.indexOf(v)]}: ${v}`)
            });
        }
    });
}


