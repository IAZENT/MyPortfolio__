"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterOptionsQuery = void 0;
const getFilterOptionsQuery = async (filterOptions, options) => {
    const { relationTo } = options;
    const relations = Array.isArray(relationTo) ? relationTo : [relationTo];
    const query = {};
    if (typeof filterOptions !== 'undefined') {
        await Promise.all(relations.map(async (relation) => {
            query[relation] = typeof filterOptions === 'function' ? await filterOptions({ ...options, relationTo: relation }) : filterOptions;
        }));
    }
    return query;
};
exports.getFilterOptionsQuery = getFilterOptionsQuery;
//# sourceMappingURL=getFilterOptionsQuery.js.map