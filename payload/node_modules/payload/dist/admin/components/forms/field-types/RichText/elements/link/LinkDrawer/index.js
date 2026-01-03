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
exports.LinkDrawer = void 0;
const react_1 = __importStar(require("react"));
const react_i18next_1 = require("react-i18next");
const Drawer_1 = require("../../../../../../elements/Drawer");
const Form_1 = __importDefault(require("../../../../../Form"));
const Submit_1 = __importDefault(require("../../../../../Submit"));
const __1 = __importDefault(require("../../../.."));
const RenderFields_1 = __importDefault(require("../../../../../RenderFields"));
const useHotkey_1 = __importDefault(require("../../../../../../../hooks/useHotkey"));
const EditDepth_1 = require("../../../../../../utilities/EditDepth");
require("./index.scss");
const baseClass = 'rich-text-link-edit-modal';
const LinkDrawer = ({ handleModalSubmit, initialState, fieldSchema, drawerSlug, }) => {
    const { t } = (0, react_i18next_1.useTranslation)('fields');
    return (react_1.default.createElement(Drawer_1.Drawer, { slug: drawerSlug, className: baseClass, title: t('editLink') },
        react_1.default.createElement(Form_1.default, { onSubmit: handleModalSubmit, initialState: initialState, configFieldsSchema: fieldSchema },
            react_1.default.createElement(RenderFields_1.default, { fieldTypes: __1.default, readOnly: false, fieldSchema: fieldSchema, forceRender: true }),
            react_1.default.createElement(LinkSubmit, null))));
};
exports.LinkDrawer = LinkDrawer;
const LinkSubmit = () => {
    const { t } = (0, react_i18next_1.useTranslation)('fields');
    const ref = (0, react_1.useRef)(null);
    const editDepth = (0, EditDepth_1.useEditDepth)();
    (0, useHotkey_1.default)({ keyCodes: ['s'], cmdCtrlKey: true, editDepth }, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ref === null || ref === void 0 ? void 0 : ref.current) {
            ref.current.click();
        }
    });
    return (react_1.default.createElement(Submit_1.default, { ref: ref }, t('general:submit')));
};
//# sourceMappingURL=index.js.map