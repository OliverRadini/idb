import { b as addTraps, e as instanceOfAny, f as __asyncGenerator, d as __generator, g as __await, h as reverseTransformCache, i as unwrap } from './chunk.js';

var advanceMethodProps = ['continue', 'continuePrimaryKey', 'advance'];
var methodMap = {};
var advanceResults = new WeakMap();
var ittrProxiedCursorToOriginalProxy = new WeakMap();
var cursorIteratorTraps = {
    get: function (target, prop) {
        if (!advanceMethodProps.includes(prop))
            return target[prop];
        var cachedFunc = methodMap[prop];
        if (!cachedFunc) {
            cachedFunc = methodMap[prop] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _a;
                advanceResults.set(this, (_a = ittrProxiedCursorToOriginalProxy.get(this))[prop].apply(_a, args));
            };
        }
        return cachedFunc;
    },
};
function iterate() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __asyncGenerator(this, arguments, function iterate_1() {
        var _a, cursor, proxiedCursor;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cursor = this;
                    if (!!(cursor instanceof IDBCursor)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await((_a = cursor).openCursor.apply(_a, args))];
                case 1:
                    cursor = _b.sent();
                    _b.label = 2;
                case 2:
                    if (!!cursor) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    cursor = cursor;
                    proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
                    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
                    // Map this double-proxy back to the original, so other cursor methods work.
                    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
                    _b.label = 5;
                case 5:
                    if (!cursor) return [3 /*break*/, 9];
                    return [4 /*yield*/, __await(proxiedCursor)];
                case 6: return [4 /*yield*/, _b.sent()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, __await((advanceResults.get(proxiedCursor) || cursor.continue()))];
                case 8:
                    // If one of the advancing methods was not called, call continue().
                    cursor = _b.sent();
                    advanceResults.delete(proxiedCursor);
                    return [3 /*break*/, 5];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function isIteratorProp(target, prop) {
    return ((prop === Symbol.asyncIterator &&
        instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor])) ||
        (prop === 'iterate' && instanceOfAny(target, [IDBIndex, IDBObjectStore])));
}
addTraps(function (oldTraps) { return ({
    get: function (target, prop, receiver) {
        if (isIteratorProp(target, prop))
            return iterate;
        return oldTraps.get(target, prop, receiver);
    },
    has: function (target, prop) {
        return isIteratorProp(target, prop) || oldTraps.has(target, prop);
    },
}); });
