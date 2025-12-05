import './assets/index.css'
import mockData from './mock/data.json'
// @ts-ignore
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/+esm';
import {initCanyonSpa} from "./index.ts";
window.monaco = monaco;
// console.log(window.monaco);
// const s = document.createElement('script');
// s.src = './index.js';
// document.body.appendChild(s);
//
// const s2 = document.createElement('script');
// s2.src = './map-store.js.js';
// document.body.appendChild(s2)


setTimeout(()=>{
    initCanyonSpa(document.getElementById('app'),{
        coverage: mockData.coverage,
        content: mockData.content,
        diff:[10,12],
        height:'calc(100vh - 50px)',
        showDecorations: {
            statements: true,
            functions: true,
            branches: true,
        }
    })
},100)
