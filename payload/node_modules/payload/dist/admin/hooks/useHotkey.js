"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-shadow */
const react_1 = require("react");
const modal_1 = require("@faceless-ui/modal");
const setsAreEqual_1 = require("../utilities/setsAreEqual");
// Required to be outside of hook, else debounce would be necessary
// and then one could not prevent the default behaviour.
// It maps the pressed keys with the time they were pressed, in order to implement a maximum time
// for the user to press the next key in the sequence
// This is necessary to prevent a bug where the keyup event, which unsets the key as pressed
// is not fired when the window is not focused.
// When the user then comes back to the window, the key is still registered as pressed, even though it's not.
const pressedKeys = new Map([]);
const map = {
    metaleft: 'meta',
    metaright: 'meta',
    osleft: 'meta',
    osright: 'meta',
    shiftleft: 'shift',
    shiftright: 'shift',
    ctrlleft: 'ctrl',
    ctrlright: 'ctrl',
    controlleft: 'ctrl',
    controlright: 'ctrl',
    altleft: 'alt',
    altright: 'alt',
    escape: 'esc',
};
const stripKey = (key) => {
    return (map[key.toLowerCase()] || key).trim()
        .toLowerCase()
        .replace('key', '');
};
const pushToKeys = (code) => {
    const key = stripKey(code);
    // There is a weird bug with macos that if the keys are not cleared they remain in the
    // pressed keys set.
    if (key === 'meta') {
        pressedKeys.forEach((time, pressedKey) => pressedKey !== 'meta' && pressedKeys.delete(pressedKey));
    }
    pressedKeys.set(key, Date.now());
};
const removeFromKeys = (code) => {
    const key = stripKey(code);
    // There is a weird bug with macos that if the keys are not cleared they remain in the
    // pressed keys set.
    if (key === 'meta') {
        pressedKeys.clear();
    }
    pressedKeys.delete(key);
};
/**
 * Hook function to work with hotkeys.
 * @param param0.keyCode {string[]} The keys to listen for (`Event.code` without `'Key'` and lowercased)
 * @param param0.cmdCtrlKey {boolean} Whether Ctrl on windows or Cmd on mac must be pressed
 * @param param0.editDepth {boolean} This ensures that the hotkey is only triggered for the most top-level drawer in case there are nested drawers
 * @param func The callback function
 */
const useHotkey = (options, func) => {
    const { keyCodes, cmdCtrlKey, editDepth } = options;
    const { modalState } = (0, modal_1.useModal)();
    const keydown = (0, react_1.useCallback)((event) => {
        var _a, _b, _c;
        const e = ((_a = event.detail) === null || _a === void 0 ? void 0 : _a.key) ? event.detail : event;
        if (e.key === undefined) {
            // Autofill events, or other synthetic events, can be ignored
            return;
        }
        // Filter out pressed keys which have been pressed > 3 seconds ago
        pressedKeys.forEach((time, key) => {
            if (Date.now() - time > 3000) {
                pressedKeys.delete(key);
            }
        });
        if (e.code)
            pushToKeys(e.code);
        // Check for Mac and iPad
        const hasCmd = window.navigator.userAgent.includes('Mac OS X');
        const pressedWithoutModifier = [...pressedKeys.keys()].filter((key) => !['meta', 'ctrl', 'alt', 'shift'].includes(key));
        // Check whether arrays contain the same values (regardless of number of occurrences)
        if ((0, setsAreEqual_1.setsAreEqual)(new Set(pressedWithoutModifier), new Set(keyCodes))
            && (!cmdCtrlKey || (hasCmd && pressedKeys.has('meta')) || (!hasCmd && e.ctrlKey))) {
            // get the maximum edit depth by counting the number of open drawers. modalState is and object which contains the state of all drawers.
            const maxEditDepth = (_c = ((_b = Object.keys(modalState).filter((key) => { var _a; return (_a = modalState[key]) === null || _a === void 0 ? void 0 : _a.isOpen; })) === null || _b === void 0 ? void 0 : _b.length) + 1) !== null && _c !== void 0 ? _c : 1;
            if (maxEditDepth !== editDepth) {
                // We only want to execute the hotkey from the most top-level drawer / edit depth.
                return;
            }
            // execute the function associated with the maximum edit depth
            func(e);
        }
    }, [keyCodes, cmdCtrlKey, editDepth, modalState, func]);
    const keyup = (0, react_1.useCallback)((e) => {
        if (e.code)
            removeFromKeys(e.code);
    }, []);
    (0, react_1.useEffect)(() => {
        document.addEventListener('keydown', keydown, false);
        document.addEventListener('bypassKeyDown', keydown, false); // this is called if the keydown event's propagation is stopped by react-select
        document.addEventListener('keyup', keyup, false);
        return () => {
            document.removeEventListener('keydown', keydown);
            document.removeEventListener('bypassKeyDown', keydown);
            document.removeEventListener('keyup', keyup);
        };
    }, [keydown, keyup]);
};
exports.default = useHotkey;
//# sourceMappingURL=useHotkey.js.map