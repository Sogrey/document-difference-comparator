<template>
    <div class="hello">
        <h1>{{ msg }} {{msg1}}</h1>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
    name: 'HelloWorld',
    components: {

    },
    data() {
        return {
            msg: 'Hello World!',
            msg1: ''
        }
    },
    mounted() { // 执行异常代码
        const self = this;
        ipcRenderer.on('data', (e, arg) => {
            console.log(arg)
            self.msg1 = arg;
        });
    },
    methods: {
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
    color: #42b983;
}
</style>
