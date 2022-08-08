/**
 * Clones an object, returning a new object containing the same properties.
 *
 * @function
 *
 * @param {Object} object The object to clone.
 * @param {Boolean} [deep=false] If true, all properties will be deep cloned recursively.
 * @returns {Object} The cloned object.
 */
function clone(object, deep) {
    if (object === null || typeof object !== "object") {
        return object;
    }

    deep = defaultValue(deep, false);

    const result = new object.constructor();
    for (const propertyName in object) {
        // eslint-disable-next-line no-prototype-builtins
        if (object.hasOwnProperty(propertyName)) {
            let value = object[propertyName];
            if (deep) {
                value = clone(value, deep);
            }
            result[propertyName] = value;
        }
    }

    return result;
}

function defined(value) {
    return value !== undefined && value !== null;
}

function defaultValue(a, b) {
    if (a !== undefined && a !== null) {
        return a;
    }
    return b;
}


function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = {
    clone, defaultValue, defined, guid
}