"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../../types/constants");
const validateWhereQuery = (whereQuery) => {
    var _a, _b, _c, _d, _e, _f;
    if (((_a = whereQuery === null || whereQuery === void 0 ? void 0 : whereQuery.or) === null || _a === void 0 ? void 0 : _a.length) > 0 && ((_c = (_b = whereQuery === null || whereQuery === void 0 ? void 0 : whereQuery.or) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.and) && ((_f = (_e = (_d = whereQuery === null || whereQuery === void 0 ? void 0 : whereQuery.or) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.and) === null || _f === void 0 ? void 0 : _f.length) > 0) {
        // At this point we know that the whereQuery has 'or' and 'and' fields,
        // now let's check the structure and content of these fields.
        const isValid = whereQuery.or.every((orQuery) => {
            if (orQuery.and && Array.isArray(orQuery.and)) {
                return orQuery.and.every((andQuery) => {
                    if (typeof andQuery !== 'object') {
                        return false;
                    }
                    const andKeys = Object.keys(andQuery);
                    // If there are no keys, it's not a valid WhereField.
                    if (andKeys.length === 0) {
                        return false;
                    }
                    // eslint-disable-next-line no-restricted-syntax
                    for (const key of andKeys) {
                        const operator = Object.keys(andQuery[key])[0];
                        // Check if the key is a valid Operator.
                        if (!operator || !constants_1.validOperators.includes(operator)) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            return false;
        });
        return isValid;
    }
    return false;
};
exports.default = validateWhereQuery;
//# sourceMappingURL=validateWhereQuery.js.map