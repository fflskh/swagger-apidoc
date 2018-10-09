
const path = require('path');
const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');
const YAML = require('yamljs')

// making tags
function firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

function getDefinitionsByPath (jsonFilePath) {
    let files = fs.readdirSync(jsonFilePath);
    let newObj = {};
    for (let item of files) {
        try {
            // console.info(item);
            let fileNameArray = item.split(".");
            let fileName = fileNameArray[0];
            let fileType = fileNameArray[fileNameArray.length-1];
            if (fileType === "json") {
                // console.log('item path of json: ', path.resolve(jsonFilePath, item));
                newObj[fileName] = require(path.resolve(jsonFilePath, item));
            } else if(fileType === "yml" || fileType === "yaml") {
                newObj[fileName] = YAML.parse(fs.readFileSync(path.resolve(jsonFilePath, item), 'utf8'));
            } else if (fileType === "js") {
                // console.log('item path of js: ', path.resolve(jsonFilePath, item));
                let obj = require(path.resolve(jsonFilePath, item));
                let fullObj;
                if(Array.isArray(obj)){
                    // 数组格式
                    fullObj = {
                        "type": "array",
                        "items": {}
                    };

                    // 判断数组中元素类型
                    if(!isNaN(obj[0])){
                        fullObj["items"]["type"] = "number";
                    } else if (typeof obj[0] === "boolean"){
                        fullObj["items"]["type"] = "boolean";
                    } if(typeof obj[0] === "object"){
                        fullObj["items"]["type"] = "object";
                    } else {
                        fullObj["items"]["type"] = "string";
                    }

                    fullObj["example"] = obj;
                } else {
                    // 对象格式
                    fullObj = {
                        "type": "object",
                        "properties": {}
                    };

                    // 遍历判断对象中所有属性的元素
                    for(let key in obj){
                        let arr;
                        if(typeof obj[key] === "string"){
                            arr = obj[key].split("|");
                            for(let i=0; i<arr.length; i++){
                                arr[i] = arr[i].trim()
                            }
                        } else if(typeof obj[key] === "number") {
                            arr = [obj[key]];
                        } else {
                            arr = [obj[key]];
                        }
                        let keyObj = {};
                        if(arr[0] === "string" || arr[0] === "number" || arr[0] === "boolean" || arr[0] === "object"){
                            keyObj["type"] = arr[0];
                        } else {
                            if (!isNaN(arr[0])){
                                keyObj["type"] = "integer";
                                keyObj["format"] = "int64";
                            } else if (typeof arr[0] === "boolean"){
                                keyObj["type"] = "boolean";
                            } else if (typeof arr[0] === "object"){
                                if(Array.isArray(arr[0])){
                                    keyObj["type"] = "array";
                                } else {
                                    keyObj["type"] = "object";
                                }
                            } else {
                                keyObj["type"] = "string";
                            }
                            if(!isNaN(arr[0])) {
                                keyObj["example"] = Number(arr[0]);
                            } else {
                                keyObj["example"] = arr[0];
                            }
                        }
                        if(arr.length>1){
                            keyObj["description"] = arr[1];
                        }
                        fullObj["properties"][key] = keyObj;
                    }
                }
                newObj[fileName] = fullObj;
            }
        } catch (error) {
            console.warn("读取文件%s时发生错误", item);
            console.error(error);
        }
    }

    return newObj;
}

function getTags (docSourcePath) {
    let routersFiles = fs.readdirSync(docSourcePath);
    let tags = [];

    for (let item of routersFiles) {
        let stat = fs.statSync(path.join(docSourcePath, item));
        if(stat.isDirectory()) {
            if(/^route/.test(item) ||
                /^v\d+$/.test(item) ||
                ['get','post','put','head','delete'].indexOf(item.toLowerCase()) !== -1
            ) {
                continue;
            }
            tags.push({
                name: firstUpperCase(item),
                description: firstUpperCase(item)
            });
            tags = tags.concat(getTags(path.join(docSourcePath, item)));
        }
    }

    return tags;
}

/**
 * 获取swagger docs
 * @param options
 *  - title, web应用标题, required
 *  - version, web应用版本, optional
 *  - description, 描述, optional
 *  - docBasePath, 文档的基本路径, required
 * @returns {*|Object}
 */
exports.getSwaggerDocs = options => {
    const swaggerOptions = {
        definition: {
            info: {
                title: options.title, // Title (required)
                version: options.version || '1.0.0', // Version (required)
                description: options.description || 'Specification of web APIs', // Description (optional)
            },
            tags: getTags(options.docBasePath),
            definitions: getDefinitionsByPath(options.definitionPath)
        },
        // Path to the API docs
        apis: [path.join(options.docBasePath, '/**/*.js')],
    };

    console.log('swaggerOptions: ', require('util').inspect(swaggerOptions, {depth: null}));

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    return swaggerJSDoc(swaggerOptions);
};