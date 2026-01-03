"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFieldsToSign = void 0;
const types_1 = require("../../fields/config/types");
const traverseFields = ({ 
// parent,
fields, data, result, }) => {
    fields.forEach((field) => {
        switch (field.type) {
            case 'row':
            case 'collapsible': {
                traverseFields({
                    fields: field.fields,
                    data,
                    result,
                });
                break;
            }
            case 'group': {
                let targetResult;
                if (typeof field.saveToJWT === 'string') {
                    targetResult = field.saveToJWT;
                    result[field.saveToJWT] = data[field.name];
                }
                else if (field.saveToJWT) {
                    targetResult = field.name;
                    result[field.name] = data[field.name];
                }
                const groupData = data[field.name];
                const groupResult = (targetResult ? result[targetResult] : result);
                traverseFields({
                    fields: field.fields,
                    data: groupData,
                    result: groupResult,
                });
                break;
            }
            case 'tabs': {
                traverseFields({
                    fields: field.tabs.map((tab) => ({ ...tab, type: 'tab' })),
                    data,
                    result,
                });
                break;
            }
            case 'tab': {
                if ((0, types_1.tabHasName)(field)) {
                    let targetResult;
                    if (typeof field.saveToJWT === 'string') {
                        targetResult = field.saveToJWT;
                        result[field.saveToJWT] = data[field.name];
                    }
                    else if (field.saveToJWT) {
                        targetResult = field.name;
                        result[field.name] = data[field.name];
                    }
                    const tabData = data[field.name];
                    const tabResult = (targetResult ? result[targetResult] : result);
                    traverseFields({
                        fields: field.fields,
                        data: tabData,
                        result: tabResult,
                    });
                }
                else {
                    traverseFields({
                        fields: field.fields,
                        data,
                        result,
                    });
                }
                break;
            }
            default:
                if ((0, types_1.fieldAffectsData)(field)) {
                    if (field.saveToJWT) {
                        if (typeof field.saveToJWT === 'string') {
                            result[field.saveToJWT] = data[field.name];
                            delete result[field.name];
                        }
                        else {
                            result[field.name] = data[field.name];
                        }
                    }
                    else if (field.saveToJWT === false) {
                        delete result[field.name];
                    }
                }
        }
    });
    return result;
};
const getFieldsToSign = (args) => {
    const { collectionConfig, user, email, } = args;
    const result = {
        email,
        id: user.id,
        collection: collectionConfig.slug,
    };
    traverseFields({
        fields: collectionConfig.fields,
        data: user,
        result,
    });
    return result;
};
exports.getFieldsToSign = getFieldsToSign;
//# sourceMappingURL=getFieldsToSign.js.map