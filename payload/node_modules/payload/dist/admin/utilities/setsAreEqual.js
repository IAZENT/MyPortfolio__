"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setsAreEqual = void 0;
/**
 * Function to determine whether two sets are equal or not.
 */
const setsAreEqual = (lhs, rhs) => {
    return lhs.size === rhs.size && Array.from(lhs).every((value) => rhs.has(value));
};
exports.setsAreEqual = setsAreEqual;
//# sourceMappingURL=setsAreEqual.js.map