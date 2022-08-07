const fs = require('fs')
// const path = require('path')

// 读取文件方法
function readFile(options) {
    return new Promise((resolve, reject) => {

        // filePath:它保存要读取的文件名或完整路径(如果存储在其他位置)。
        // encoding:它保存文件的编码。默认值为“ utf8”。
        // callback_function:这是在读取文件后调用的回调函数。它带有两个参数：
        //      err:如果发生任何错误。
        //      data:文件内容。
        // 返回值：它返回存储在文件中的内容/数据或错误(如果有)。

        const filePath = options.filePath
        // const encoding = options.encoding
        const type = options.type


        fs.readFile(filePath, { flag: 'r', encoding: 'utf-8' }, (err, data) => {
            if (err) {
                // console.log(`File read failed:${filePath} \n ${err.message}`);
                reject({
                    data: '',
                    filePath: filePath,
                    type: type,
                    err: err.message
                });
            }
            // console.log(`File read successfully:${filePath}`);
            resolve({
                data: data,
                filePath: filePath,
                type: type,
            });
        });
    })
}

// 写文件方法
function writeFile(filePath, data) {
    return new Promise((resolve, reject) => {

        // 通过 writeFile 方法写入文件
        //   参数1：文件路径
        //   参数2：写入文件的数据
        //   参数3：回调函数（err：失败原因） 

        fs.writeFile(filePath, data, {
            encoding: "utf-8",
            flag: "w",
            mode: 0o666
        }, (err) => {
            if (err) {
                // console.log(`File written failed:${filePath} \n ${err.message}`);
                reject('File written failed:' + err.message);
            }
            // console.log(`File written successfully:${filePath}`);
            resolve('File written successfully!');
        });
    })
}


module.exports = { readFile, writeFile }