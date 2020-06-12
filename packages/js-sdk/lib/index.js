"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var REQUEST_TIMEOUT = 10000;
var Makeflow = /** @class */ (function () {
    function Makeflow() {
        var _this = this;
        this.timestampToResolveMap = new Map();
        window.addEventListener('message', function (_a) {
            var data = _a.data;
            if (!assertResponseEvent(_this, data)) {
                return;
            }
            var resolver = _this.timestampToResolveMap.get(data.timestamp);
            if (!resolver) {
                return;
            }
            _this.timestampToResolveMap.delete(data.timestamp);
            resolver(data.response);
        });
    }
    Makeflow.prototype.modal = function (params) {
        this.send('modal', params);
    };
    Makeflow.prototype.message = function (params) {
        this.send('message', params);
    };
    Makeflow.prototype.getUserInfo = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.request('getUserInfo', {})];
            });
        });
    };
    Makeflow.prototype.send = function (type, params) {
        var timestamp = Date.now();
        window.parent.postMessage({
            type: type,
            request: params,
            timestamp: timestamp,
        }, '*');
    };
    Makeflow.prototype.request = function (type, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var timestamp = Date.now();
            window.parent.postMessage({
                type: type,
                request: params,
                timestamp: timestamp,
            }, '*');
            var timer = setTimeout(reject, REQUEST_TIMEOUT);
            _this.timestampToResolveMap.set(timestamp, function (value) {
                resolve(value);
                clearTimeout(timer);
            });
        });
    };
    return Makeflow;
}());
function default_1() {
    return new Makeflow();
}
exports.default = default_1;
function assertResponseEvent(api, event) {
    return !!((event === null || event === void 0 ? void 0 : event.type) && event.type in api && (event === null || event === void 0 ? void 0 : event.timestamp));
}
//# sourceMappingURL=index.js.map