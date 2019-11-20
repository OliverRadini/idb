import { a as wrap, b as addTraps, c as __awaiter, d as __generator } from './chunk.js';
export { i as unwrap, a as wrap } from './chunk.js';

/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */
function openDB(name, version, _a) {
    var _b = _a === void 0 ? {} : _a, blocked = _b.blocked, upgrade = _b.upgrade, blocking = _b.blocking;
    var request = indexedDB.open(name, version);
    var openPromise = wrap(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', function (event) {
            upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction));
        });
    }
    if (blocked)
        request.addEventListener('blocked', function () { return blocked(); });
    if (blocking) {
        openPromise.then(function (db) { return db.addEventListener('versionchange', blocking); }).catch(function () { });
    }
    return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */
function deleteDB(name, _a) {
    var blocked = (_a === void 0 ? {} : _a).blocked;
    var request = indexedDB.deleteDatabase(name);
    if (blocked)
        request.addEventListener('blocked', function () { return blocked(); });
    return wrap(request).then(function () { return undefined; });
}

var readMethods = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'];
var writeMethods = ['put', 'add', 'delete', 'clear'];
var cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase &&
        !(prop in target) &&
        typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop))
        return cachedMethods.get(prop);
    var targetFuncName = prop.replace(/FromIndex$/, '');
    var useIndex = prop !== targetFuncName;
    var isWrite = writeMethods.includes(targetFuncName);
    if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) ||
        !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    var method = function (storeName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _a, tx, target, returnVal;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
                        target = tx.store;
                        if (useIndex)
                            target = target.index(args.shift());
                        returnVal = (_a = target)[targetFuncName].apply(_a, args);
                        if (!isWrite) return [3 /*break*/, 2];
                        return [4 /*yield*/, tx.done];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, returnVal];
                }
            });
        });
    };
    cachedMethods.set(prop, method);
    return method;
}
addTraps(function (oldTraps) { return ({
    get: function (target, prop, receiver) {
        return getMethod(target, prop) || oldTraps.get(target, prop, receiver);
    },
    has: function (target, prop) {
        return !!getMethod(target, prop) || oldTraps.has(target, prop);
    },
}); });

export { openDB, deleteDB };
