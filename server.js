const express = require('express');
const ip = require('ip');

const port = process.env.API_PORT || 8080;
const host = 'localhost:'

const app = express()
const { auth } = require('./quickstart')
const { getChannelUploads } = require('./methods').methods
const { getVideos } = require('./methods').methods
const { getMetricsForVideo } = require('./methods').methods


require('./routes/channel').channel(app)



const server = app.listen(port, async () => {
    const host = ip.address()
    const { port } = server.address();
    console.log('Server Listening at http://%s:%s/api-docs', host, port);
})

module.exports = app;