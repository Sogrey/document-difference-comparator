<template>

    <Row>
        <Col span="4">
        <div class="ivu-text-left" style="margin: 3px;">
            <Button @click="openDiffFileListDrawer = true" type="primary">Open Left Drawer</Button>
        </div>
        </Col>
        <Col span="20">
        <div class="ivu-text-right" style="margin: 3px;">
            <Space wrap style="margin-right: 3px;">
                <ButtonGroup>
                    <Button type="primary" v-on:click="previous">
                        <Icon type="ios-arrow-back" />
                        Previous
                    </Button>
                    <Button type="primary" v-on:click="next">
                        Next
                        <Icon type="ios-arrow-forward" />
                    </Button>
                </ButtonGroup>
            </Space>

            <Space wrap style="margin-right: 3px;">
                <ButtonGroup>
                    <Button type="primary" v-on:click="previousDiff">
                        <Icon type="ios-arrow-back" />
                        上一处差异
                    </Button>
                    <Button type="primary" v-on:click="nextDiff">
                        下一处差异
                        <Icon type="ios-arrow-forward" />
                    </Button>
                </ButtonGroup>
            </Space>

            <Space wrap style="margin-right: 3px;">
                <ButtonGroup>
                    <Button v-if="currentFile.length > 0 && true == diffFileMap.get(currentFile).isSolved"
                        type="success" v-on:click="solve" disabled>
                        <Icon type="md-checkmark" />
                        已解决
                    </Button>
                    <Button v-else type="success" v-on:click="solve">
                        <Icon type="md-checkmark" />
                        解决
                    </Button>
                    <Button type="warning" v-on:click="defer">
                        <Icon type="md-pause" />
                        推迟
                    </Button>
                    <!--   <Button type="error" v-on:click="bypassed">
                        <Icon type="md-close" />
                        不处理
                    </Button> -->
                    <Button v-if="!isAutoChecking" type="info" v-on:click="autoCheck">
                        <Icon type="md-clock" />
                        自动巡视
                    </Button>
                    <Button v-else type="dashed" disabled>
                        <Icon type="md-clock" />
                        正在自动巡视
                    </Button>
                    <Button type="error" v-on:click="outputData">
                        <Icon type="md-cloud-download" />
                        暂存数据
                    </Button>
                </ButtonGroup>
            </Space>
        </div>
        </Col>
    </Row>

    <Drawer title="Drawer Title" width="50%" placement="left" :closable="false" v-model="openDiffFileListDrawer">
        <ul v-if="diffFileMap.size > 0">
            <li v-for="(data, key) in diffFileMap" :key="key">
                <Row v-on:click="changeDiifFile(data[0])" style="height: 30px;line-height: 30px;margin-top: 2px;">
                    <Col v-if="diffFileMap.get(data[0]).isSolved" span="4" class="ivu-text-center"
                        style="background-color:#19be6b;">
                    Solved
                    </Col>
                    <Col v-else span="4" class="ivu-text-center" style="background-color: #ff9900;">
                    Pending
                    </Col>
                    <Col v-if="data[0] == currentFile" span="20" style="background-color: #19be6b;color:#fff;">
                    <div>
                        <Ellipsis :text="data[0]" :height="30" tooltip />
                    </div>
                    </Col>
                    <Col v-else span="20" style="background-color: #515a6e;color:#fff;">
                    <div>
                        <Ellipsis :text="data[0]" :height="30" tooltip />
                    </div>
                    </Col>
                </Row>
            </li>
        </ul>
    </Drawer>
    <div class="myEditor">
        <Row>
            <Col span="16">
            <div class="ivu-text-left" style="margin: 3px;">
                <div>
                    <Ellipsis :text="oldFullPath && newFullPath ? oldFullPath + ' <=>' + newFullPath : '↑ 打开左侧抽屉选择比对文件'"
                        tooltip />
                </div>
            </div>
            </Col>
            <Col span="4">
            <div class="ivu-text-right" style="margin: 3px;">
                <Space wrap style="margin-right: 3px;">
                    当前|总数: {{ currentFileIndex + 1 }}|{{ totalFileCount }}
                </Space>
            </div>
            </Col>
            <Col span="4">
            <div class="ivu-text-right" style="margin: 3px;">
                <Space wrap style="margin-right: 3px;">
                    本文件有{{ diffNum }}处差异
                </Space>
            </div>
            </Col>
        </Row>

        <div id="container" ref="container"></div>
    </div>
