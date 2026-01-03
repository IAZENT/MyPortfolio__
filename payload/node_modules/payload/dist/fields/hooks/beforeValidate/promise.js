"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promise = void 0;
const types_1 = require("../../config/types");
const getDefaultValue_1 = __importDefault(require("../../getDefaultValue"));
const cloneDataFromOriginalDoc_1 = require("../beforeChange/cloneDataFromOriginalDoc");
const getExistingRowDoc_1 = require("../beforeChange/getExistingRowDoc");
const traverseFields_1 = require("./traverseFields");
// This function is responsible for the following actions, in order:
// - Sanitize incoming data
// - Execute field hooks
// - Execute field access control
// - Merge original document data into incoming data
// - Compute default values for undefined fields
const promise = async ({ data, doc, field, id, operation, overrideAccess, req, siblingData, siblingDoc, context, }) => {
    var _a, _b;
    if ((0, types_1.fieldAffectsData)(field)) {
        if (field.name === 'id') {
            if (field.type === 'number' && typeof siblingData[field.name] === 'string') {
                const value = siblingData[field.name];
                siblingData[field.name] = parseFloat(value);
            }
            if (field.type === 'text' && typeof ((_a = siblingData[field.name]) === null || _a === void 0 ? void 0 : _a.toString) === 'function' && typeof siblingData[field.name] !== 'string') {
                siblingData[field.name] = siblingData[field.name].toString();
            }
        }
        // Sanitize incoming data
        switch (field.type) {
            case 'number': {
                if (typeof siblingData[field.name] === 'string') {
                    const value = siblingData[field.name];
                    const trimmed = value.trim();
                    siblingData[field.name] = (trimmed.length === 0) ? null : parseFloat(trimmed);
                }
                break;
            }
            case 'point': {
                if (Array.isArray(siblingData[field.name])) {
                    siblingData[field.name] = siblingData[field.name].map((coordinate, i) => {
                        if (typeof coordinate === 'string') {
                            const value = siblingData[field.name][i];
                            const trimmed = value.trim();
                            return (trimmed.length === 0) ? null : parseFloat(trimmed);
                        }
                        return coordinate;
                    });
                }
                break;
            }
            case 'checkbox': {
                if (siblingData[field.name] === 'true')
                    siblingData[field.name] = true;
                if (siblingData[field.name] === 'false')
                    siblingData[field.name] = false;
                if (siblingData[field.name] === '')
                    siblingData[field.name] = false;
                break;
            }
            case 'richText': {
                if (typeof siblingData[field.name] === 'string') {
                    try {
                        const richTextJSON = JSON.parse(siblingData[field.name]);
                        siblingData[field.name] = richTextJSON;
                    }
                    catch {
                        // Disregard this data as it is not valid.
                        // Will be reported to user by field validation
                    }
                }
                break;
            }
            case 'relationship':
            case 'upload': {
                if (siblingData[field.name] === '' || siblingData[field.name] === 'none' || siblingData[field.name] === 'null' || siblingData[field.name] === null) {
                    if (field.type === 'relationship' && field.hasMany === true) {
                        siblingData[field.name] = [];
                    }
                    else {
                        siblingData[field.name] = null;
                    }
                }
                const value = siblingData[field.name];
                if (Array.isArray(field.relationTo)) {
                    if (Array.isArray(value)) {
                        value.forEach((relatedDoc, i) => {
                            const relatedCollection = req.payload.config.collections.find((collection) => collection.slug === relatedDoc.relationTo);
                            const relationshipIDField = relatedCollection.fields.find((collectionField) => (0, types_1.fieldAffectsData)(collectionField) && collectionField.name === 'id');
                            if ((relationshipIDField === null || relationshipIDField === void 0 ? void 0 : relationshipIDField.type) === 'number') {
                                siblingData[field.name][i] = { ...relatedDoc, value: parseFloat(relatedDoc.value) };
                            }
                        });
                    }
                    if (field.type === 'relationship' && field.hasMany !== true && (0, types_1.valueIsValueWithRelation)(value)) {
                        const relatedCollection = req.payload.config.collections.find((collection) => collection.slug === value.relationTo);
                        const relationshipIDField = relatedCollection.fields.find((collectionField) => (0, types_1.fieldAffectsData)(collectionField) && collectionField.name === 'id');
                        if ((relationshipIDField === null || relationshipIDField === void 0 ? void 0 : relationshipIDField.type) === 'number') {
                            siblingData[field.name] = { ...value, value: parseFloat(value.value) };
                        }
                    }
                }
                else {
                    if (Array.isArray(value)) {
                        value.forEach((relatedDoc, i) => {
                            const relatedCollection = req.payload.config.collections.find((collection) => collection.slug === field.relationTo);
                            const relationshipIDField = relatedCollection.fields.find((collectionField) => (0, types_1.fieldAffectsData)(collectionField) && collectionField.name === 'id');
                            if ((relationshipIDField === null || relationshipIDField === void 0 ? void 0 : relationshipIDField.type) === 'number') {
                                siblingData[field.name][i] = parseFloat(relatedDoc);
                            }
                        });
                    }
                    if (field.type === 'relationship' && field.hasMany !== true && value) {
                        const relatedCollection = req.payload.config.collections.find((collection) => collection.slug === field.relationTo);
                        const relationshipIDField = relatedCollection.fields.find((collectionField) => (0, types_1.fieldAffectsData)(collectionField) && collectionField.name === 'id');
                        if ((relationshipIDField === null || relationshipIDField === void 0 ? void 0 : relationshipIDField.type) === 'number') {
                            siblingData[field.name] = parseFloat(value);
                        }
                    }
                }
                break;
            }
            case 'array':
            case 'blocks': {
                // Handle cases of arrays being intentionally set to 0
                if (siblingData[field.name] === '0' || siblingData[field.name] === 0) {
                    siblingData[field.name] = [];
                }
                break;
            }
            default: {
                break;
            }
        }
        // Execute hooks
        if ((_b = field.hooks) === null || _b === void 0 ? void 0 : _b.beforeValidate) {
            await field.hooks.beforeValidate.reduce(async (priorHook, currentHook) => {
                await priorHook;
                const hookedValue = await currentHook({
                    value: siblingData[field.name],
                    originalDoc: doc,
                    data,
                    siblingData,
                    operation,
                    req,
                    context,
                });
                if (hookedValue !== undefined) {
                    siblingData[field.name] = hookedValue;
                }
            }, Promise.resolve());
        }
        // Execute access control
        if (field.access && field.access[operation]) {
            const result = overrideAccess ? true : await field.access[operation]({ req, id, siblingData, data, doc });
            if (!result) {
                delete siblingData[field.name];
            }
        }
        if (typeof siblingData[field.name] === 'undefined') {
            // If no incoming data, but existing document data is found, merge it in
            if (typeof siblingDoc[field.name] !== 'undefined') {
                siblingData[field.name] = (0, cloneDataFromOriginalDoc_1.cloneDataFromOriginalDoc)(siblingDoc[field.name]);
                // Otherwise compute default value
            }
            else if (typeof field.defaultValue !== 'undefined') {
                siblingData[field.name] = await (0, getDefaultValue_1.default)({
                    value: siblingData[field.name],
                    defaultValue: field.defaultValue,
                    locale: req.locale,
                    user: req.user,
                });
            }
        }
    }
    // Traverse subfields
    switch (field.type) {
        case 'group': {
            let groupData = siblingData[field.name];
            let groupDoc = siblingDoc[field.name];
            if (typeof siblingData[field.name] !== 'object')
                groupData = {};
            if (typeof siblingDoc[field.name] !== 'object')
                groupDoc = {};
            await (0, traverseFields_1.traverseFields)({
                data,
                doc,
                fields: field.fields,
                id,
                operation,
                overrideAccess,
                req,
                siblingData: groupData,
                siblingDoc: groupDoc,
                context,
            });
            break;
        }
        case 'array': {
            const rows = siblingData[field.name];
            if (Array.isArray(rows)) {
                const promises = [];
                rows.forEach((row, i) => {
                    promises.push((0, traverseFields_1.traverseFields)({
                        data,
                        doc,
                        fields: field.fields,
                        id,
                        operation,
                        overrideAccess,
                        req,
                        siblingData: row,
                        siblingDoc: (0, getExistingRowDoc_1.getExistingRowDoc)(row, siblingDoc[field.name]),
                        context,
                    }));
                });
                await Promise.all(promises);
            }
            break;
        }
        case 'blocks': {
            const rows = siblingData[field.name];
            if (Array.isArray(rows)) {
                const promises = [];
                rows.forEach((row, i) => {
                    const block = field.blocks.find((blockType) => blockType.slug === row.blockType);
                    if (block) {
                        promises.push((0, traverseFields_1.traverseFields)({
                            data,
                            doc,
                            fields: block.fields,
                            id,
                            operation,
                            overrideAccess,
                            req,
                            siblingData: row,
                            siblingDoc: (0, getExistingRowDoc_1.getExistingRowDoc)(row, siblingDoc[field.name]),
                            context,
                        }));
                    }
                });
                await Promise.all(promises);
            }
            break;
        }
        case 'row':
        case 'collapsible': {
            await (0, traverseFields_1.traverseFields)({
                data,
                doc,
                fields: field.fields,
                id,
                operation,
                overrideAccess,
                req,
                siblingData,
                siblingDoc,
                context,
            });
            break;
        }
        case 'tab': {
            let tabSiblingData;
            let tabSiblingDoc;
            if ((0, types_1.tabHasName)(field)) {
                if (typeof siblingData[field.name] !== 'object')
                    siblingData[field.name] = {};
                if (typeof siblingDoc[field.name] !== 'object')
                    siblingDoc[field.name] = {};
                tabSiblingData = siblingData[field.name];
                tabSiblingDoc = siblingDoc[field.name];
            }
            else {
                tabSiblingData = siblingData;
                tabSiblingDoc = siblingDoc;
            }
            await (0, traverseFields_1.traverseFields)({
                data,
                doc,
                fields: field.fields,
                id,
                operation,
                overrideAccess,
                req,
                siblingData: tabSiblingData,
                siblingDoc: tabSiblingDoc,
                context,
            });
            break;
        }
        case 'tabs': {
            await (0, traverseFields_1.traverseFields)({
                data,
                doc,
                fields: field.tabs.map((tab) => ({ ...tab, type: 'tab' })),
                id,
                operation,
                overrideAccess,
                req,
                siblingData,
                siblingDoc,
                context,
            });
            break;
        }
        default: {
            break;
        }
    }
};
exports.promise = promise;
//# sourceMappingURL=promise.js.map