"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDrafts = void 0;
const combineQueries_1 = require("../../database/combineQueries");
const auth_1 = require("../../auth");
const appendVersionToQueryKey_1 = require("./appendVersionToQueryKey");
const queryDrafts = async (args) => {
    var _a, _b;
    if ((_b = (_a = args.payload.config) === null || _a === void 0 ? void 0 : _a.database) === null || _b === void 0 ? void 0 : _b.queryDrafts_2_0) {
        return queryDraftsV2(args);
    }
    return queryDraftsV1(args);
};
exports.queryDrafts = queryDrafts;
const queryDraftsV1 = async ({ accessResult, collection, req, overrideAccess, payload, paginationOptions, where: incomingWhere, }) => {
    var _a;
    const VersionModel = payload.versions[collection.config.slug];
    const where = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(incomingWhere || {});
    let versionAccessResult;
    if ((0, auth_1.hasWhereAccessResult)(accessResult)) {
        versionAccessResult = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(accessResult);
    }
    const versionQuery = await VersionModel.buildQuery({
        where,
        access: versionAccessResult,
        req,
        overrideAccess,
    });
    const aggregate = VersionModel.aggregate([
        // Sort so that newest are first
        { $sort: { updatedAt: -1 } },
        // Group by parent ID, and take the first of each
        {
            $group: {
                _id: '$parent',
                version: { $first: '$version' },
                updatedAt: { $first: '$updatedAt' },
                createdAt: { $first: '$createdAt' },
            },
        },
        // Filter based on incoming query
        { $match: versionQuery },
    ], {
        allowDiskUse: true,
    });
    let result;
    if (paginationOptions) {
        const aggregatePaginateOptions = {
            ...paginationOptions,
            useFacet: (_a = payload.mongoOptions) === null || _a === void 0 ? void 0 : _a.useFacet,
            sort: Object.entries(paginationOptions.sort)
                .reduce((sort, [incomingSortKey, order]) => {
                let key = incomingSortKey;
                if (!['createdAt', 'updatedAt', '_id'].includes(incomingSortKey)) {
                    key = `version.${incomingSortKey}`;
                }
                return {
                    ...sort,
                    [key]: order === 'asc' ? 1 : -1,
                };
            }, {}),
        };
        result = await VersionModel.aggregatePaginate(aggregate, aggregatePaginateOptions);
    }
    else {
        result = aggregate.exec();
    }
    return {
        ...result,
        docs: result.docs.map((doc) => ({
            _id: doc._id,
            ...doc.version,
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt,
        })),
    };
};
const queryDraftsV2 = async ({ accessResult, collection, req, overrideAccess, payload, paginationOptions, where, }) => {
    var _a;
    const VersionModel = payload.versions[collection.config.slug];
    const queryWithPrefix = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(where || {});
    const combinedQuery = (0, combineQueries_1.combineQueries)({ latest: { equals: true } }, queryWithPrefix);
    const versionsQuery = await VersionModel.buildQuery({
        where: combinedQuery,
        access: accessResult,
        req,
        overrideAccess,
    });
    let result;
    if (paginationOptions) {
        const paginationOptionsToUse = {
            ...paginationOptions,
            lean: true,
            leanWithId: true,
            useFacet: (_a = payload.mongoOptions) === null || _a === void 0 ? void 0 : _a.useFacet,
            sort: Object.entries(paginationOptions.sort)
                .reduce((sort, [incomingSortKey, order]) => {
                let key = incomingSortKey;
                if (!['createdAt', 'updatedAt', '_id'].includes(incomingSortKey)) {
                    key = `version.${incomingSortKey}`;
                }
                return {
                    ...sort,
                    [key]: order === 'asc' ? 1 : -1,
                };
            }, {}),
        };
        result = await VersionModel.paginate(versionsQuery, paginationOptionsToUse);
    }
    else {
        result = await VersionModel.find(versionsQuery);
    }
    return {
        ...result,
        docs: result.docs.map((doc) => ({
            _id: doc.parent,
            id: doc.parent,
            ...doc.version,
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt,
        })),
    };
};
//# sourceMappingURL=queryDrafts.js.map