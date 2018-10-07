
/*
    API specifications.
 */
const http = require('http');
const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const config = require('./config');
const swagger = require('./lib/swagger');

const swaggerDocs = swagger.getSwaggerDocs({
    title: config.title,
    version: config.version,
    description: config.description,
    docBasePath: config.docBasePath
});

app.use(serve('swagger-ui'));

//这个path不能修改，swagger首页会访问这个path
router.get('/swagger-doc', async (ctx, next) => {
    ctx.body = swaggerDocs;
});
app.use(router.routes());


http.createServer(app.callback()).listen(config.port);
console.log(`Start server, listening on port ${config.port}`);
