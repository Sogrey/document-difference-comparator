import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

import axios from 'axios'
import VueAxios from 'vue-axios'

import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'

let app = createApp(App)
app
    .use(ViewUIPlus)
    .use(router)
    .use(VueAxios, axios)
    .mount('#app')