<template>
    <div class="transition-skewX">
        <div v-bind:class="{ current: currentIndex === 0 }" @click="changeTab(0)"><span>文件比对</span></div>
        <div v-bind:class="{ current: currentIndex === 1 }" @click="changeTab(1)"><span>目录比对</span></div>
    </div>
</template>
<script>
import PubSub from 'pubsub-js'
export default {
    data() {
        return {
            // 当前选中的tab 0:文件比对 1:目录比对
            currentIndex: 0,
        }
    },
    methods: {
        // 切换tab
        changeTab(tab) {
            this.currentIndex = tab;

            // 发布消息
            PubSub.publish('changeTab', tab);  //changeTab一定要与订阅方名称一样，index是通信的具体数据
        },
    },
}
</script>
<style>
.transition-skewX {
    width: 314px;
    margin: 20px auto;
}

.transition-skewX>div {
    margin-right: 7px;
    width: 150px;
    height: 40px;
    line-height: 40px;
    font-size: 24px;
    text-align: center;
    transform: skewX(-22deg) scale(0.8, 0.8);
    display: inline-block;
    text-decoration: none;
    color: #fff;
    border-radius: 5px;
    border: 1px solid #fff;
}

.transition-skewX .current {
    transform: skewX(-22deg) scale(1, 1);
}

.transition-skewX .current,
.transition-skewX>div:hover {
    background-color: #fff;
    color: #edd4dc;
    transition: all 0.3s;
}

.transition-skewX span {
    display: inline-block;
    transform: skewX(22deg);
    user-select: none;
}
</style>