</template>

<script>
import * as monaco from 'monaco-editor'
const { ipcRenderer } = require('electron')
export default {
    data() {
        return {
            openDiffFileListDrawer: false,
            oldpath: '',
            newpath: '',
            recordFile: '',
            saveRecordFile: '',
            oldFullPath: '',
            newFullPath: '',
            diffFileList: [],
            diffFileMap: new Map(),
            diffFileMapKeyList: [],
            currentFile: '',
            currentFileIndex: -1,
            totalFileCount: NaN,
            isAutoChecking: false,

            themeOption: [
                {
                    value: 'vs',
                    label: '默认'
                },
                {
                    value: 'hc-black',
                    label: '高亮'
                },
                {
                    value: 'vs-dark',
                    label: '深色'
                }
            ],
            languageOption: [],
            theme: 'vs-dark',
            language: 'plaintext',
            // language: 'javascript',
            diffNum: 0,

            intervalIndex: -1,

            originalData: undefined,
            modifiedData: undefined,
        }
    },
    mounted() {
        const self = this
        self.initEditor()
        self.setModel()
        self.languageOption = monaco.languages.getLanguages()
        this.initIPCEvent();
        ipcRenderer.on('data', (e, arg) => {
            // console.log(arg)

            // self.showMessage('info', arg)

            // data:
            //     diffFilePath: "G:\\github\\my\\document-difference-comparator\\dist_electron/datas/6a6539eb-aaea-4364-8783-4047387ed6bb.json"
            //     files: []
            //     guid: "6a6539eb-aaea-4364-8783-4047387ed6bb"
            //     modifiedDirectory: "G:\\testDir\\dir2"
            //     originalDirectory: "G:\\testDir\\dir1"
            //     rules: ""
            //     time: 1660010337386
            //     title: "test1"

            self.oldpath = arg.data.originalDirectory
            self.newpath = arg.data.modifiedDirectory

            const files = arg.files;

            // this.recordFile = arg.data.diffFilePath;

            // self.axios.get(this.recordFile, {
            //     params: {
            //         time: new Date().getTime()
            //     }
            // }).then(res => {
            //     if (res.status === 200) {
            // self.diffFileList = res.data;

            // eslint-disable-next-line no-debugger
            // debugger;
            self.diffFileList = files;
            console.log(self.diffFileList)
            this.totalFileCount = self.diffFileList.length;
            for (let index = 0; index < self.diffFileList.length; index++) {
                const element = self.diffFileList[index];
                if (element.isSolved == undefined)
                    element.isSolved = false;
                self.diffFileMap.set(element.relativePath, element)
                self.diffFileMapKeyList.push(element.relativePath)
            }

            if (self.diffFileMapKeyList.length > 0)
                this.setModel(self.diffFileMapKeyList[0])
            //     }
            // }).catch(err => {
            //     console.log(err)
            // })

        });

    },
    methods: {
        initIPCEvent() {
            const self = this;
            // 这里是接收主进程传递过来的参数，这里的on要对应主进程send过来的名字
            ipcRenderer.on('asynchronous-save-file-result', function (event, msg) {
                // 这里的arg是从主线程请求的数据
                console.log("RESULT:", msg);

                self.showMessage('info', msg)
            });

            ipcRenderer.on('asynchronous-save-file-error', function (event, error) {
                // 这里的arg是从主线程请求的数据
                console.log("ERROR:", error);

                self.showMessage('error', error)
            });

            ipcRenderer.on('asynchronous-read-file-result', function (event, datas) {
                // 这里的arg是从主线程请求的数据
                console.log("RESULT:", datas);

                // self.showMessage('info', datas)

                if (datas) {
                    const type = datas.type;
                    // const filePath = datas.filePath;
                    const data = datas.data;

                    switch (type) {
                        case 'original':
                            self.originalData = data;
                            break;
                        case 'modified':
                            self.modifiedData = data;
                            break;

                        default:
                            break;
                    }
                    console.log("RESULT111:", self.originalData, self.modifiedData);
                    if (self.originalData != undefined && self.modifiedData != undefined) {
                        self.showDiff(self.originalData, self.modifiedData)
                    }
                }

            });

            ipcRenderer.on('asynchronous-read-file-error', function (event, error) {
                // 这里的arg是从主线程请求的数据
                console.log("ERROR:", error);

                /*{
                    data: '',
                    filePath: filePath,
                    type: type,
                    err: err.message
                }*/

                const type = error.type;
                // const filePath = error.filePath;
                const data = error.data;// 空内容
                const errorMsg = error.err

                switch (type) {
                    case 'original':
                        self.originalData = data; // 空内容
                        break;
                    case 'modified':
                        self.modifiedData = data;// 空内容
                        break;

                    default:
                        break;
                }

                if (self.originalData != undefined && self.modifiedData != undefined) {
                    self.showDiff(self.originalData, self.modifiedData)
                }

                self.showMessage('error', `File read failed: \n ${errorMsg}`)
            });
        },
        initEditor() {
            const self = this
            const domEditor = document.getElementById('container')

            self.monacoEditor = monaco.editor.createDiffEditor(domEditor, {
                theme: self.theme,
                readOnly: false,
                domReadOnly: false,
                originalEditable: true,
                automaticLayout: true
            })
            self.monacoEditor.onDidUpdateDiff(() => {
                self.diffNum = this.monacoEditor.getLineChanges().length
            })

            // 创建差异指南
            self.diffNavigator = monaco.editor.createDiffNavigator(this.monacoEditor, {
                alwaysRevealFirst: true
            })

            self.monacoEditor.addAction({
                id: 'previousDiff', // 菜单项 id
                label: '上一处差异', // 菜单项名称
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageUp], // 绑定快捷键，是 monacoEditor 自定义的对应关系
                contextMenuGroupId: 'navigation', // 所属菜单的分组
                run: () => {
                    // 上一处差异
                    self.diffNavigator.previous()
                }, // 点击后执行的操作
            })
            self.monacoEditor.addAction({
                id: 'nextDiff', // 菜单项 id
                label: '下一处差异', // 菜单项名称
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageDown], // 绑定快捷键
                contextMenuGroupId: 'navigation', // 所属菜单的分组
                run: () => {
                    // 下一处差异
                    self.diffNavigator.next()
                }, // 点击后执行的操作
            })
            // self.monacoEditor.addAction({
            //     id: 'useThisBlock', // 菜单项 id
            //     label: '使用此块', // 菜单项名称
            //     // keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.PageDown], // 绑定快捷键
            //     contextMenuGroupId: 'navigation', // 所属菜单的分组
            //     run: () => {
            //         // self.diffNavigator.dispose()
            //     }, // 点击后执行的操作
            // })

        },
        getFileContent(filePath) {
            return this.axios.get(filePath)
        },
        setModel(filePath) {
            let self = this;

            // console.log('setModel', filePath)
            if (!filePath) { // 展示一段测试
                // 测试

                self.originalData = `
            function myFunction() {
                alert("Hello World!");
            }`
                self.modifiedData = self.originalData;

                self.monacoEditor.setModel({
                    original: monaco.editor.createModel(self.originalData, self.language),
                    modified: monaco.editor.createModel(self.modifiedData, self.language)
                })
                return
            }
            // 'http://localhost:10012/cesium/Source/Scene/processPbrMaterials.js';
            // let baseUrl = 'http://localhost:10012/'
            // let originalRootPath = 'cesium/'
            // let modifiedRootPath = 'cesium1.95/'
            // let filePath = '/Source/Scene/processPbrMaterials.js'; // 传入参数

            // data:
            //     diffFilePath: "G:\\github\\my\\document-difference-comparator\\dist_electron/datas/6a6539eb-aaea-4364-8783-4047387ed6bb.json"
            //     files: []
            //     guid: "6a6539eb-aaea-4364-8783-4047387ed6bb"
            //     modifiedDirectory: "G:\\testDir\\dir2"
            //     originalDirectory: "G:\\testDir\\dir1"
            //     rules: ""
            //     time: 1660010337386
            //     title: "test1"

            let originalRootPath = self.oldpath
            let modifiedRootPath = self.newpath
            self.currentFile = filePath;

            self.currentFileIndex = self.diffFileMapKeyList.indexOf(self.currentFile);

            self.oldFullPath = self.oldpath + self.currentFile;
            self.newFullPath = self.newpath + self.currentFile;

            self.originalData = undefined
            self.modifiedData = undefined

            ipcRenderer.send('asynchronous-read-file', { filePath: originalRootPath + filePath, type: 'original' });
            ipcRenderer.send('asynchronous-read-file', { filePath: modifiedRootPath + filePath, type: 'modified' });

            // this.getFileContent(baseUrl + originalRootPath + filePath).then(result => {
            //     originalData = result.data;
            //     if (originalData != undefined && modifiedData != undefined)
            //         self.showDiff(originalData, modifiedData)
            // }).catch(err => {
            //     console.log(err)
            //     originalData = "";
            //     if (originalData != undefined && modifiedData != undefined)
            //         self.showDiff(originalData, modifiedData)
            // })

            // this.getFileContent(baseUrl + modifiedRootPath + filePath).then(result => {
            //     modifiedData = result.data;
            //     if (originalData != undefined && modifiedData != undefined)
            //         self.showDiff(originalData, modifiedData)
            // }).catch(err => {
            //     console.log(err)
            //     modifiedData = "";
            //     if (originalData != undefined && modifiedData != undefined)
            //         self.showDiff(originalData, modifiedData)
            // })
        },
        showDiff(originalData, modifiedData) {
            originalData = this.setDefaultValue(originalData, '')
            modifiedData = this.setDefaultValue(modifiedData, '')

            this.monacoEditor.setModel({
                original: monaco.editor.createModel(originalData, this.language),
                modified: monaco.editor.createModel(modifiedData, this.language)
            })
        },
        changeDiifFile(fileRelativePath) {
            this.openDiffFileListDrawer = false
            this.currentFile = fileRelativePath;
            this.setModel(fileRelativePath)

        },
        setDefaultValue(variable, defaultValue) {
            if (variable == undefined || variable == null) {
                return defaultValue
            }
            return variable
        },
        // 上一处差异
        previousDiff() { this.diffNavigator.previous() },
        // 下一处差异
        nextDiff() { this.diffNavigator.next() },
        // 上一页
        previous() {
            let currentIndex = this.diffFileMapKeyList.indexOf(this.currentFile);
            if (currentIndex > 0) {
                this.currentFile = this.diffFileMapKeyList[--currentIndex];
                this.openDiffFileListDrawer = false;
                this.setModel(this.currentFile)
            } else {
                this.isAutoChecking = false;

                this.showMessage('info', '第一个了，有更多了。')
            }
        },
        // 下一页
        next() {
            let currentIndex = this.diffFileMapKeyList.indexOf(this.currentFile);
            if (currentIndex > -1 && currentIndex < this.diffFileMapKeyList.length - 1) {
                this.currentFile = this.diffFileMapKeyList[++currentIndex];
                this.openDiffFileListDrawer = false;
                this.setModel(this.currentFile)
            } else {
                this.isAutoChecking = false;
                if (this.intervalIndex > -1) {
                    clearInterval(this.intervalIndex);
                    this.intervalIndex = -1

                    this.outputData();
                    this.isAutoChecking = false;
                    this.showMessage('success', '自动巡视完成，数据已导出。')
                } else {
                    this.showMessage('info', '最后一个了，有更多了。')
                }
            }
        },
        // 解决
        solve() {
            this.diffFileMap.get(this.currentFile).isSolved = true

            // 获取modifiedData写入对应文件
            var editor = this.monacoEditor.getModifiedEditor();
            if (editor) {

                let modifiedRootPath = this.newpath
                let filePath = this.currentFile;

                if (this.modifiedData != editor.getValue()) {
                    this.save(modifiedRootPath + filePath, editor.getValue())
                } else {
                    this.showMessage('info', '成功解决，没有修改。')
                }

            }

        },
        save(filePath, data) {
            ipcRenderer.send('asynchronous-save-file', {
                filePath: filePath,
                data: data
            });
        },
        // 推迟，暂缓
        defer() {
            this.diffFileMap.get(this.currentFile).isSolved = false
        },
        // 不处理
        bypassed() {
            alert("不处理");
        },
        // 自动巡视
        autoCheck() {
            this.isAutoChecking = true;
            this.intervalIndex = setInterval(() => {
                if (this.diffNum == 0) {
                    this.solve();
                }
                this.next();
            }, 500);
        },
        outputData() {
            // console.log(this.diffFileMap)
            var allData = [];
            var solvedList = [];
            var deferList = [];
            if (this.diffFileMap.size > 0) {
                this.diffFileMap.forEach(function (value) {
                    allData.push(value)
                    if (value.isSolved) {
                        solvedList.push(value);
                    } else {
                        deferList.push(value);
                    }
                });
            }

            var allDataJson = JSON.stringify(allData)
            ipcRenderer.send('asynchronous-save-record-file', {
                filePath: this.saveRecordFile,
                data: allDataJson
            });

            // console.log(solvedList, deferList)

            var solvedListJson = JSON.stringify(solvedList)
            var deferListJson = JSON.stringify(deferList)

            // console.log(solvedListJson, deferListJson)

            this.downloadData('solvedListJson.json', solvedListJson)
            this.downloadData('deferListJson.json', deferListJson)
        },

        downloadData(fileName, txt) {
            function fake_click(obj) {
                var ev = document.createEvent("MouseEvents");
                ev.initMouseEvent(
                    "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
                );
                obj.dispatchEvent(ev);
            }

            function download(name, data) {
                var urlObject = window.URL || window.webkitURL || window;

                var downloadData = new Blob([data]);

                var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
                save_link.href = urlObject.createObjectURL(downloadData);
                save_link.download = name;
                fake_click(save_link);
            }
            //调用方法
            download(fileName, txt);
        },
        /**
         * 
         * @param {*} type 可选值：info 显示普通提示; success 显示成功提示; warning 显示警告提示; error 显示错误提示;
         * @param {*} message 
         */
        showMessage: function (type, message) {
            if (typeof message == 'string') {
                this.$Message[type]({
                    background: true,
                    content: message
                });
            }
        },
    }
}
</script>

<style>
html,
body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    color: #2c3e50;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-y: hidden;
}


.myEditor {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
}

.ivu-drawer-body {
    padding: 0 !important;
    margin: 0 !important;
}

#container {
    width: 100%;
    height: calc(100vh - 64px);
    text-align: left;
}

ul {
    list-style: none;
    padding: 0px;
    margin: 0px;
}

ul,
li {
    width: 100%;
    height: auto;
}

ul li {
    margin-top: 1px;
}

.ivu-ellipsis {
    /*这里要显示的设置宽度*/
    overflow: hidden;
    white-space: nowrap;
    /*文字超出宽度则显示ellipsis省略号*/
    text-overflow: ellipsis;
    width: 100%;
}
</style>
