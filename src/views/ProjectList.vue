<template>
    <!-- 最外层的大盒子 -->
    <div class="bigBox">
        <div class="box">
            <!-- 滑动盒子 -->
            <div class="pre-box">
                <!-- <div class="window-bar">
                    <Tooltip content="关闭" placement="bottom-start">
                        <Icon type="md-close-circle" size="20" color='#992222' @click="clickedBtn('close')" />
                    </Tooltip>
                    <Tooltip content="最小化" placement="bottom">
                        <Icon type="md-arrow-dropdown-circle" size="20" color='#229922'
                            @click="clickedBtn('minimize')" />
                    </Tooltip>
                    <Tooltip content="发现BUG" placement="bottom">
                        <Icon type="ios-bug" size="20" color='#999922' @click="clickedBtn('report-bug')" />
                    </Tooltip>
                </div> -->

                <CustomTabItem />

                <div class="layout-create-content pre-box-form" v-if="currentIndex == 0">
                    <div class="layout-create-content-title">
                        <span>请选择两个要比对的文件</span>
                    </div>
                    <Form :model="formItemFile" :label-width="80">
                        <FormItem label="标题">
                            <Input v-model="formItemFile.title" placeholder="【可选】填写标题描述，回查时一目了然" size="large">
                            </Input>
                        </FormItem>
                        <FormItem label="原始文件">
                            <Input v-model="formItemFile.originalFile" placeholder="请选择文件..." size="large"
                                @click="selectFile(0)">
                            <template #suffix>
                                <Icon type="md-document" />
                            </template>
                            </Input>
                        </FormItem>
                        <FormItem label="目标文件">
                            <Input v-model="formItemFile.modifiedFile" placeholder="请选择文件..." size="large"
                                @click="selectFile(1)">
                            <template #suffix>
                                <Icon type="md-document" />
                            </template>
                            </Input>
                        </FormItem>
                    </Form>
                </div>
                <div class="layout-create-content pre-box-form" v-if="currentIndex == 1">
                    <div class="layout-create-content-title">
                        <span>请选择两个要比对的目录</span>
                    </div>
                    <Form :model="formItemDirectory" :label-width="80">
                        <FormItem label="标题">
                            <Input v-model="formItemDirectory.title" placeholder="【可选】填写标题描述，回查时一目了然" size="large">
                            </Input>
                        </FormItem>
                        <FormItem label="原始目录">
                            <Input v-model="formItemDirectory.originalDirectory" placeholder="请选择文件目录..." size="large"
                                @click="selectDirectory(0)">
                            <template #suffix>
                                <Icon type="md-folder" />
                            </template>
                            </Input>
                        </FormItem>
                        <FormItem label="目标目录">
                            <Input v-model="formItemDirectory.modifiedDirectory" placeholder="请选择文件目录..." size="large"
                                @click="selectDirectory(1)">
                            <template #suffix>
                                <Icon type="md-folder" />
                            </template>
                            </Input>
                        </FormItem>
                        <FormItem label="添加规则">
                            <Input v-model="formItemDirectory.rules" type="textarea" :rows="3"
                                placeholder="请输入匹配规则..." />
                        </FormItem>
                    </Form>
                </div>

                <div>
                    <Button @click="startComparator()" class="btn-comparator" :size="buttonSize"
                        v-bind:class="{ miniMargin: currentIndex === 1 }" type="primary">开始比对</Button>
                    <!-- <Button @click="createNewWindow" class="btn-comparator" :size="buttonSize"
                        v-bind:class="{ miniMargin: currentIndex === 1 }" type="primary">打开新窗口</Button> -->
                </div>

                <Footer class="layout-footer">
                    <GlobalFooter :links="links" :copyright="copyright" />
                </Footer>

            </div>
            <!-- 目录比对 -->
            <div class="directory-comparison-box">
                <div class="comparison-box-title">
                    <h1>目录比对</h1>
                    <div>Recent Workspaces</div>
                </div>
                <div v-if="directoryComparisonData.length > 0" class="comparison-box-content">
                    <Space direction="vertical" type="flex" size="small">
                        <div v-for="item in directoryComparisonData" v-bind:key="item">
                            <Card @click="startComparator(1, item)">
                                <template #title>{{ item.title.length > 0 ? item.title : '无标题' }}</template>
                                <p>
                                    <Icon type="md-folder" />
                                    <Ellipsis :text="item.originalDirectory" :lines="1" :length='55' tooltip
                                        class="inline-block" />
                                </p>
                                <p>
                                    <Icon type="md-folder" />
                                    <Ellipsis :text="item.modifiedDirectory" :lines="1" :length='55' tooltip
                                        class="inline-block" />
                                </p>
                            </Card>
                        </div>
                    </Space>
                </div>
                <div v-if="directoryComparisonData.length == 0" class="empty-data-list">
                    暂无工程,可在右边表单创建一个工程。==&gt;
                </div>
            </div>
            <!-- 单文件比对 -->
            <div class="file-comparison-box">
                <div class="comparison-box-title">
                    <h1>文件比对</h1>
                    <div>Recent Workspaces</div>
                </div>
                <div v-if="fileComparisonData.length > 0" class="comparison-box-content">
                    <Space direction="vertical" type="flex" size="small">
                        <div v-for="item in fileComparisonData" v-bind:key="item">
                            <Card @click="startComparator(0, item)">
                                <template #title>{{ item.title.length > 0 ? item.title : '无标题' }}</template>
                                <p>
                                    <Icon type="md-document" />
                                    <Ellipsis :text="item.originalFile" :lines="1" :length='55' tooltip
                                        class="inline-block" />
                                </p>
                                <p>
                                    <Icon type="md-document" />
                                    <Ellipsis :text="item.modifiedFile" :lines="1" :length='55' tooltip
                                        class="inline-block" />
                                </p>
                            </Card>
                        </div>
                    </Space>
                </div>
                <div v-if="fileComparisonData.length == 0" class="empty-data-list">
                    &lt;== 暂无工程,可在左边表单创建一个工程。
                </div>
            </div>
        </div>
    </div>
