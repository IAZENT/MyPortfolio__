"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFieldStatePromise = void 0;
/* eslint-disable no-param-reassign */
const bson_objectid_1 = __importDefault(require("bson-objectid"));
const types_1 = require("../../../../../fields/config/types");
const getDefaultValue_1 = __importDefault(require("../../../../../fields/getDefaultValue"));
const iterateFields_1 = require("./iterateFields");
const addFieldStatePromise = async ({ field, locale, user, state, path, passesCondition, fullData, data, id, operation, t, preferences, }) => {
    var _a;
    if ((0, types_1.fieldAffectsData)(field)) {
        const fieldState = {
            valid: true,
            value: undefined,
            initialValue: undefined,
            validate: field.validate,
            condition: (_a = field.admin) === null || _a === void 0 ? void 0 : _a.condition,
            passesCondition,
        };
        const valueWithDefault = await (0, getDefaultValue_1.default)({ value: data === null || data === void 0 ? void 0 : data[field.name], defaultValue: field.defaultValue, locale, user });
        if (data === null || data === void 0 ? void 0 : data[field.name]) {
            data[field.name] = valueWithDefault;
        }
        let validationResult = true;
        if (typeof fieldState.validate === 'function') {
            validationResult = await fieldState.validate(data === null || data === void 0 ? void 0 : data[field.name], {
                ...field,
                data: fullData,
                user,
                siblingData: data,
                id,
                operation,
                t,
            });
        }
        if (typeof validationResult === 'string') {
            fieldState.errorMessage = validationResult;
            fieldState.valid = false;
        }
        else {
            fieldState.valid = true;
        }
        switch (field.type) {
            case 'array': {
                const arrayValue = Array.isArray(valueWithDefault) ? valueWithDefault : [];
                const { promises, rowMetadata } = arrayValue.reduce((acc, row, i) => {
                    var _a, _b, _c;
                    const rowPath = `${path}${field.name}.${i}.`;
                    row.id = (row === null || row === void 0 ? void 0 : row.id) || new bson_objectid_1.default().toHexString();
                    state[`${rowPath}id`] = {
                        value: row.id,
                        initialValue: row.id,
                        valid: true,
                    };
                    acc.promises.push((0, iterateFields_1.iterateFields)({
                        state,
                        fields: field.fields,
                        data: row,
                        parentPassesCondition: passesCondition,
                        path: rowPath,
                        user,
                        fullData,
                        id,
                        locale,
                        operation,
                        t,
                        preferences,
                    }));
                    const collapsedRowIDs = (_b = (_a = preferences === null || preferences === void 0 ? void 0 : preferences.fields) === null || _a === void 0 ? void 0 : _a[`${path}${field.name}`]) === null || _b === void 0 ? void 0 : _b.collapsed;
                    acc.rowMetadata.push({
                        id: row.id,
                        collapsed: collapsedRowIDs === undefined ? Boolean((_c = field === null || field === void 0 ? void 0 : field.admin) === null || _c === void 0 ? void 0 : _c.initCollapsed) : collapsedRowIDs.includes(row.id),
                        childErrorPaths: new Set(),
                    });
                    return acc;
                }, {
                    promises: [],
                    rowMetadata: [],
                });
                await Promise.all(promises);
                // Add values to field state
                if (valueWithDefault === null) {
                    fieldState.value = null;
                    fieldState.initialValue = null;
                }
                else {
                    fieldState.value = arrayValue.length;
                    fieldState.initialValue = arrayValue.length;
                    if (arrayValue.length > 0) {
                        fieldState.disableFormData = true;
                    }
                }
                fieldState.rows = rowMetadata;
                // Add field to state
                state[`${path}${field.name}`] = fieldState;
                break;
            }
            case 'blocks': {
                const blocksValue = Array.isArray(valueWithDefault) ? valueWithDefault : [];
                const { promises, rowMetadata } = blocksValue.reduce((acc, row, i) => {
                    var _a, _b, _c;
                    const block = field.blocks.find((blockType) => blockType.slug === row.blockType);
                    const rowPath = `${path}${field.name}.${i}.`;
                    if (block) {
                        row.id = (row === null || row === void 0 ? void 0 : row.id) || new bson_objectid_1.default().toHexString();
                        state[`${rowPath}id`] = {
                            value: row.id,
                            initialValue: row.id,
                            valid: true,
                        };
                        state[`${rowPath}blockType`] = {
                            value: row.blockType,
                            initialValue: row.blockType,
                            valid: true,
                        };
                        state[`${rowPath}blockName`] = {
                            value: row.blockName,
                            initialValue: row.blockName,
                            valid: true,
                        };
                        acc.promises.push((0, iterateFields_1.iterateFields)({
                            state,
                            fields: block.fields,
                            data: row,
                            fullData,
                            parentPassesCondition: passesCondition,
                            path: rowPath,
                            user,
                            locale,
                            operation,
                            id,
                            t,
                            preferences,
                        }));
                        const collapsedRowIDs = (_b = (_a = preferences === null || preferences === void 0 ? void 0 : preferences.fields) === null || _a === void 0 ? void 0 : _a[`${path}${field.name}`]) === null || _b === void 0 ? void 0 : _b.collapsed;
                        acc.rowMetadata.push({
                            id: row.id,
                            collapsed: collapsedRowIDs === undefined ? Boolean((_c = field === null || field === void 0 ? void 0 : field.admin) === null || _c === void 0 ? void 0 : _c.initCollapsed) : collapsedRowIDs.includes(row.id),
                            blockType: row.blockType,
                            childErrorPaths: new Set(),
                        });
                    }
                    return acc;
                }, {
                    promises: [],
                    rowMetadata: [],
                });
                await Promise.all(promises);
                // Add values to field state
                if (valueWithDefault === null) {
                    fieldState.value = null;
                    fieldState.initialValue = null;
                }
                else {
                    fieldState.value = blocksValue.length;
                    fieldState.initialValue = blocksValue.length;
                    if (blocksValue.length > 0) {
                        fieldState.disableFormData = true;
                    }
                }
                fieldState.rows = rowMetadata;
                // Add field to state
                state[`${path}${field.name}`] = fieldState;
                break;
            }
            case 'group': {
                await (0, iterateFields_1.iterateFields)({
                    state,
                    id,
                    operation,
                    fields: field.fields,
                    data: (data === null || data === void 0 ? void 0 : data[field.name]) || {},
                    fullData,
                    parentPassesCondition: passesCondition,
                    path: `${path}${field.name}.`,
                    locale,
                    user,
                    t,
                    preferences,
                });
                break;
            }
            case 'relationship': {
                if (field.hasMany) {
                    const relationshipValue = Array.isArray(valueWithDefault) ? valueWithDefault.map((relationship) => {
                        var _a;
                        if (Array.isArray(field.relationTo)) {
                            return {
                                relationTo: relationship.relationTo,
                                value: typeof relationship.value === 'string' ? relationship.value : (_a = relationship.value) === null || _a === void 0 ? void 0 : _a.id,
                            };
                        }
                        if (typeof relationship === 'object' && relationship !== null) {
                            return relationship.id;
                        }
                        return relationship;
                    }) : undefined;
                    fieldState.value = relationshipValue;
                    fieldState.initialValue = relationshipValue;
                }
                else if (Array.isArray(field.relationTo)) {
                    if (valueWithDefault && typeof valueWithDefault === 'object' && 'relationTo' in valueWithDefault && 'value' in valueWithDefault) {
                        const value = typeof (valueWithDefault === null || valueWithDefault === void 0 ? void 0 : valueWithDefault.value) === 'object' && 'id' in valueWithDefault.value ? valueWithDefault.value.id : valueWithDefault.value;
                        const relationshipValue = {
                            relationTo: valueWithDefault === null || valueWithDefault === void 0 ? void 0 : valueWithDefault.relationTo,
                            value,
                        };
                        fieldState.value = relationshipValue;
                        fieldState.initialValue = relationshipValue;
                    }
                }
                else {
                    const relationshipValue = valueWithDefault && typeof valueWithDefault === 'object' && 'id' in valueWithDefault ? valueWithDefault.id : valueWithDefault;
                    fieldState.value = relationshipValue;
                    fieldState.initialValue = relationshipValue;
                }
                state[`${path}${field.name}`] = fieldState;
                break;
            }
            case 'upload': {
                const relationshipValue = valueWithDefault && typeof valueWithDefault === 'object' && 'id' in valueWithDefault ? valueWithDefault.id : valueWithDefault;
                fieldState.value = relationshipValue;
                fieldState.initialValue = relationshipValue;
                state[`${path}${field.name}`] = fieldState;
                break;
            }
            default: {
                fieldState.value = valueWithDefault;
                fieldState.initialValue = valueWithDefault;
                // Add field to state
                state[`${path}${field.name}`] = fieldState;
                break;
            }
        }
    }
    else if ((0, types_1.fieldHasSubFields)(field)) {
        // Handle field types that do not use names (row, etc)
        await (0, iterateFields_1.iterateFields)({
            state,
            fields: field.fields,
            data,
            parentPassesCondition: passesCondition,
            path,
            user,
            fullData,
            id,
            locale,
            operation,
            t,
            preferences,
        });
    }
    else if (field.type === 'tabs') {
        const promises = field.tabs.map((tab) => (0, iterateFields_1.iterateFields)({
            state,
            fields: tab.fields,
            data: (0, types_1.tabHasName)(tab) ? data === null || data === void 0 ? void 0 : data[tab.name] : data,
            parentPassesCondition: passesCondition,
            path: (0, types_1.tabHasName)(tab) ? `${path}${tab.name}.` : path,
            user,
            fullData,
            id,
            locale,
            operation,
            t,
            preferences,
        }));
        await Promise.all(promises);
    }
};
exports.addFieldStatePromise = addFieldStatePromise;
//# sourceMappingURL=addFieldStatePromise.js.map