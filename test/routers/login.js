'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {

    const { router, controller, middleware } = app;
    const { auth } = controller;
    const userRequired = middleware.userRequired();
    const userAdmin = middleware.userAdmin();

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: 通用登录
     *     description: 通用登录，向后扩展，目前只支持微信登录和后台管理员登录
     *     operationId: authLogin
     *     tags:
     *       - Auth
     *     parameters:
     *       - name: Login
     *         in: body
     *         schema:
     *           $ref: "#/definitions/login"
     *     responses:
     *       200:
     *         description: ok
     *         schema:
     *           $ref: "#/definitions/loginResp"
     */
    router.post('/api/auth/login', auth.login);
};
