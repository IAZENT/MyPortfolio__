"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withOperators = void 0;
const graphql_1 = require("graphql");
const graphql_type_json_1 = require("graphql-type-json");
const graphql_scalars_1 = require("graphql-scalars");
const types_1 = require("../../fields/config/types");
const combineParentName_1 = __importDefault(require("../utilities/combineParentName"));
const formatName_1 = __importDefault(require("../utilities/formatName"));
const operators_1 = __importDefault(require("./operators"));
const GeoJSONObject = new graphql_1.GraphQLInputObjectType({
    name: 'GeoJSONObject',
    fields: {
        type: { type: graphql_1.GraphQLString },
        coordinates: {
            type: graphql_type_json_1.GraphQLJSON,
        },
    },
});
const defaults = {
    number: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.comparison].map((operator) => ({
                name: operator,
                type: (field) => {
                    return (field === null || field === void 0 ? void 0 : field.name) === 'id' ? graphql_1.GraphQLInt : graphql_1.GraphQLFloat;
                },
            })),
        ],
    },
    text: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial, ...operators_1.default.contains].map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLString,
            })),
        ],
    },
    email: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial, ...operators_1.default.contains].map((operator) => ({
                name: operator,
                type: graphql_scalars_1.EmailAddressResolver,
            })),
        ],
    },
    textarea: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial].map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLString,
            })),
        ],
    },
    richText: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial].map((operator) => ({
                name: operator,
                type: graphql_type_json_1.GraphQLJSON,
            })),
        ],
    },
    json: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial, ...operators_1.default.geojson].map((operator) => ({
                name: operator,
                type: graphql_type_json_1.GraphQLJSON,
            })),
        ],
    },
    code: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial].map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLString,
            })),
        ],
    },
    radio: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.partial].map((operator) => ({
                name: operator,
                type: (field, parentName) => new graphql_1.GraphQLEnumType({
                    name: `${(0, combineParentName_1.default)(parentName, field.name)}_Input`,
                    values: field.options.reduce((values, option) => {
                        if ((0, types_1.optionIsObject)(option)) {
                            return {
                                ...values,
                                [(0, formatName_1.default)(option.value)]: {
                                    value: option.value,
                                },
                            };
                        }
                        return {
                            ...values,
                            [(0, formatName_1.default)(option)]: {
                                value: option,
                            },
                        };
                    }, {}),
                }),
            })),
        ],
    },
    date: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.comparison, 'like'].map((operator) => ({
                name: operator,
                type: graphql_scalars_1.DateTimeResolver,
            })),
        ],
    },
    point: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.comparison, ...operators_1.default.geo].map((operator) => ({
                name: operator,
                type: new graphql_1.GraphQLList(graphql_1.GraphQLFloat),
            })),
            ...operators_1.default.geojson.map((operator) => ({
                name: operator,
                /**
                 * @example:
                 * within: {
                 *  type: "Polygon",
                 *  coordinates: [[
                 *   [0.0, 0.0],
                 *   [1.0, 1.0],
                 *   [1.0, 0.0],
                 *   [0.0, 0.0],
                 *  ]],
                 * }
                 * @example
                 * intersects: {
                 *  type: "Point",
                 *  coordinates: [ 0.5, 0.5 ]
                 * }
                 */
                type: GeoJSONObject,
            })),
        ],
    },
    relationship: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.contains].map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLString,
            })),
        ],
    },
    upload: {
        operators: [
            ...operators_1.default.equality.map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLString,
            })),
        ],
    },
    checkbox: {
        operators: [
            ...operators_1.default.equality.map((operator) => ({
                name: operator,
                type: graphql_1.GraphQLBoolean,
            })),
        ],
    },
    select: {
        operators: [
            ...[...operators_1.default.equality, ...operators_1.default.contains].map((operator) => ({
                name: operator,
                type: (field, parentName) => new graphql_1.GraphQLEnumType({
                    name: `${(0, combineParentName_1.default)(parentName, field.name)}_Input`,
                    values: field.options.reduce((values, option) => {
                        if (typeof option === 'object' && option.value) {
                            return {
                                ...values,
                                [(0, formatName_1.default)(option.value)]: {
                                    value: option.value,
                                },
                            };
                        }
                        if (typeof option === 'string') {
                            return {
                                ...values,
                                [option]: {
                                    value: option,
                                },
                            };
                        }
                        return values;
                    }, {}),
                }),
            })),
        ],
    },
    // array: n/a
    // group: n/a
    // row: n/a
    // collapsible: n/a
    // tabs: n/a
};
const listOperators = ['in', 'not_in', 'all'];
const gqlTypeCache = {};
/**
 * In GraphQL, you can use "where" as an argument to filter a collection. Example:
 * { Posts(where: { title: { equals: "Hello" } }) { text } }
 * This function defines the operators for a field's condition in the "where" argument of the collection (it thus gets called for every field).
 * For example, in the example above, it would control that
 * - "equals" is a valid operator for the "title" field
 * - the accepted type of the "equals" argument has to be a string.
 *
 * @param field the field for which their valid operators inside a "where" argument is being defined
 * @param parentName the name of the parent field (if any)
 * @returns all the operators (including their types) which can be used as a condition for a given field inside a where
 */
const withOperators = (field, parentName) => {
    if (!(defaults === null || defaults === void 0 ? void 0 : defaults[field.type]))
        throw new Error(`Error: ${field.type} has no defaults configured.`);
    const name = `${(0, combineParentName_1.default)(parentName, field.name)}_operator`;
    // Get the default operators for the field type which are hard-coded above
    const fieldOperators = [...defaults[field.type].operators];
    if (!('required' in field) || !field.required) {
        fieldOperators.push({
            name: 'exists',
            type: fieldOperators[0].type,
        });
    }
    return new graphql_1.GraphQLInputObjectType({
        name,
        fields: fieldOperators.reduce((objectTypeFields, operator) => {
            // Get the type of the operator. It can be either static, or dynamic (=> a function)
            let gqlType = typeof operator.type === 'function'
                ? operator.type(field, parentName)
                : operator.type;
            // GraphQL does not allow types with duplicate names, so we use this cache to avoid that.
            // Without this, select and radio fields would have the same name, and GraphQL would throw an error
            // This usually only happens if a custom type is returned from the operator.type function
            if (typeof operator.type === 'function' && 'name' in gqlType) {
                if (gqlTypeCache[gqlType.name]) {
                    gqlType = gqlTypeCache[gqlType.name];
                }
                else {
                    gqlTypeCache[gqlType.name] = gqlType;
                }
            }
            if (listOperators.includes(operator.name)) {
                gqlType = new graphql_1.GraphQLList(gqlType);
            }
            else if (operator.name === 'exists') {
                gqlType = graphql_1.GraphQLBoolean;
            }
            return {
                ...objectTypeFields,
                [operator.name]: {
                    type: gqlType,
                },
            };
        }, {}),
    });
};
exports.withOperators = withOperators;
//# sourceMappingURL=withOperators.js.map