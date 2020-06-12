// eslint-disable-next-line @magicspace/scoped-modules
import React from 'react';
import ReactDOM from 'react-dom';

import './@main.css';

import {App} from './@app';
import * as ServiceWorker from './@service-worker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.register();
