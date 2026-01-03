"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_i18next_1 = require("react-i18next");
const SelectionProvider_1 = require("../SelectionProvider");
const Input_1 = require("../../../../forms/field-types/Checkbox/Input");
const SelectAll = () => {
    const { t } = (0, react_i18next_1.useTranslation)('general');
    const { selectAll, toggleAll } = (0, SelectionProvider_1.useSelection)();
    return (react_1.default.createElement(Input_1.CheckboxInput, { id: "select-all", "aria-label": selectAll === SelectionProvider_1.SelectAllStatus.None ? t('selectAllRows') : t('deselectAllRows'), checked: selectAll === SelectionProvider_1.SelectAllStatus.AllInPage || selectAll === SelectionProvider_1.SelectAllStatus.AllAvailable, partialChecked: selectAll === SelectionProvider_1.SelectAllStatus.Some, onToggle: () => toggleAll() }));
};
exports.default = SelectAll;
//# sourceMappingURL=index.js.map