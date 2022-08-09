

// 1. 指定不同版本的两个目录,遍历指定的子目录，指定类型文件（.js）,找到所有符合的文件及路径，放入数组中
// 2. 以最新版本为目标版本，比较两个版本的相同文件名的文件，取文件md5值比较，找出md5不同的文件，放入数组中（文件的路径和md5值），准备后续文件内容比较
// 3. 将上两步结果集合列出，认为选择文件比对，记录比对结果更新到对应版本对应文件中

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

//解析需要遍历的文件夹，我这以E盘根目录为例
// var oldFilePath = path.resolve('F:\\workspace\\引擎\\pc-server48\\Gis\\code\\github\\cesium1.93\\Source');
// var oldFilePath = path.resolve('F:\\workspace\\引擎\\pc-server48\\Gis\\code\\github\\diff-cesium\\cesium\\Source');
// var newFilePath = path.resolve('F:\\workspace\\引擎\\pc-server48\\Gis\\code\\github\\diff-cesium\\cesium1.95\\Source');

// localRootPath: 'G:/workspace/cesium/cesium',
// oldpath: 'cesium1.93/Source/',
// newpath: 'cesium1.95/Source/',

// var root =
//     'F:\\workspace\\引擎\\pc-server48\\Gis\\code\\cesium-source\\cesium-glendale-mixin\\libs'
// 'F:\\workspace\\引擎\\pc-server48\\Gis\\code\\cesium-source\\'

// var oldFilePath = path.resolve(path.join(root, 'cesium1.93-trunk\\Source'));
// var newFilePath = path.resolve(path.join(root, 'cesium1.93\\Source'));
// var filterFileTypes =
//     // 匹配则
//     // 前面带!表示排除
//     // *通配符表示匹配任意字符
//     [
//         // 精准匹配放在最前面    
//         'Workers\\\\cesiumWorkerBootstrapper.js',  // 从排除项中捡回两条
//         'Workers\\\\transferTypedArrayTest.js',

//         // 排除项写在前面
//         '!Cesium.js',
//         '!Cesium.d.ts',
//         '!Shaders\\\\.*.js',
//         '!ThirdParty',
//         '!Workers\\\\.*.js',
//         '!Assets',
//         '!.*.json',

//         // 匹配规则写后面
//         '.*.js', '.*.glsl', // 匹配 .js 和 .glsl 文件， 以下为排除项  
//     ]

function listFile(root, dir, filterFileTypes, map = new Map()) {
    var arr = fs.readdirSync(dir);
    arr.forEach(function (item) {
        var fullpath = path.join(dir, item);
        var stats = fs.statSync(fullpath);
        if (stats.isDirectory()) {
            listFile(root, fullpath, filterFileTypes, map);
        } else {
            if (filterFiles(fullpath, filterFileTypes)) {
                var fileMd5 = getFileMd5(fullpath);
                var key = fullpath.replace(root, '');
                map.set(key, {
                    relativePath: key,
                    path: fullpath,
                    md5: fileMd5.md5,
                    size: fileMd5.size,
                })
            }
        }
    });
    return map;
}

function filterFiles(filePath, filterFileTypes) {

    // v1.0
    // for (let index = 0; index < filterFileTypes.length; index++) {
    //     const _suffix = filterFileTypes[index];
    //     if (filePath.endsWith(_suffix)) return true;
    // }
    // return false;

    if (!filterFileTypes || filterFileTypes.length === 0) return true;

    var fullpath = filePath.replace('\\\\', '/');

    // v2.0
    var patternStr = '';
    let pattern;
    for (let index = 0; index < filterFileTypes.length; index++) {
        let _filter = filterFileTypes[index];
        if (_filter.startsWith('!')) { // 排除项
            patternStr = _filter.substring(1);

            // var weChatReg = '.*.js'
            // new RegExp(weChatReg)

            pattern = new RegExp(patternStr);
            if (pattern.test(fullpath)) {
                return false;
            }

        } else { // 有效项
            patternStr = _filter;

            // var weChatReg = '.*.js'
            // new RegExp(weChatReg)

            pattern = new RegExp(patternStr);
            if (pattern.test(fullpath)) {
                return true;
            }
        }
    }
    return true;
}

function getFileMd5(filePath) {
    //读取一个Buffer
    var buffer = fs.readFileSync(filePath);
    var fileSize = buffer.length;
    // console.log("文件大小：", buffer.length);  // 540 MB (566,847,148 字节)
    var fsHash = crypto.createHash('md5');
    fsHash.update(buffer);
    var md5 = fsHash.digest('hex');
    // console.log("文件的MD5是：%s", md5);
    return {
        md5: md5,
        size: fileSize
    };
}

function getDiffFiles(originalPath, modifiedPath, roles) {
    let filterFileTypes = [];
    if (roles) {
        //转换成数组
        filterFileTypes = roles.split(/[(\r\n)\r\n]+/);
        //删除空项
        filterFileTypes.forEach((item, index) => {
            if (!item) {
                filterFileTypes.splice(index, 1);
            }
        });
    }
    console.log(filterFileTypes)
    var originalFiles = listFile(originalPath, originalPath, filterFileTypes);
    var modifiedFiles = listFile(modifiedPath, modifiedPath, filterFileTypes);

    var list = [];
    for (let [key2, value2] of modifiedFiles.entries()) { // 遍历map

        if (originalFiles.has(key2)) {
            let value = originalFiles.get(key2);

            if (value.md5 != value2.md5) { // 有修改的文件
                list.push({
                    relativePath: key2,
                    old: value,
                    new: value2
                })
            }

            modifiedFiles.delete(key2)
            originalFiles.delete(key2)
        } else {
            // TODO 新增文件
            // console.log('ADD', key2)
            // res2.delete(key2)

            list.push({
                relativePath: key2,
                old: undefined,
                new: value2
            })
        }
    }

    if (originalFiles.size > 0) { // 旧目录还有未比对文件，则认为是删除的文件
        // TODO 已废弃文件
        // console.log('delete', res)
        for (let [key, value] of originalFiles.entries()) { // 遍历map
            list.push({
                relativePath: key,
                old: value,
                new: undefined
            })
        }
    }

    console.log(list.length);

    return list;
}



// // 字符串化JSON对象
// var jsonContent = JSON.stringify(list);
// // console.log(jsonContent);
// var resultJsonPath = "./public/datas/output.json";
// if (fs.existsSync(resultJsonPath)) {
//     fs.unlink(resultJsonPath, () => { });
// }
// fs.writeFile(resultJsonPath, jsonContent, 'utf8', function (err) {
//     if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//     }

//     console.log("JSON file has been saved.");
// });


// const testData = {
//     "guid": "6a6539eb-aaea-4364-8783-4047387ed6bb",
//     "title": "test1",
//     "originalDirectory": "G:\\testDir\\dir1",
//     "modifiedDirectory": "G:\\testDir\\dir2",
//     "rules": "",
//     "files": [],
//     "time": 1660010337386
// }

// getDiffFiles(testData.originalDirectory,testData.modifiedDirectory,testData.rules);

module.exports = { listFile, getFileMd5, getDiffFiles }

