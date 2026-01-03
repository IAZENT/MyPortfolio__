"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFieldSchemaMap = void 0;
const createNestedFieldPath_1 = require("./createNestedFieldPath");
/**
 * **Returns Map with array and block field schemas**
 * - Takes entity fields and returns a Map to retrieve field schemas by path without indexes
 *
 * **Accessing field schemas**
 * - array fields: indexes must be removed from path i.e. `array.innerArray` instead of `array.0.innerArray`
 * - block fields: the block slug must be appended to the path `blocksFieldName.blockSlug` instead of `blocksFieldName`
 *
 * @param entityFields
 * @returns Map<string, Field[]>
 */
const buildFieldSchemaMap = (entityFields) => {
    const fieldMap = new Map();
    const buildUpMap = (fields, parentPath = '') => {
        fields.forEach((field) => {
            const path = (0, createNestedFieldPath_1.createNestedFieldPath)(parentPath, field);
            switch (field.type) {
                case 'blocks':
                    field.blocks.forEach((block) => {
                        const blockPath = `${path}.${block.slug}`;
                        fieldMap.set(blockPath, block.fields);
                        buildUpMap(block.fields, blockPath);
                    });
                    break;
                case 'array':
                    fieldMap.set(path, field.fields);
                    buildUpMap(field.fields, path);
                    break;
                case 'row':
                case 'collapsible':
                case 'group':
                    buildUpMap(field.fields, path);
                    break;
                case 'tabs':
                    field.tabs.forEach((tab) => {
                        let tabPath = path;
                        if (tabPath) {
                            tabPath = 'name' in tab ? `${tabPath}.${tab.name}` : tabPath;
                        }
                        else {
                            tabPath = 'name' in tab ? `${tab.name}` : tabPath;
                        }
                        buildUpMap(tab.fields, tabPath);
                    });
                    break;
                default:
                    break;
            }
        });
    };
    buildUpMap(entityFields);
    return fieldMap;
};
exports.buildFieldSchemaMap = buildFieldSchemaMap;
//# sourceMappingURL=buildFieldSchemaMap.js.map