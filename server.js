const express = require('express');
const ip = require('ip');
const swagger = require('swagger-ui-express')
const swaggerDoc = require('swagger-jsdoc')

const port = process.env.API_PORT || 8080;
const host = 'localhost:'

const app = express()

const swaggerDefinition = {
    info: {
        title: 'CCMG Youtube Data & Analytics API',
        version: '1.0.0',
        description: 'Youtube API data that we care about',
    },
    host: `localhost:${port}`,
    basePath: '/',
}

const options = {
    // Import swaggerDefinitions
    swaggerDefinition,
    explorer: true,
    jsonEditor: true,
    // Path to the API docs
    // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerDoc(options)


app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api-docs', swagger.serve, swagger.setup(swaggerSpec))



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