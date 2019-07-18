const {auth} = require('../quickstart')
const {getChannelUploads} = require('../methods').methods
const {getVideos} = require('../methods').methods
const {getMetricsForVideo} = require('../methods').methods


module.exports.channel = (app) => {

    //returns metrics for all videos of a particular channel, or all channels
    app.get('/channel', async (req, res) => {

        //set query params that might change here
        const channelIds = ['UCU7r9g_Abk8cZEXxgBNIZCA', 'UCJn8dUXIe0KTEaTpZzegazQ']
        const options = {
            startDate: '2019-06-01',
            endDate: '2019-06-30',
            metrics: 'views,redViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,comments,' +
                'likes,dislikes,shares,subscribersGained,subscribersLost,videosAddedToPlaylists,videosRemovedFromPlaylists,' +
                'annotationClickThroughRate,annotationCloseRate,cardImpressions,cardClicks,cardClickRate,cardTeaserImpressions,' +
                'cardTeaserClicks,cardTeaserClickRate',
        }

        const oauth = await auth()
        const playlistIds = await getChannelUploads(oauth, channelIds)


        // const videoIds = await new Promise((resolve, reject) => {
        //     const ids = []
        //     playlistIds.map(async id => {
        //         ids.push(await getVideos(oauth, id))
        //         if(ids.length === playlistIds.length){
        //             resolve(ids)
        //         }
        //     })
        // })


        return playlistIds.map(async id => {
            const videos = await getVideos(oauth, id)
            console.log(videos.map(vidId => {
                // console.log(await getMetricsForVideo(oauth, vidId, options))
                return getMetricsForVideo(oauth, vidId, options)
            }))
        })


        // const videoMetrics = await getMetricsForVideo(oauth, videoIds[0], options)

        // res.send(JSON.stringify(videoMetrics, undefined, 2))
    })

}