const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const viewsRouter = require('./routes/viewsRoutes');

const scannerVolumeRouter = require('./routes/scannerVolumeRoutes');
const scannerVolumeDataRouter = require('./routes/scannerVolumeDataRoutes');

const segmentationVolumeRouter = require('./routes/segmentationVolumeRoutes');
const segmentationVolumeDataRouter = require('./routes/segmentationVolumeDataRoutes');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.raw({limit: '100mb', extended: true, type: "application/octet-stream"}));
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log('Middleware...');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// ROUTES
app.use('/', viewsRouter);
app.use('/scannervolume', scannerVolumeRouter);
app.use('/scannervolumedata', scannerVolumeDataRouter);
app.use('/segmentationvolume', segmentationVolumeRouter);
app.use('/segmentationvolumedata', segmentationVolumeDataRouter);

module.exports = app;
