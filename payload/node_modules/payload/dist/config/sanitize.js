"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeConfig = void 0;
const deepmerge_1 = __importDefault(require("deepmerge"));
const is_plain_object_1 = require("is-plain-object");
const defaultUser_1 = require("../auth/defaultUser");
const sanitize_1 = __importDefault(require("../collections/config/sanitize"));
const errors_1 = require("../errors");
const sanitize_2 = __importDefault(require("../globals/config/sanitize"));
const checkDuplicateCollections_1 = __importDefault(require("../utilities/checkDuplicateCollections"));
const defaults_1 = require("./defaults");
const bundler_1 = __importDefault(require("../bundlers/webpack/bundler"));
const sanitizeAdminConfig = (configToSanitize) => {
    var _a;
    const sanitizedConfig = { ...configToSanitize };
    // add default user collection if none provided
    if (!((_a = sanitizedConfig === null || sanitizedConfig === void 0 ? void 0 : sanitizedConfig.admin) === null || _a === void 0 ? void 0 : _a.user)) {
        const firstCollectionWithAuth = sanitizedConfig.collections.find(({ auth }) => Boolean(auth));
        if (firstCollectionWithAuth) {
            sanitizedConfig.admin.user = firstCollectionWithAuth.slug;
        }
        else {
            sanitizedConfig.admin.user = defaultUser_1.defaultUserCollection.slug;
            sanitizedConfig.collections.push(defaultUser_1.defaultUserCollection);
        }
    }
    if (!sanitizedConfig.collections.find(({ slug }) => slug === sanitizedConfig.admin.user)) {
        throw new errors_1.InvalidConfiguration(`${sanitizedConfig.admin.user} is not a valid admin user collection`);
    }
    // add default bundler if none provided
    if (!sanitizedConfig.admin.bundler) {
        sanitizedConfig.admin.bundler = (0, bundler_1.default)();
    }
    return sanitizedConfig;
};
const sanitizeConfig = (incomingConfig) => {
    const configWithDefaults = (0, deepmerge_1.default)(defaults_1.defaults, incomingConfig, {
        isMergeableObject: is_plain_object_1.isPlainObject,
    });
    const config = sanitizeAdminConfig(configWithDefaults);
    config.collections = config.collections.map((collection) => (0, sanitize_1.default)(configWithDefaults, collection));
    (0, checkDuplicateCollections_1.default)(config.collections);
    if (config.globals.length > 0) {
        config.globals = (0, sanitize_2.default)(config.collections, config.globals);
    }
    if (typeof config.serverURL === 'undefined') {
        config.serverURL = '';
    }
    if (config.serverURL !== '') {
        config.csrf.push(config.serverURL);
    }
    return config;
};
exports.sanitizeConfig = sanitizeConfig;
//# sourceMappingURL=sanitize.js.map