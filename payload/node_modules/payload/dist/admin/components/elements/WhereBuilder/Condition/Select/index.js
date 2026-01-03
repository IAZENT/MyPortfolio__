"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
const react_1 = __importDefault(require("react"));
const react_i18next_1 = require("react-i18next");
const ReactSelect_1 = __importDefault(require("../../../ReactSelect"));
const getTranslation_1 = require("../../../../../../utilities/getTranslation");
const formatOptions = (options) => options.map((option) => {
    if (typeof option === 'object' && (option.value || option.value === '')) {
        return option;
    }
    return {
        label: option,
        value: option,
    };
});
const Select = ({ onChange, value, options: optionsFromProps, operator }) => {
    var _a;
    const { i18n } = (0, react_i18next_1.useTranslation)();
    const [options, setOptions] = react_1.default.useState(formatOptions(optionsFromProps));
    const isMulti = ['in', 'not_in'].includes(operator);
    let valueToRender;
    if (isMulti && Array.isArray(value)) {
        valueToRender = value.map((val) => {
            var _a;
            const matchingOption = options.find((option) => option.value === val);
            return {
                label: matchingOption ? (0, getTranslation_1.getTranslation)(matchingOption.label, i18n) : val,
                value: (_a = matchingOption === null || matchingOption === void 0 ? void 0 : matchingOption.value) !== null && _a !== void 0 ? _a : val,
            };
        });
    }
    else if (value) {
        const matchingOption = options.find((option) => option.value === value);
        valueToRender = {
            label: matchingOption ? (0, getTranslation_1.getTranslation)(matchingOption.label, i18n) : value,
            value: (_a = matchingOption === null || matchingOption === void 0 ? void 0 : matchingOption.value) !== null && _a !== void 0 ? _a : value,
        };
    }
    const onSelect = react_1.default.useCallback((selectedOption) => {
        let newValue;
        if (!selectedOption) {
            newValue = null;
        }
        else if (isMulti) {
            if (Array.isArray(selectedOption)) {
                newValue = selectedOption.map((option) => option.value);
            }
            else {
                newValue = [];
            }
        }
        else {
            newValue = selectedOption.value;
        }
        onChange(newValue);
    }, [
        isMulti,
        onChange,
    ]);
    react_1.default.useEffect(() => {
        setOptions(formatOptions(optionsFromProps));
    }, [optionsFromProps]);
    react_1.default.useEffect(() => {
        if (!isMulti && Array.isArray(value)) {
            onChange(value[0]);
        }
    }, [isMulti, onChange, value]);
    return (react_1.default.createElement(ReactSelect_1.default, { onChange: onSelect, value: valueToRender, options: options.map((option) => ({ ...option, label: (0, getTranslation_1.getTranslation)(option.label, i18n) })), isMulti: isMulti }));
};
exports.Select = Select;
//# sourceMappingURL=index.js.map