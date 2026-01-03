"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slate_1 = require("slate");
const slate_react_1 = require("slate-react");
const isActive_1 = __importDefault(require("./isActive"));
const isWithinListItem_1 = require("./isWithinListItem");
const toggleElement = (editor, format, blockType = 'type') => {
    const isActive = (0, isActive_1.default)(editor, format, blockType);
    const formatByBlockType = {
        [blockType]: format,
    };
    const isWithinLI = (0, isWithinListItem_1.isWithinListItem)(editor);
    if (isActive) {
        formatByBlockType[blockType] = undefined;
    }
    if (!isActive && isWithinLI && blockType !== 'textAlign') {
        const block = { type: 'li', children: [] };
        slate_1.Transforms.wrapNodes(editor, block, {
            at: slate_1.Editor.unhangRange(editor, editor.selection),
        });
    }
    slate_1.Transforms.setNodes(editor, { [blockType]: formatByBlockType[blockType] }, {
        at: slate_1.Editor.unhangRange(editor, editor.selection),
    });
    slate_react_1.ReactEditor.focus(editor);
};
exports.default = toggleElement;
//# sourceMappingURL=toggle.js.map