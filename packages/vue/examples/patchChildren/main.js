import { createApp } from '../../dist/my-mini-vue.esm.js'
import App from './App.js'

const rootContainer = document.querySelector('#root')
createApp(App).mount(rootContainer)
