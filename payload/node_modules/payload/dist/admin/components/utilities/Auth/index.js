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
exports.useAuth = exports.AuthProvider = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const modal_1 = require("@faceless-ui/modal");
const react_i18next_1 = require("react-i18next");
const react_toastify_1 = require("react-toastify");
const Config_1 = require("../Config");
const api_1 = require("../../../api");
const useDebounce_1 = __importDefault(require("../../../hooks/useDebounce"));
const Context = (0, react_1.createContext)({});
const maxTimeoutTime = 2147483647;
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)();
    const [tokenInMemory, setTokenInMemory] = (0, react_1.useState)();
    const [tokenExpiration, setTokenExpiration] = (0, react_1.useState)();
    const { pathname } = (0, react_router_dom_1.useLocation)();
    const { push } = (0, react_router_dom_1.useHistory)();
    const config = (0, Config_1.useConfig)();
    const { admin: { user: userSlug, inactivityRoute: logoutInactivityRoute, autoLogin, }, serverURL, routes: { admin, api, }, } = config;
    const exp = tokenExpiration;
    const [permissions, setPermissions] = (0, react_1.useState)();
    const { i18n } = (0, react_i18next_1.useTranslation)();
    const { openModal, closeAllModals } = (0, modal_1.useModal)();
    const [lastLocationChange, setLastLocationChange] = (0, react_1.useState)(0);
    const debouncedLocationChange = (0, useDebounce_1.default)(lastLocationChange, 10000);
    const id = user === null || user === void 0 ? void 0 : user.id;
    const redirectToInactivityRoute = (0, react_1.useCallback)(() => {
        if (window.location.pathname.startsWith(admin)) {
            const redirectParam = `?redirect=${encodeURIComponent(window.location.pathname.replace(admin, ''))}`;
            push(`${admin}${logoutInactivityRoute}${redirectParam}`);
        }
        else {
            push(`${admin}${logoutInactivityRoute}`);
        }
        closeAllModals();
    }, [push, admin, logoutInactivityRoute, closeAllModals]);
    const revokeTokenAndExpire = (0, react_1.useCallback)(() => {
        setTokenInMemory(undefined);
        setTokenExpiration(undefined);
    }, []);
    const setTokenAndExpiration = (0, react_1.useCallback)((json) => {
        const token = (json === null || json === void 0 ? void 0 : json.token) || (json === null || json === void 0 ? void 0 : json.refreshedToken);
        if (token && (json === null || json === void 0 ? void 0 : json.exp)) {
            setTokenInMemory(token);
            setTokenExpiration(json.exp);
        }
        else {
            revokeTokenAndExpire();
        }
    }, [revokeTokenAndExpire]);
    const refreshCookie = (0, react_1.useCallback)((forceRefresh) => {
        const now = Math.round((new Date()).getTime() / 1000);
        const remainingTime = (typeof exp === 'number' ? exp : 0) - now;
        if (forceRefresh || (exp && remainingTime < 120)) {
            setTimeout(async () => {
                try {
                    const request = await api_1.requests.post(`${serverURL}${api}/${userSlug}/refresh-token`, {
                        headers: {
                            'Accept-Language': i18n.language,
                        },
                    });
                    if (request.status === 200) {
                        const json = await request.json();
                        setUser(json.user);
                        setTokenAndExpiration(json);
                    }
                    else {
                        setUser(null);
                        redirectToInactivityRoute();
                    }
                }
                catch (e) {
                    react_toastify_1.toast.error(e.message);
                }
            }, 1000);
        }
    }, [serverURL, api, userSlug, i18n, exp, redirectToInactivityRoute, setTokenAndExpiration]);
    const refreshCookieAsync = (0, react_1.useCallback)(async (skipSetUser) => {
        try {
            const request = await api_1.requests.post(`${serverURL}${api}/${userSlug}/refresh-token`, {
                headers: {
                    'Accept-Language': i18n.language,
                },
            });
            if (request.status === 200) {
                const json = await request.json();
                if (!skipSetUser) {
                    setUser(json.user);
                    setTokenAndExpiration(json);
                }
                return json.user;
            }
            setUser(null);
            redirectToInactivityRoute();
            return null;
        }
        catch (e) {
            react_toastify_1.toast.error(`Refreshing token failed: ${e.message}`);
            return null;
        }
    }, [serverURL, api, userSlug, i18n, redirectToInactivityRoute, setTokenAndExpiration]);
    const logOut = (0, react_1.useCallback)(() => {
        setUser(null);
        revokeTokenAndExpire();
        api_1.requests.post(`${serverURL}${api}/${userSlug}/logout`);
    }, [serverURL, api, userSlug, revokeTokenAndExpire]);
    const refreshPermissions = (0, react_1.useCallback)(async () => {
        try {
            const request = await api_1.requests.get(`${serverURL}${api}/access`, {
                headers: {
                    'Accept-Language': i18n.language,
                },
            });
            if (request.status === 200) {
                const json = await request.json();
                setPermissions(json);
            }
            else {
                throw new Error(`Fetching permissions failed with status code ${request.status}`);
            }
        }
        catch (e) {
            react_toastify_1.toast.error(`Refreshing permissions failed: ${e.message}`);
        }
    }, [serverURL, api, i18n]);
    const fetchFullUser = react_1.default.useCallback(async () => {
        try {
            const request = await api_1.requests.get(`${serverURL}${api}/${userSlug}/me`, {
                headers: {
                    'Accept-Language': i18n.language,
                },
            });
            if (request.status === 200) {
                const json = await request.json();
                if (json === null || json === void 0 ? void 0 : json.user) {
                    setUser(json.user);
                    if (json === null || json === void 0 ? void 0 : json.token) {
                        setTokenAndExpiration(json);
                    }
                }
                else if (autoLogin && autoLogin.prefillOnly !== true) {
                    // auto log-in with the provided autoLogin credentials. This is used in dev mode
                    // so you don't have to log in over and over again
                    const autoLoginResult = await api_1.requests.post(`${serverURL}${api}/${userSlug}/login`, {
                        body: JSON.stringify({
                            email: autoLogin.email,
                            password: autoLogin.password,
                        }),
                        headers: {
                            'Accept-Language': i18n.language,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (autoLoginResult.status === 200) {
                        const autoLoginJson = await autoLoginResult.json();
                        setUser(autoLoginJson.user);
                        if (autoLoginJson === null || autoLoginJson === void 0 ? void 0 : autoLoginJson.token) {
                            setTokenAndExpiration(autoLoginJson);
                        }
                    }
                    else {
                        setUser(null);
                        revokeTokenAndExpire();
                    }
                }
                else {
                    setUser(null);
                    revokeTokenAndExpire();
                }
            }
        }
        catch (e) {
            react_toastify_1.toast.error(`Fetching user failed: ${e.message}`);
        }
    }, [serverURL, api, userSlug, i18n, autoLogin, setTokenAndExpiration, revokeTokenAndExpire]);
    // On mount, get user and set
    (0, react_1.useEffect)(() => {
        fetchFullUser();
    }, [fetchFullUser]);
    // When location changes, refresh cookie
    (0, react_1.useEffect)(() => {
        if (id) {
            refreshCookie();
        }
    }, [debouncedLocationChange, refreshCookie, id]);
    (0, react_1.useEffect)(() => {
        setLastLocationChange(Date.now());
    }, [pathname]);
    // When user changes, get new access
    (0, react_1.useEffect)(() => {
        if (id) {
            refreshPermissions();
        }
    }, [i18n, id, api, serverURL, refreshPermissions]);
    (0, react_1.useEffect)(() => {
        let reminder;
        const now = Math.round((new Date()).getTime() / 1000);
        const remainingTime = typeof exp === 'number' ? exp - now : 0;
        if (remainingTime > 0) {
            reminder = setTimeout(() => {
                openModal('stay-logged-in');
            }, Math.max(Math.min((remainingTime - 60) * 1000, maxTimeoutTime)));
        }
        return () => {
            if (reminder)
                clearTimeout(reminder);
        };
    }, [exp, openModal]);
    (0, react_1.useEffect)(() => {
        let forceLogOut;
        const now = Math.round((new Date()).getTime() / 1000);
        const remainingTime = typeof exp === 'number' ? exp - now : 0;
        if (remainingTime > 0) {
            forceLogOut = setTimeout(() => {
                setUser(null);
                revokeTokenAndExpire();
                redirectToInactivityRoute();
            }, Math.max(Math.min(remainingTime * 1000, maxTimeoutTime), 0));
        }
        return () => {
            if (forceLogOut)
                clearTimeout(forceLogOut);
        };
    }, [exp, closeAllModals, i18n, redirectToInactivityRoute, revokeTokenAndExpire]);
    return (react_1.default.createElement(Context.Provider, { value: {
            user,
            setUser,
            logOut,
            refreshCookie,
            refreshCookieAsync,
            refreshPermissions,
            permissions,
            token: tokenInMemory,
            fetchFullUser,
        } }, children));
};
exports.AuthProvider = AuthProvider;
const useAuth = () => (0, react_1.useContext)(Context);
exports.useAuth = useAuth;
//# sourceMappingURL=index.js.map