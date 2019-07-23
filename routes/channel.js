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
        let channelInfo = await getChannelUploads(oauth)


        async function fetchAllMetrics(channels) {
            const promises = channels.map(async channel => {
                const updatedChannel = await getVideos(oauth, channel)
                updatedChannel.videos = await resolveVideoMetrics(updatedChannel)
                return await updatedChannel
            })
            return await Promise.all(promises)
        }


        async function resolveVideoMetrics(channel){
            return await Promise.all(
                await channel.videos.map(async video => {
                    return await getMetricsForVideo(oauth, video, options)

                })
            )
        }




        const out = await fetchAllMetrics(await channelInfo)


        // const videoMetrics = await getMetricsForVideo(oauth, videoIds[0], options)
        res.send(JSON.stringify({out}))
        // res.send(out)
    })

}


