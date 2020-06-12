import React from 'react';
import ReactDOM from 'react-dom';

import './@antd.less';
import './@main.css';

import {App} from './@app';
import * as ServiceWorker from './@service-worker';

ReactDOM.render(<App />, document.getElementById('root'));

ServiceWorker.register();
