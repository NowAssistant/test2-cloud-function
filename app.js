'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const decache = require('decache');
const logger = require('@adenin/cf-logger');

const app = new Koa();

const PORT = 4000;

let routes = require('./index');

app.use(bodyParser())
    .use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = {
                error: err.message
            };

            ctx.app.emit('error', err, ctx);
        }
    })
    .use(async (ctx) => {
        if (process.env.NODE_ENV === 'development') {
            logger.debug('Decaching...');

            decache('./index');
            routes = require('./index');
        }

        const service = ctx.url.split('/')[1];

        if (routes[service]) {
            await routes[service](ctx);
        } else {
            ctx.status = 404;
            ctx.body = {
                error: 'Route not found',
                routes: Object.keys(routes)
            };
        }
    })
    .on('error', (err) => {
        logger.error(err);
    })
    .listen(PORT);

logger.info('Server running on port ' + PORT);
