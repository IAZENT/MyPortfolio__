"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const context_1 = require("../Form/context");
const Button_1 = __importDefault(require("../../elements/Button"));
require("./index.scss");
const baseClass = 'form-submit';
const FormSubmit = (0, react_1.forwardRef)((props, ref) => {
    const { children, buttonId: id, disabled: disabledFromProps, type = 'submit' } = props;
    const processing = (0, context_1.useFormProcessing)();
    const { disabled } = (0, context_1.useForm)();
    const canSave = !(disabledFromProps || processing || disabled);
    return (react_1.default.createElement("div", { className: baseClass },
        react_1.default.createElement(Button_1.default, { ref: ref, ...props, id: id, type: type, disabled: canSave ? undefined : true }, children)));
});
exports.default = FormSubmit;
//# sourceMappingURL=index.js.map