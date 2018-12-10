'use strict';

const provide = require('../cf-provider');
const {resolve} = require('path');

provide(exports, resolve(__dirname));
