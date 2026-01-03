"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const SelectionProvider_1 = require("../SelectionProvider");
const Input_1 = require("../../../../forms/field-types/Checkbox/Input");
require("./index.scss");
const SelectRow = ({ id }) => {
    const { selected, setSelection } = (0, SelectionProvider_1.useSelection)();
    return (react_1.default.createElement(Input_1.CheckboxInput, { checked: selected[id], onToggle: () => setSelection(id) }));
};
exports.default = SelectRow;
//# sourceMappingURL=index.js.map