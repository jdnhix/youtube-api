const {auth} = require('../quickstart')
const {getChannelUploads} = require('../methods').methods
const {getVideos} = require('../methods').methods
const {getMetricsForVideo} = require('../methods').methods


module.exports.channel = (app) => {


    /**
     * @swagger
     * /channel:
     *   get:
     *     tags:
     *       - Channel
     *     name: Channel
     *     operationId: channel
     *     summary: retrieves metrics for all of a channel's videos
     *     parameters:
     *      - in: query
     *        name: channelIds
     *        schema:
     *          type: array
     *          items:
     *              type: string
     *        description: array of channel ids
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     responses:
     *       '200':
     *         description: A single test object
     *       '401':
     *         description: No auth token / no user found in db with that name
     *       '403':
     *         description: JWT token and username from client don't match
     */

    //returns metrics for all videos of a particular channel, or all channels
    app.get('/channel', async (req, res, err) => {

        res.set({
            'Content-Type': 'application/json',
        })

        //set query params that might change here
        const  channelIds = req.query.channelIds || null
        const options = {
            startDate: '2019-06-01',
            endDate: '2019-06-30',
            metrics: 'views,redViews,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,comments,' +
                'likes,dislikes,shares,subscribersGained,subscribersLost,videosAddedToPlaylists,videosRemovedFromPlaylists,' +
                'annotationClickThroughRate,annotationCloseRate,cardImpressions,cardClicks,cardClickRate,cardTeaserImpressions,' +
                'cardTeaserClicks,cardTeaserClickRate',
        }

        const oauth = await auth()
        let channels = await getChannelUploads(oauth, channelIds)


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


        const result = await fetchAllMetrics(await channels)
        console.log(result)
        // if(err){
        //     res.end(err)
        // }
        res.end(JSON.stringify(result))
    })

}


