"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Button_1 = __importDefault(require("../Button"));
const AlignLeft_1 = __importDefault(require("../../../../../icons/AlignLeft"));
const AlignCenter_1 = __importDefault(require("../../../../../icons/AlignCenter"));
const AlignRight_1 = __importDefault(require("../../../../../icons/AlignRight"));
exports.default = {
    name: 'alignment',
    Button: () => {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(Button_1.default, { format: "left", type: "textAlign" },
                react_1.default.createElement(AlignLeft_1.default, null)),
            react_1.default.createElement(Button_1.default, { format: "center", type: "textAlign" },
                react_1.default.createElement(AlignCenter_1.default, null)),
            react_1.default.createElement(Button_1.default, { format: "right", type: "textAlign" },
                react_1.default.createElement(AlignRight_1.default, null))));
    },
};
//# sourceMappingURL=index.js.map