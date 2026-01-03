"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = __importDefault(require("fs"));
/**
* Returns the source and output paths from the nearest tsconfig.json file.
* If no tsconfig.json file is found, returns the current working directory.
* @returns An object containing the source and output paths.
*/
const getTSConfigPaths = () => {
    var _a, _b;
    const tsConfigPath = find_up_1.default.sync('tsconfig.json');
    if (!tsConfigPath) {
        return { srcPath: process.cwd(), outPath: process.cwd() };
    }
    try {
        // Read the file as a string and remove trailing commas
        const rawTsConfig = fs_1.default.readFileSync(tsConfigPath, 'utf-8')
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}');
        const tsConfig = JSON.parse(rawTsConfig);
        const srcPath = ((_a = tsConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.rootDir) || process.cwd();
        const outPath = ((_b = tsConfig.compilerOptions) === null || _b === void 0 ? void 0 : _b.outDir) || process.cwd();
        return { srcPath, outPath };
    }
    catch (error) {
        console.error(`Error parsing tsconfig.json: ${error}`); // Do not throw the error, as we can still continue with the other config path finding methods
        return { srcPath: process.cwd(), outPath: process.cwd() };
    }
};
/**
 * Searches for a Payload configuration file.
 * @returns The absolute path to the Payload configuration file.
 * @throws An error if no configuration file is found.
 */
const findConfig = () => {
    // If the developer has specified a config path,
    // format it if relative and use it directly if absolute
    if (process.env.PAYLOAD_CONFIG_PATH) {
        if (path_1.default.isAbsolute(process.env.PAYLOAD_CONFIG_PATH)) {
            return process.env.PAYLOAD_CONFIG_PATH;
        }
        return path_1.default.resolve(process.cwd(), process.env.PAYLOAD_CONFIG_PATH);
    }
    const { srcPath, outPath } = getTSConfigPaths();
    const searchPaths = process.env.NODE_ENV === 'production' ? [outPath, srcPath] : [srcPath];
    // eslint-disable-next-line no-restricted-syntax
    for (const searchPath of searchPaths) {
        const configPath = find_up_1.default.sync((dir) => {
            const tsPath = path_1.default.join(dir, 'payload.config.ts');
            const hasTS = find_up_1.default.sync.exists(tsPath);
            if (hasTS) {
                return tsPath;
            }
            const jsPath = path_1.default.join(dir, 'payload.config.js');
            const hasJS = find_up_1.default.sync.exists(jsPath);
            if (hasJS) {
                return jsPath;
            }
            return undefined;
        }, { cwd: searchPath });
        if (configPath) {
            return configPath;
        }
    }
    // If no config file is found in the directories defined by tsconfig.json,
    // try searching in the 'src' and 'dist' directory as a last resort, as they are most commonly used
    if (process.env.NODE_ENV === 'production') {
        const distConfigPath = find_up_1.default.sync(['payload.config.js', 'payload.config.ts'], { cwd: path_1.default.resolve(process.cwd(), 'dist') });
        if (distConfigPath)
            return distConfigPath;
    }
    else {
        const srcConfigPath = find_up_1.default.sync(['payload.config.js', 'payload.config.ts'], { cwd: path_1.default.resolve(process.cwd(), 'src') });
        if (srcConfigPath)
            return srcConfigPath;
    }
    throw new Error('Error: cannot find Payload config. Please create a configuration file located at the root of your current working directory called "payload.config.js" or "payload.config.ts".');
};
exports.default = findConfig;
//# sourceMappingURL=find.js.map