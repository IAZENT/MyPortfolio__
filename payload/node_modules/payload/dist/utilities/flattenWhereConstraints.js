"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Take a where query and flatten it to all top-level operators
const flattenWhereConstraints = (query) => {
    return Object.entries(query).reduce((flattenedConstraints, [key, val]) => {
        if ((key === 'and' || key === 'or') && Array.isArray(val)) {
            // Instead of using map, use reduce to accumulate results into a single array
            const flattenedNested = val.reduce((acc, subVal) => {
                return [...acc, ...flattenWhereConstraints(subVal)];
            }, []);
            return [
                ...flattenedConstraints,
                ...flattenedNested,
            ];
        }
        return [
            ...flattenedConstraints,
            val,
        ];
    }, []);
};
exports.default = flattenWhereConstraints;
//# sourceMappingURL=flattenWhereConstraints.js.map