</template>

<script >
import PubSub from 'pubsub-js'
const { ipcRenderer, shell } = require('electron')
const Store = require('electron-store');
const { defined, guid } = require('../utils/utils');

import CustomTabItem from '../components/CustomTabItem.vue'
export default {
    components: {
        CustomTabItem
    },
    data() {
        return {
            // 当前选中的tab 0:文件比对 1:目录比对
            currentIndex: 0,
            // 文件比对的数据
            fileComparisonData: [],
            // 目录比对的数据
            directoryComparisonData: [],

            formItemFile: {
                guid: '',
                title: '',// 可选
                originalFile: '',
                modifiedFile: '',
                time: undefined,
            },
            formItemDirectory: {
                guid: '',
                title: '',// 可选
                originalDirectory: '',
                modifiedDirectory: '',
                rules: '', // 匹配规则
                time: undefined,
            },

            buttonSize: 'large',

            links: [
                {
                    key: '帮助',
                    title: '帮助',
                    href: 'https://github.com/Sogrey/document-difference-comparator',
                    blankTarget: true
                },
                {
                    key: 'github',
                    icon: 'logo-github',
                    href: 'https://github.com/Sogrey/document-difference-comparator',
                    blankTarget: true
                },
                {
                    key: '条款',
                    title: '条款',
                    href: '',
                    blankTarget: true
                }
            ],
            copyright: 'Copyright © 2022 Sogrey All Rights Reserved'
        }
    },
    mounted() { // 执行异常代码
        // 订阅消息
        PubSub.subscribe('changeTab', (msg, index) => {
            this.changeTab(index);
        });
        this.initStore();
        this.initIPCEvent();
    },
    methods: {
        initStore() {
            this.store = new Store();

            if (!this.store.has('fileComparisonData')) {
                this.store.set('fileComparisonData', []);
            }
            if (!this.store.has('directoryComparisonData')) {
                this.store.set('directoryComparisonData', []);
            }

            this.fileComparisonData = this.store.get('fileComparisonData');
            this.directoryComparisonData = this.store.get('directoryComparisonData');
        },
        initIPCEvent() {
            const self = this;

            ipcRenderer.on('error-message', function (event, msg) {
                // 这里的arg是从主线程请求的数据

                self.showMessage('error', msg)
            });

            ipcRenderer.on('asynchronous-select-file-result', function (event, msg) {
                // 这里的arg是从主线程请求的数据
                console.log("RESULT:", msg);

                switch (msg.tabIndex) {
                    case 0:// 文件比对
                        switch (msg.fileIndex) {
                            case 0:// 原始文件
                                self.formItemFile.originalFile = msg.filePath;
                                break;
                            case 1: // 目标文件
                                self.formItemFile.modifiedFile = msg.filePath;
                                break;
                            default:
                                break;
                        }
                        break;
                    case 1: // 目录比对
                        switch (msg.fileIndex) {
                            case 0:// 原始目录
                                self.formItemDirectory.originalDirectory = msg.filePath;
                                break;
                            case 1: // 目标目录
                                self.formItemDirectory.modifiedDirectory = msg.filePath;
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }

            });
        },
        clickedBtn: function (type) {
            let options = {};
            switch (type) {
                case 'close': // 关闭
                    options.isCloseThisWindow = true;
                    break;
                case 'minimize': // 最小化
                    options.isMinimizeWindows = true;
                    break;
                case 'report-bug': // 报告bug
                    shell.openExternal('https://github.com/Sogrey/document-difference-comparator/issues/new');
                    break;

                default:
                    break;
            }
            ipcRenderer.send('system-channel', options);
        },
        // 切换tab
        changeTab(tab) {
            this.currentIndex = tab;

            const pre_box = document.querySelector('.pre-box')
            if (this.currentIndex == 0) {
                pre_box.style.transform = "translateX(0%)"
                pre_box.style.backgroundColor = "#edd4dc"
            } else if (this.currentIndex == 1) {
                pre_box.style.transform = "translateX(100%)"
                pre_box.style.backgroundColor = "#c9e0ed"
            }
        },
        selectFile: function (fileIndex) {
            console.log(fileIndex);

            ipcRenderer.send('asynchronous-select-file', {
                tabIndex: this.currentIndex,
                fileIndex: fileIndex
            });
        },
        selectDirectory: function (DirIndex) {
            console.log(DirIndex);

            ipcRenderer.send('asynchronous-select-directory', {
                tabIndex: this.currentIndex,
                fileIndex: DirIndex
            });
        },
        startComparator: function (tabIndex, item) {
            let data;
            if (!defined(tabIndex)) {
                switch (this.currentIndex) {
                    case 0:// 文件比对
                        // console.log(this.formItemFile);
                        data = JSON.parse(JSON.stringify(this.formItemFile));

                        data.guid = guid();
                        data.time = new Date().getTime();
                        this.fileComparisonData.push(data)
                        this.store.set('fileComparisonData', this.fileComparisonData);
                        break;
                    case 1: // 目录比对
                        // console.log(this.formItemDirectory);
                        data = JSON.parse(JSON.stringify(this.formItemDirectory));

                        data.guid = guid();
                        data.time = new Date().getTime();
                        this.directoryComparisonData.push(data)
                        this.store.set('directoryComparisonData', this.directoryComparisonData);
                        break;
                    default:
                        break;
                }
            } else {
                data = JSON.parse(JSON.stringify(item));
            }

            ipcRenderer.send('openNewWindow', {
                url: 'MonacoDiffEditor',
                isRelativePath: true,
                params: {
                    data: data,
                    index: defined(tabIndex) ? tabIndex : this.currentIndex,
                }
            });

            setTimeout(() => {
                this.clickedBtn('close') // 关闭当前窗口
            }, 100);
        },
        createNewWindow: function () {
            ipcRenderer.send('openNewWindow', {
                url: 'HelloWorld',
                isRelativePath: true
            });

            setTimeout(() => {
                this.clickedBtn('close') // 关闭当前窗口
            }, 100);
        },
        // 文件比对
        fileComparison(file) {
            console.log(file);
        },
        // 目录比对
        directoryComparison(directory) {
            console.log(directory);
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
    },
}
</script>

<style scoped>
.inline-block {
    display: inline-block;
}

/* 去除input的轮廓 */
input {
    outline: none;
}

.bigBox {
    /* 溢出隐藏 */
    height: 100vh;
    overflow-x: hidden;
    display: flex;
    /* 渐变方向从左到右 */
    background: linear-gradient(to right, rgb(247, 209, 215), rgb(191, 227, 241));
}

/* 最外层的大盒子 */
.box {
    width: 1050px;
    min-width: 1050px;
    height: 600px;
    display: flex;
    /* 相对定位 */
    position: relative;
    z-index: 2;
    margin: auto;
    /* 设置圆角 */
    border-radius: 8px;
    /* 设置盒子阴影 */
    box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* 滑动的盒子 */
.pre-box {
    /* 宽度为大盒子的一半 */
    width: calc(1050px / 2);
    height: 100%;
    /* 绝对定位 */
    position: absolute;
    /* 距离大盒子左侧为0 */
    left: 0;
    /* 距离大盒子顶部为0 */
    top: 0;
    z-index: 99;
    border-radius: 4px;
    background-color: #edd4dc;
    box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
    /* 动画过渡，先加速再减速 */
    transition: 0.5s ease-in-out;
}

.window-bar {
    width: 100%;
    padding: 0.2em;
    background-color: #5ea09a;
}

.window-bar .ivu-icon {
    cursor: pointer;
}

.pre-box-form {
    padding: 1em;
}

.layout-create-content .layout-create-content-title {
    font-size: 1.5em;
    font-weight: bold;
    margin-bottom: 0.5em;
    text-align: center;
    font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
    font-size: 18px;
    color: #999999;
    line-height: 25px;
    letter-spacing: 1px;
}

.pre-box .ivu-layout-footer {
    background-color: transparent !important;
    position: absolute;
    bottom: 0;
    width: 100%;
}

.pre-box .ivu-global-footer {
    /*占地太大了*/
    margin: 0;
}

.pre-box .btn-comparator {
    margin: 2em auto;
    padding: 0.5em 2em;
    display: block;
}

.pre-box .btn-comparator.miniMargin {
    margin: .5em auto;
}

/* 登录和注册盒子 */
.directory-comparison-box,
.file-comparison-box {
    flex: 1;
    height: 100%;
    padding: 1em;
}

.empty-data-list {
    margin: auto 2em;
    font-size: large;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    line-height: 100px;
    color: dimgray;
}

.directory-comparison-box .ivu-card {
    background-color: #c9e0ed88;
}

.file-comparison-box .ivu-card {
    background-color: #edd4dc88;
}

.comparison-box-content {
    height: calc(100% - 63px - 2 * 14px);
    overflow-y: auto;
}

.comparison-box-content .ivu-card {
    width: 99%;
}


.comparison-box-content::-webkit-scrollbar {
    width: 10px;
}

.comparison-box-content::-webkit-scrollbar-track {
    background: rgb(179, 177, 177);
    border-radius: 10px;
}

.comparison-box-content::-webkit-scrollbar-thumb {
    background: rgb(136, 136, 136);
    border-radius: 10px;
}

.comparison-box-content::-webkit-scrollbar-thumb:hover {
    background: rgb(100, 100, 100);
    border-radius: 10px;
}

.comparison-box-content::-webkit-scrollbar-thumb:active {
    background: rgb(68, 68, 68);
    border-radius: 10px;
}
</style>