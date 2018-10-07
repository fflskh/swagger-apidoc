
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

/**
 * 获取swagger docs
 * @param config
 *  - title, web应用标题, required
 *  - version, web应用版本, optional
 *  - description, 描述, optional
 *  - docBasePath, 文档的基本路径, required
 * @returns {*|Object}
 */
exports.getSwaggerDocs = config => {
    const options = {
        definition: {
            info: {
                title: config.title, // Title (required)
                version: config.version || '1.0.0', // Version (required)
                description: config.description || 'Specification of web APIs', // Description (optional)
            },
        },
        // Path to the API docs
        apis: [path.join(config.docBasePath, '/**/*.js')],
    };

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    return swaggerJSDoc(options);
};