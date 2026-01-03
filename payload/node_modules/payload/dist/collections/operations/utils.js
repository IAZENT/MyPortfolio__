"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAfterOperation = void 0;
// export type AfterOperationHook = typeof buildAfterOperation;
const buildAfterOperation = async (operationArgs) => {
    const { operation, args, result, } = operationArgs;
    let newResult = result;
    await args.collection.config.hooks.afterOperation.reduce(async (priorHook, hook) => {
        await priorHook;
        const hookResult = await hook({
            operation,
            args,
            result: newResult,
        });
        if (hookResult !== undefined) {
            newResult = hookResult;
        }
    }, Promise.resolve());
    return newResult;
};
exports.buildAfterOperation = buildAfterOperation;
//# sourceMappingURL=utils.js.map