"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowActions = void 0;
const react_1 = __importDefault(require("react"));
const modal_1 = require("@faceless-ui/modal");
const ArrayAction_1 = require("../../../elements/ArrayAction");
const useDrawerSlug_1 = require("../../../elements/Drawer/useDrawerSlug");
const BlocksDrawer_1 = require("./BlocksDrawer");
const RowActions = (props) => {
    const { addRow, duplicateRow, removeRow, moveRow, labels, blocks, rowIndex, rowCount, blockType, hasMaxRows, } = props;
    const { openModal, closeModal } = (0, modal_1.useModal)();
    const drawerSlug = (0, useDrawerSlug_1.useDrawerSlug)('blocks-drawer');
    const [indexToAdd, setIndexToAdd] = react_1.default.useState(null);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(BlocksDrawer_1.BlocksDrawer, { drawerSlug: drawerSlug, blocks: blocks, addRow: (_, rowBlockType) => {
                if (typeof addRow === 'function') {
                    addRow(indexToAdd, rowBlockType);
                }
                closeModal(drawerSlug);
            }, addRowIndex: rowIndex, labels: labels }),
        react_1.default.createElement(ArrayAction_1.ArrayAction, { rowCount: rowCount, addRow: (index) => {
                setIndexToAdd(index);
                openModal(drawerSlug);
            }, duplicateRow: () => duplicateRow(rowIndex, blockType), moveRow: moveRow, removeRow: removeRow, index: rowIndex, hasMaxRows: hasMaxRows })));
};
exports.RowActions = RowActions;
//# sourceMappingURL=RowActions.js.map