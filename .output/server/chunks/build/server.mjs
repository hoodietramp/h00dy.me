import { version, unref, inject, defineComponent, ref, provide, createElementBlock, useSSRContext, createVNode, resolveDynamicComponent, withCtx, openBlock, createBlock, createApp, effectScope, reactive, hasInjectionContext, computed, mergeProps, getCurrentInstance, watch, isRef, isReactive, toRaw, onErrorCaptured, onServerPrefetch, toRef, h, isReadonly, getCurrentScope, onScopeDispose, nextTick, markRaw, toRefs, isShallow, defineAsyncComponent } from 'vue';
import { $ as $fetch, w as withQuery, l as hasProtocol, p as parseURL, m as isScriptProtocol, n as joinURL, o as sanitizeStatusCode, q as createHooks, h as createError$1, r as isEqual, t as toRouteMatcher, v as createRouter, x as defu, y as stringifyParsedURL, z as stringifyQuery, A as parseQuery } from '../runtime.mjs';
import { b as baseURL } from '../routes/renderer.mjs';
import { getActiveHead } from 'unhead';
import { defineHeadPlugin } from '@unhead/shared';
import { ssrRenderList, ssrRenderAttr, ssrRenderVNode, ssrRenderComponent, ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderSlot, ssrRenderSuspense } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';

function createContext$1(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers$1.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers$1.delete(onLeave);
      }
    }
  };
}
function createNamespace$1(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext$1({ ...defaultOpts, ...opts });
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey$2 = "__unctx__";
const defaultNamespace = _globalThis$1[globalKey$2] || (_globalThis$1[globalKey$2] = createNamespace$1());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey$1 = "__unctx_async_handlers__";
const asyncHandlers$1 = _globalThis$1[asyncHandlersKey$1] || (_globalThis$1[asyncHandlersKey$1] = /* @__PURE__ */ new Set());

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
const nuxtAppCtx = /* @__PURE__ */ getContext("nuxt-app", {
  asyncContext: false
});
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.11.2";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: reactive({
      data: {},
      state: {},
      once: /* @__PURE__ */ new Set(),
      _errors: {},
      ...{ serverRendered: true }
    }),
    static: {
      data: {}
    },
    runWithContext: (fn) => nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn)),
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    _payloadRevivers: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
      nuxtApp.ssrContext._payloadReducers = {};
      nuxtApp.payload.path = nuxtApp.ssrContext.url;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b;
  const resolvedPlugins = [];
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin2.dependsOn) == null ? void 0 : _a2.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.includes(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.push(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
// @__NO_SIDE_EFFECTS__
function tryUseNuxtApp() {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || nuxtAppCtx.tryUse();
  return nuxtAppInstance || null;
}
// @__NO_SIDE_EFFECTS__
function useNuxtApp() {
  const nuxtAppInstance = /* @__PURE__ */ tryUseNuxtApp();
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return (/* @__PURE__ */ useNuxtApp()).$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = /* @__PURE__ */ useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, (/* @__PURE__ */ useNuxtApp())._route);
  }
  return (/* @__PURE__ */ useNuxtApp())._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if ((/* @__PURE__ */ useNuxtApp())._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : withQuery(to.path || "/", to.query || {}) + (to.hash || "");
  const isExternal = (options == null ? void 0 : options.external) || hasProtocol(toPath, { acceptRelative: true });
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const protocol = parseURL(toPath).protocol;
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = /* @__PURE__ */ useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(/"/g, "%22");
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: location2 }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef((/* @__PURE__ */ useNuxtApp()).payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = /* @__PURE__ */ useNuxtApp();
    const error2 = useError();
    if (false)
      ;
    error2.value = error2.value || nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
version.startsWith("3");
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2, lastKey = "") {
  if (ref2 instanceof Promise)
    return ref2;
  const root = resolveUnref(ref2);
  if (!ref2 || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r, lastKey));
  if (typeof root === "object") {
    return Object.fromEntries(
      Object.entries(root).map(([k, v]) => {
        if (k === "titleTemplate" || k.startsWith("on"))
          return [k, unref(v)];
        return [k, resolveUnrefHeadInput(v, k)];
      })
    );
  }
  return root;
}
defineHeadPlugin({
  hooks: {
    "entries:resolve": function(ctx) {
      for (const entry2 of ctx.entries)
        entry2.resolvedInput = resolveUnrefHeadInput(entry2.input);
    }
  }
});
const headSymbol = "usehead";
const _global = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey$1 = "__unhead_injection_handler__";
function setHeadInjectionHandler(handler) {
  _global[globalKey$1] = handler;
}
function injectHead() {
  if (globalKey$1 in _global) {
    return _global[globalKey$1]();
  }
  const head = inject(headSymbol);
  if (!head && "production" !== "production")
    console.warn("Unhead is missing Vue context, falling back to shared context. This may have unexpected results.");
  return head || getActiveHead();
}
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    setHeadInjectionHandler(
      // need a fresh instance of the nuxt app to avoid parallel requests interfering with each other
      () => (/* @__PURE__ */ useNuxtApp()).vueApp._context.provides.usehead
    );
    nuxtApp.vueApp.use(head);
  }
});
async function getRouteRules(url) {
  {
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(url).reverse());
  }
}
function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
_globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = parseURL(fullPath.toString());
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: {},
    name: void 0,
    matched: [],
    redirectedFrom: void 0,
    meta: {},
    href: fullPath
  };
}
const router_CaKIoANnI2 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      error: []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false)
          ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          var _a;
          const route2 = router.resolve(props.to);
          return props.custom ? (_a = slots.default) == null ? void 0 : _a.call(slots, { href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        var _a;
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
        }
        nuxtApp._processingMiddleware = true;
        if (!((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext)) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          {
            const routeRules = await nuxtApp.runWithContext(() => getRouteRules(to.path));
            if (routeRules.appMiddleware) {
              for (const key in routeRules.appMiddleware) {
                const guard = nuxtApp._middleware.named[key];
                if (!guard) {
                  return;
                }
                if (routeRules.appMiddleware[key]) {
                  middlewareEntries.add(guard);
                } else {
                  middlewareEntries.delete(guard);
                }
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
const isVue2 = false;
/*!
 * pinia v2.1.7
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */
let activePinia;
const setActivePinia = (pinia) => activePinia = pinia;
const piniaSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function isPlainObject(o) {
  return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
}
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      setActivePinia(pinia);
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        toBeInstalled.forEach((plugin2) => _p.push(plugin2));
        toBeInstalled = [];
      }
    },
    use(plugin2) {
      if (!this._a && !isVue2) {
        toBeInstalled.push(plugin2);
      } else {
        _p.push(plugin2);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia;
}
const noop = () => {
};
function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
      onCleanup();
    }
  };
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription);
  }
  return removeSubscription;
}
function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((callback) => {
    callback(...args);
  });
}
const fallbackRunWithContext = (fn) => fn();
function mergeReactiveObjects(target, patchToApply) {
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value));
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach(target.add, target);
  }
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key))
      continue;
    const subPatch = patchToApply[key];
    const targetValue = target[key];
    if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !isRef(subPatch) && !isReactive(subPatch)) {
      target[key] = mergeReactiveObjects(targetValue, subPatch);
    } else {
      target[key] = subPatch;
    }
  }
  return target;
}
const skipHydrateSymbol = (
  /* istanbul ignore next */
  Symbol()
);
function shouldHydrate(obj) {
  return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
}
const { assign } = Object;
function isComputed(o) {
  return !!(isRef(o) && o.effect);
}
function createOptionsStore(id, options, pinia, hot) {
  const { state, actions, getters } = options;
  const initialState = pinia.state.value[id];
  let store;
  function setup() {
    if (!initialState && (!("production" !== "production") )) {
      {
        pinia.state.value[id] = state ? state() : {};
      }
    }
    const localState = toRefs(pinia.state.value[id]);
    return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia);
        const store2 = pinia._s.get(id);
        return getters[name].call(store2, store2);
      }));
      return computedGetters;
    }, {}));
  }
  store = createSetupStore(id, setup, options, pinia, hot, true);
  return store;
}
function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
  let scope;
  const optionsForPlugin = assign({ actions: {} }, options);
  const $subscribeOptions = {
    deep: true
    // flush: 'post',
  };
  let isListening;
  let isSyncListening;
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia.state.value[$id];
  if (!isOptionsStore && !initialState && (!("production" !== "production") )) {
    {
      pinia.state.value[$id] = {};
    }
  }
  ref({});
  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;
    if (typeof partialStateOrMutator === "function") {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }
    const myListenerId = activeListener = Symbol();
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });
    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }
  const $reset = isOptionsStore ? function $reset2() {
    const { state } = options;
    const newState = state ? state() : {};
    this.$patch(($state) => {
      assign($state, newState);
    });
  } : (
    /* istanbul ignore next */
    noop
  );
  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }
  function wrapAction(name, action) {
    return function() {
      setActivePinia(pinia);
      const args = Array.from(arguments);
      const afterCallbackList = [];
      const onErrorCallbackList = [];
      function after(callback) {
        afterCallbackList.push(callback);
      }
      function onError(callback) {
        onErrorCallbackList.push(callback);
      }
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      });
      let ret;
      try {
        ret = action.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }
      if (ret instanceof Promise) {
        return ret.then((value) => {
          triggerSubscriptions(afterCallbackList, value);
          return value;
        }).catch((error) => {
          triggerSubscriptions(onErrorCallbackList, error);
          return Promise.reject(error);
        });
      }
      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };
  }
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options2 = {}) {
      const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
      const stopWatcher = scope.run(() => watch(() => pinia.state.value[$id], (state) => {
        if (options2.flush === "sync" ? isSyncListening : isListening) {
          callback({
            storeId: $id,
            type: MutationType.direct,
            events: debuggerEvents
          }, state);
        }
      }, assign({}, $subscribeOptions, options2)));
      return removeSubscription;
    },
    $dispose
  };
  const store = reactive(partialStore);
  pinia._s.set($id, store);
  const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
  const setupStore = runWithContext(() => pinia._e.run(() => (scope = effectScope()).run(setup)));
  for (const key in setupStore) {
    const prop = setupStore[key];
    if (isRef(prop) && !isComputed(prop) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        {
          pinia.state.value[$id][key] = prop;
        }
      }
    } else if (typeof prop === "function") {
      const actionValue = wrapAction(key, prop);
      {
        setupStore[key] = actionValue;
      }
      optionsForPlugin.actions[key] = prop;
    } else ;
  }
  {
    assign(store, setupStore);
    assign(toRaw(store), setupStore);
  }
  Object.defineProperty(store, "$state", {
    get: () => pinia.state.value[$id],
    set: (state) => {
      $patch(($state) => {
        assign($state, state);
      });
    }
  });
  pinia._p.forEach((extender) => {
    {
      assign(store, scope.run(() => extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })));
    }
  });
  if (initialState && isOptionsStore && options.hydrate) {
    options.hydrate(store.$state, initialState);
  }
  isListening = true;
  isSyncListening = true;
  return store;
}
function defineStore(idOrOptions, setup, setupOptions) {
  let id;
  let options;
  const isSetupStore = typeof setup === "function";
  if (typeof idOrOptions === "string") {
    id = idOrOptions;
    options = isSetupStore ? setupOptions : setup;
  } else {
    options = idOrOptions;
    id = idOrOptions.id;
  }
  function useStore(pinia, hot) {
    const hasContext = hasInjectionContext();
    pinia = // in test mode, ignore the argument provided as we can always retrieve a
    // pinia instance with getActivePinia()
    (pinia) || (hasContext ? inject(piniaSymbol, null) : null);
    if (pinia)
      setActivePinia(pinia);
    pinia = activePinia;
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }
    const store = pinia._s.get(id);
    return store;
  }
  useStore.$id = id;
  return useStore;
}
function definePayloadReducer(name, reduce) {
  {
    (/* @__PURE__ */ useNuxtApp()).ssrContext._payloadReducers[name] = reduce;
  }
}
const clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  // eslint-disable-next-line vue/require-prop-types
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots, attrs }) {
    const mounted = ref(false);
    provide(clientOnlySymbol, true);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const plugin = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
  setActivePinia(pinia);
  {
    nuxtApp.payload.pinia = pinia.state.value;
  }
  return {
    provide: {
      pinia
    }
  };
});
const reducers = {
  NuxtError: (data) => isNuxtError(data) && data.toJSON(),
  EmptyShallowRef: (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  EmptyRef: (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  ShallowRef: (data) => isRef(data) && isShallow(data) && data.value,
  ShallowReactive: (data) => isReactive(data) && isShallow(data) && toRaw(data),
  Ref: (data) => isRef(data) && data.value,
  Reactive: (data) => isReactive(data) && toRaw(data)
};
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const reducer in reducers) {
      definePayloadReducer(reducer, reducers[reducer]);
    }
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_KgADcZ0jPj,
  router_CaKIoANnI2,
  plugin,
  revive_payload_server_eJ33V7gbc6,
  components_plugin_KR1HBZs4kY
];
const bio = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAIVBMVEUAAACAgIDAwMAAAAD///8AgIAA//8AAIAAAP8A/wAAgACZBxulAAAAAXRSTlMAQObYZgAAAAFiS0dEBI9o2VEAAAAHdElNRQfiBBMBJCt84jxJAAAA5UlEQVQ4y62TyxHCIBCGoYQFGghJASBagJEGMk6sxbsXW/Dq0SpNsuSxPEad8ePGNz9kNwtjExwobEZoApiwz+l+tQjlCTAL3kYnfSFqt6KI6FeouJTFGQ86JKLDi2PR9x3WkIjrfeSWCuxWnQrsyumPwpVEUnlZhNamotTE38VmpohotkMyCGfywyChzgsrZHZyJVQomKNYASggpkLBfQwEEd09zugn8XguL2NArOI1i2m4dx+PUjoVJhvQFgON9GS1lcXAcU+XBlcIQBzwIVD4pPD8VdpBbHmmCJP/FyHApIvBwBu9bp7SZvn+ewAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNC0xOVQwMTozNjo0My0wNDowMNV8Hl4AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDQtMTlUMDE6MzY6NDMtMDQ6MDCkIabiAAAAAElFTkSuQmCC";
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: bio
});
const _imports_1$4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfiBhgXBwzSK/XgAAAAjElEQVRIx+2VQQrAIAwE1+K/oz9rX5ZeiopaTazFHronETMOIRCDK44hiDP5jY1H6pZ7gJEhNsm/iQHAjwBUIJSAEmF15aEBoRcqAwKDwdiTu8LAdxB5bP9JOwoDkgFeNKjD5xvc2wh7oLVRGNSR8w2+PImr54BGAP8cyLLeQL1YGgbHECDuWtF6LytPTdMhXzC2L6sAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MDc6MTItMDQ6MDDinXh7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjA3OjEyLTA0OjAwk8DAxwAAAABJRU5ErkJggg==";
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _imports_1$4
});
const _imports_0$5 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAGFBMVEUAAACZmQAAAAD4+Pj//5nMzGb/zJn////5no2yAAAAAXRSTlMAQObYZgAAAAFiS0dEBxZhiOsAAAAHdElNRQfiBhgXARMJeV+TAAABE0lEQVQ4y82TzQ3CMAyFywhtxb1iA1QWQLJ858AGlvcfAfs5aRMTceapaoVfPv9FTNMPzdDyFb/s0H3LxkqhjFwexXhuYyAjB5CRE0jI9X3qNVfZkXUfautSFQkzL9nwIAlJNixExKSJELGgQJlge9jzJQPnzeoJL4uPDAiORB3B3pM34J52hADg1BVXE3ZbA785sCZVBULt5BwtAUuTCypEiSNVNCmM8UTTrsxTL66kzRyOYOGoXYuXRB40wLrVbkAUttdRg33dFL16Lj264siF9OThZkBcKqFVrYSfjWVo7MuIdkBcNoBzV1K2YQQ+Gqk8HPtGYXZIK1EuNJwyIGagGE2RSNHudR5qmW5jff2F/1wfr4rjk5A1shsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MDE6MTktMDQ6MDDthFzGAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjAxOjE5LTA0OjAwnNnkegAAAABJRU5ErkJggg==";
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _imports_0$5
});
const mail = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAIVBMVEUAAACAgIDAwMAAgID///8AgAAAAP+AAAAAAAD/AAAAAIBSZDZVAAAAAXRSTlMAQObYZgAAAAFiS0dEBI9o2VEAAAAHdElNRQfiBhgXETDh3DywAAABh0lEQVQ4y23TsWrDMBAGYPsNqmCC6CbZBa8NNHuEGrq24FK81tbgsXTJ5pQMmUsgT+Bg/JQ9SSdbqn2Q5f/y54QjR5Edoj8wd1Ew8d2KRISnafpI/JzELOGEb8Sb4IUvKyK0PGRpAeMJhEaei20NMu1JJEqhdOV1gq9RdKNoR7j+jqLnY4TD4duXrh0b14tEoQBl7zes/GgoEGLbAKEAT9AoWwRhGlLmAPW0JEmkuPhQlvZcq0Ti5Lij6yfYO/jcQqN0P+WDqovOLIl5ADel8FhxamCPUDZK1baxsbDH5YNSTdBwcFNN0y3Bu1LDYIDMGwaIDAAKN9MgMmyslW1AHsJxbRvwp4VwPt4PQ29vSFL5cHqxwCVLqsrBkZ52FCHz4XzaEWoO5cA8rBy+T/6Dfr65zgF6c2+50MCBRKbzEAQI5gCtByCYE9rbV4BnmawyziXmhLYORCYBGHFgbsKZa+FiBigLYIVPQMf3RssEU+6EzXIUNs+tsIXcCFvKtbDFHIQt5yBB/ge5pdMZ3n2ecAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wNi0yNFQyMzoxNzo0OC0wNDowMM+D9pEAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDYtMjRUMjM6MTc6NDgtMDQ6MDC+3k4tAAAAAElFTkSuQmCC";
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: mail
});
const _imports_0$4 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAJ1BMVEUAAACAgIDAwMD///8AAAAAgICAAICAgAAAAICAAAAA//8AAP//AACkLexpAAAAAXRSTlMAQObYZgAAAAFiS0dEAxEMTPIAAAAHdElNRQfiBBMBIhJ1vRPHAAABzklEQVQ4y9WTv2sbMRTHz6XZ82T5rFWqS4o79bxlspznq0MnG58T8BQIqVd3CAQyREFptGYqXQ+83Jyh0D+g/1b143S2afeQ73DD+/DRk550SfLyAYD/ld/wLBO0CJlt6y3SFkJwCSHYAJKeucy7Puv1sK4fZF2Ne6nJAf8qdsOPaAAs/bYHCAmLtZgmscRDjjxoCzpZ4b9NWhkjWpn8OmRxHkFbgOpNmKwbm8YgnFGCD4/C2NwDorq5mbszEgFG9XIlJnYckqKClTF6GAzojB/F5N1gI1ESuri6utS1Ac7oVxtE4LntAeYwGMQZdikr9FZFsZTsbmv47agsHZN+8Qxqa7jQ0ad8KsTmN1HB6FgjglmWlctRNL589ndB73lOBmVZjGoD4pCUA1W1PIlGELrUgawqi5PYox6VB/09I4J1PuuX5XPcFVgDwA4X4XtHVB81uWsMjkjsp8sk4b/kh8OmBz398yQEk2v3YghNGoP+uLXrcQ0p4gUfJk2PAATDCwBOkx3j9KcDnDVXW/fwzR0BjXq4Y/jt+kdNJTQGhJPzMDDJ/bsCa+hwcp4v0nRxOfJGQtGYONxxNTh+P5fUg7euYkJQTadT1Ntf59XkL7hXsT3cCr1SAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA0LTE5VDAxOjM0OjE4LTA0OjAwm26U/QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNC0xOVQwMTozNDoxOC0wNDowMOozLEEAAAAASUVORK5CYII=";
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _imports_0$4
});
const _imports_6 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAOVBMVEUAAACGhoYiIiL/+/DAwMD4+PiAgAD//5nMzGaZmQDn59YAM5mgoKQAMzMAAAD/zJkICAgzMwD///8PLrXJAAAAAXRSTlMAQObYZgAAAAFiS0dEEnu8bAAAAAAHdElNRQfiBhgXAzXpQrjsAAABbklEQVRIx8WU63KFIAyEtVoj1rr1/V+2QAImXBztn64zRxz3I5vgnGH4N40fL/3T/IoYp+kVMX5Or4iw/xsi+W+J5dLlvyEWSlq1v0t4/8py1t8hav/2dUsstX/XNbi3BtD0B8L5l8t3BRi/ClUTDBT+XTElEYGGf7c1LFD6NxssEAZw48YKVvHP8hTlCQ24cWZ5G//kRVQkBHBPxEQE3PRAxMTBAHUFucH3yDV6AOwahAjEGhUAY+QbYRXipxcJKlG4bgGwNZfwF5DbtgCKFTIWgJsxXQ3IImRifwlkX3pKodx8nAWAEpMJxZOAO86zrgANQvXtK5wtwA6HJBC4CQHamVISNdkGoF7n/LwCagD5eNMwoQ+OehXSvqZhGykT0K2wn/stIjUHm4tAl1AAVBNpAR6TxCqA8pujnIXNpAEhQOYLJb07oQDyB5fTX/mlRq9CagN6otQA9GlRmmbam58v4NmfmVPAcD7S8Bf9AlndNmHeYjB7AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA2LTI0VDIzOjAzOjUzLTA0OjAwyUvdTwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNi0yNFQyMzowMzo1My0wNDowMLgWZfMAAAAASUVORK5CYII=";
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: _imports_6
});
const _imports_1$3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAn1BMVEUEBARmmZkEBAT//////8zAwMD/+/Dn59aZmcxmzP+ZzP+Z///MzP/M7P/M//+myvCtqZDA3MCysrLj4+Pq6uozZjOZmWbx8fHd3d1mZjPMzJkAmQA5OTmGhoaWlpZmmQAzMwDX19dmzDMzZgAzADN3d3dCQkIzmQDMzDNmADPMzMyZAMxmM8wAZgBmmWb/zJn//5nv1sbMzGbMmWaZmQDRaygJAAAAAXRSTlMAQObYZgAAAAFiS0dEAxEMTPIAAAAHdElNRQfiBhoANySLuBaXAAABFklEQVQ4y72T2VaDMBRFKWUIN4RWEWpIK7GhUgSlYv//28wFB4YFPukOD1lrb84TGMbfs1rGNFbrWay1ZWPgzGDpsxSgX1qwBgsumTJYcIkHFKhPWcAY3egrEPTuTwAe+EAZ1Z5RffVwwR0s+F8L2xssCPr+AoB9GzIWBHdRDLADgr4X2Pew5RwXErE/hA9bgr4X8APwVD7SkB1Vtj/xJ4K+F8j8dE4Lzo7nSKhCiYi4wyDPZK6EfJapKJXMeDkOVCmkUCKTsoqqF/mqxoF+rSpUpZL68nap9RkHPG4SFPhoknoc1J8y0adBJkErm1a+I+Og6WjdNb7G8TiYMgzm+P6idt1xnZmg887Et4G9iGmYv/AP/+4HWvYoXh4iozkAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjZUMDA6NTU6MzYtMDQ6MDD6UapqAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI2VDAwOjU1OjM2LTA0OjAwiwwS1gAAAABJRU5ErkJggg==";
const _imports_2$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAGFBMVEUAAACZmQAAAAD4+Pj//5nMzGb/zJn////5no2yAAAAAXRSTlMAQObYZgAAAAFiS0dEBxZhiOsAAAAHdElNRQfiBhgXARMJeV+TAAABE0lEQVQ4y82TzQ3CMAyFywhtxb1iA1QWQLJ858AGlvcfAfs5aRMTceapaoVfPv9FTNMPzdDyFb/s0H3LxkqhjFwexXhuYyAjB5CRE0jI9X3qNVfZkXUfautSFQkzL9nwIAlJNixExKSJELGgQJlge9jzJQPnzeoJL4uPDAiORB3B3pM34J52hADg1BVXE3ZbA785sCZVBULt5BwtAUuTCypEiSNVNCmM8UTTrsxTL66kzRyOYOGoXYuXRB40wLrVbkAUttdRg33dFL16Lj264siF9OThZkBcKqFVrYSfjWVo7MuIdkBcNoBzV1K2YQQ+Gqk8HPtGYXZIK1EuNJwyIGagGE2RSNHudR5qmW5jff2F/1wfr4rjk5A1shsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MDE6MTktMDQ6MDDthFzGAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjAxOjE5LTA0OjAwnNnkegAAAABJRU5ErkJggg==";
const _imports_3$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfiBhgXBwzSK/XgAAAAjElEQVRIx+2VQQrAIAwE1+K/oz9rX5ZeiopaTazFHronETMOIRCDK44hiDP5jY1H6pZ7gJEhNsm/iQHAjwBUIJSAEmF15aEBoRcqAwKDwdiTu8LAdxB5bP9JOwoDkgFeNKjD5xvc2wh7oLVRGNSR8w2+PImr54BGAP8cyLLeQL1YGgbHECDuWtF6LytPTdMhXzC2L6sAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MDc6MTItMDQ6MDDinXh7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjA3OjEyLTA0OjAwk8DAxwAAAABJRU5ErkJggg==";
const _imports_4$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAFVBMVEUAAACAgID///8AAADAwMD//wD/AADaas4dAAAAAXRSTlMAQObYZgAAAAFiS0dEAmYLfGQAAAAHdElNRQfiBhoANxc0aHeBAAAA6klEQVQ4y93SzZHDIAwFYDLZBjA0sIq8ZxvUgGWlA5ew/dewIBv/BR8zk9l3g28eg4WN0dhDzJYGdvnursBdwa5yBHBXsFVOsFXOsFaOEFNqkDP+A2CF7gWwUXC39UUXkBmaoKteRILOD9sZPElOnxYOwAfgqeEMfa/H5IazlgO2T68Q73nI0WZ4PDDwNM3Q3bXhM4yjUPtcGuaGskRhKo09OOf7YRiqQD6lApZ2jZ/fvEtELl2OpNZI30m8NdZZJRiFsTRMLCEBFIbSMOZLxM+HpdEyYBUQFOsviFcA/Ik/3JvAyykF4kv+AHQjkDNA/Y/7AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA2LTI2VDAwOjU1OjIzLTA0OjAwZMOFUwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNi0yNlQwMDo1NToyMy0wNDowMBWePe8AAAAASUVORK5CYII=";
const useWindowsStore = defineStore("windows", {
  state: () => ({
    // Height of Fullscreen Window
    // fullscreenWindowHeight: window.innerHeight + "px",
    activeWindow: "",
    // Active Windows Array State
    activeWindows: [],
    // Z-index State
    zIndex: 2,
    windows: [
      {
        windowId: "BiographyWindow",
        // Unique ID
        windowState: "close",
        // Window State [open, close, minimize]
        displayName: "Biography",
        // Display Name (title under icon)
        windowComponent: "window",
        // Window Component (can be changed to use modified windows)
        windowContent: "bio",
        // Window Content (used under slots)
        windowContentPadding: {
          top: null,
          right: null,
          bottom: null,
          left: null
        },
        // Window Content Padding
        position: "absolute",
        // Window Position
        positionX: "5vw",
        // Window Position X (when first opened)
        positionY: "5%",
        // Window Position Y (when first opened)
        iconImage: "bio.png",
        // Window Icon Image
        altText: "Biography",
        // Window Icon Alt Text
        fullscreen: false,
        // Window Fullscreen State [true, false]
        showInAppGrid: true,
        showInNavbar: true
      },
      {
        windowId: "ResumeWindow",
        // Unique ID
        windowState: "close",
        // Window State [open, close, minimize]
        displayName: "Résumé",
        // Display Name (title under icon)
        windowComponent: "window",
        // Window Component (can be changed to use modified windows)
        windowContent: "resume",
        // Window Content (used under slots)
        windowContentPadding: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0"
        },
        // Window Content Padding
        position: "absolute",
        // Window Position
        positionX: "10vw",
        // Window Position X (when first opened)
        positionY: "15vh",
        // Window Position Y (when first opened)
        iconImage: "resume.png",
        // Window Icon Image
        altText: "Résumé",
        // Window Icon Alt Text
        fullscreen: false,
        // Window Fullscreen State [true, false]
        showInAppGrid: true,
        showInNavbar: true
      }
      //   {
      //     windowId: "MailWindow",
      //     windowState: "close",
      //     displayName: "Mail",
      //     windowComponent: "mail",
      //     windowContent: "",
      //     windowContentPadding: {
      //       top: "0",
      //       right: "0",
      //       bottom: "0",
      //       left: "0",
      //     },
      //     position: "absolute",
      //     positionX: "6vw",
      //     positionY: "12vh",
      //     iconImage: "mail.png",
      //     altText: "Mail",
      //     fullscreen: false,
      //     showInAppGrid: true,
      //     showInNavbar: true,
      //   },
    ]
  }),
  getters: {
    getFullscreenWindowHeight() {
      let height = "0px";
      return height;
    }
  },
  actions: {
    getWindowById(windowId) {
      return this.windows.find((window2) => window2.windowId === windowId);
    },
    getWindowFullscreen(windowId) {
      return this.windows.find((window2) => window2.windowId === windowId).fullscreen;
    },
    getActiveWindow() {
      return this.activeWindow;
    },
    setActiveWindow(windowId) {
      this.activeWindow = windowId;
    },
    setFullscreen(payload) {
      const getArrItem = () => {
        return this.windows.find(
          (windows) => windows.windowId === payload.windowId
        );
      };
      const window2 = getArrItem();
      window2.fullscreen = payload.fullscreen;
    },
    zIndexIncrement(windowId) {
      this.zIndex++;
      if ((void 0).getElementById(windowId)) {
        (void 0).getElementById(windowId).style.zIndex = this.zIndex;
      }
    },
    // Push Active Window
    pushActiveWindow(window2) {
      this.activeWindows.push(window2);
    },
    // Pop Active Window
    popActiveWindow(window2) {
      const windowIndex = this.activeWindows.indexOf(window2);
      if (windowIndex !== -1) {
        this.activeWindows.splice(windowIndex, 1);
      }
    },
    pushNewWindow(window2) {
      this.windows.push(window2);
    },
    setPhotoFolderContent(payload) {
      this.photoFolderContent = payload;
    },
    setWindowState(payload) {
      const getArrItem = () => {
        return this.windows.find(
          (windows) => windows.windowId === payload.windowId
        );
      };
      const window2 = getArrItem();
      let preventAppendingOpenWindow = false;
      if (window2.windowState == "open" || window2.windowState == "minimize") {
        preventAppendingOpenWindow = true;
      }
      if (payload.windowState == "open") {
        window2.windowState = payload.windowState;
        setTimeout(() => {
          this.zIndexIncrement(payload.windowId);
        }, 0);
        setTimeout(() => {
          this.setActiveWindow(payload.windowId);
        }, 0);
        if (preventAppendingOpenWindow == false) {
          this.pushActiveWindow(window2);
        }
      } else if (payload.windowState == "close") {
        setTimeout(() => {
          window2.windowState = payload.windowState;
        }, 0);
        setTimeout(() => {
          this.popActiveWindow(window2);
        }, 0);
        setTimeout(() => {
          this.setActiveWindow("nil");
        }, 0);
      } else if (payload.windowState == "minimize") {
        setTimeout(() => {
          window2.windowState = payload.windowState;
        }, 0);
        setTimeout(() => {
          this.setActiveWindow("nil");
        }, 0);
      } else {
        console.log("Error: windowState not found or invalid");
      }
    }
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$a = {
  __name: "FileWindow",
  __ssrInlineRender: true,
  props: {
    windowId: String,
    nameOfWindow: String,
    content_padding_left: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_right: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_top: {
      required: false,
      type: String,
      default: "5%"
    },
    content_padding_bottom: {
      required: false,
      type: String,
      default: "5%"
    },
    folderContent: {
      required: true,
      type: Array,
      default: () => []
    },
    folderSize: {
      required: false,
      type: Number,
      default: 0
    }
  },
  setup(__props) {
    const props = __props;
    const position = ref({
      x: 0,
      y: 0
    });
    ref({
      x: 0,
      y: 0
    });
    const windowsStore = useWindowsStore();
    const window = ref({});
    props.nameOfWindow;
    const w = ref(0);
    const h2 = ref(0);
    const gridHeight = ref("");
    ref(null);
    const files = ref(props.folderContent);
    const size = ref(props.folderSize);
    const style = computed(() => ({
      height: `${h2.value}px`,
      width: `${w.value}px`,
      transform: `translate(${position.value.x}px, ${position.value.y}px)`,
      "--content-padding-left": props.content_padding_left || "15%",
      "--content-padding-right": props.content_padding_right || "15%",
      "--content-padding-top": props.content_padding_top || "5%",
      "--content-padding-bottom": props.content_padding_bottom || "5%",
      "--fullscreen": windowsStore.getFullscreenWindowHeight
      // assuming this is a method in your store
    }));
    const convertBytestoMegabytes = (bytes) => {
      if (bytes !== 0) {
        return (bytes / 1e6).toFixed(2) + "MB";
      } else {
        return "";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        id: window.value.windowId,
        style: style.value,
        class: ["window window-style", {
          "fullscreen": window.value.fullscreen == true,
          "minimize": window.value.fullscreen == "minimize"
        }]
      }, _attrs))} data-v-598ba05b><div id="top-bar" class="${ssrRenderClass([
        unref(windowsStore).activeWindow == window.value.windowId ? "top-bar" : "top-bar-deactivated",
        "top-bar-window"
      ])}" data-v-598ba05b><div class="window-name" data-v-598ba05b><img class="icon-image"${ssrRenderAttr("src", _imports_0$5)}${ssrRenderAttr("alt", window.value.altText)} data-v-598ba05b>${ssrInterpolate(window.value.displayName)}</div><div class="triple-button" data-v-598ba05b><button class="minimize-button button" data-v-598ba05b><span style="${ssrRenderStyle({ "height": "2px", "width": "6px", "background": "black", "margin-top": "8px", "margin-right": "2px" })}" data-v-598ba05b></span></button><button class="expand-button button" data-v-598ba05b><span style="${ssrRenderStyle({ "height": "8px", "width": "9px", "border-left": "black 1px solid", "border-right": "black 1px solid", "border-bottom": "black 1px solid", "border-top": "black 2px solid" })}" data-v-598ba05b></span></button><button class="close-button button" style="${ssrRenderStyle({ "margin-right": "3px", "padding-left": "1px" })}" data-v-598ba05b> × </button></div></div><div class="content" data-v-598ba05b><div class="top-bar-nav" data-v-598ba05b><div class="top-bar-text" data-v-598ba05b><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-598ba05b><u data-v-598ba05b>F</u>ile </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-598ba05b><u data-v-598ba05b>E</u>dit </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-598ba05b><u data-v-598ba05b>V</u>iew </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-598ba05b><u data-v-598ba05b>H</u>elp </span></div></div><div class="file-explorer" data-v-598ba05b><nav class="grid-container-photos" style="${ssrRenderStyle({ height: gridHeight.value })}" data-v-598ba05b><!--[-->`);
      ssrRenderList(files.value, (file) => {
        _push(`<li data-v-598ba05b><button class="icon-photos" data-v-598ba05b>`);
        if (file.type == "photo") {
          _push(`<img class="icon-image-photos"${ssrRenderAttr("src", _imports_1$3)}${ssrRenderAttr("alt", file.altText)} data-v-598ba05b>`);
        } else if (file.type == "folder") {
          _push(`<img class="icon-image-photos"${ssrRenderAttr("src", _imports_2$1)}${ssrRenderAttr("alt", file.altText)} data-v-598ba05b>`);
        } else if (file.type == "file") {
          _push(`<img class="icon-image-photos"${ssrRenderAttr("src", _imports_3$1)}${ssrRenderAttr("alt", file.altText)} data-v-598ba05b>`);
        } else if (file.type == "video") {
          _push(`<img class="icon-image-photos"${ssrRenderAttr("src", _imports_4$1)}${ssrRenderAttr("alt", file.altText)} data-v-598ba05b>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="border-box" data-v-598ba05b><p class="icon-text" data-v-598ba05b>${ssrInterpolate(file.title)}</p></div></button></li>`);
      });
      _push(`<!--]--></nav></div><div class="bottom-bar" data-v-598ba05b><div class="left-bar bar" data-v-598ba05b>${ssrInterpolate(files.value.length)} object(s)</div><div class="right-bar bar" data-v-598ba05b>${ssrInterpolate(convertBytestoMegabytes(size.value))}</div></div></div></div>`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/FileWindow.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const FileWindow = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-598ba05b"]]);
const _sfc_main$9 = {
  __name: "Window",
  __ssrInlineRender: true,
  props: {
    windowId: String,
    nameOfWindow: String,
    content_padding_left: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_right: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_top: {
      required: false,
      type: String,
      default: "5%"
    },
    content_padding_bottom: {
      required: false,
      type: String,
      default: "5%"
    }
  },
  setup(__props) {
    const props = __props;
    const position = ref({
      x: 0,
      y: 0
    });
    ref({
      x: 0,
      y: 0
    });
    const windowsStore = useWindowsStore();
    const window = ref({});
    props.nameOfWindow;
    const w = ref(400);
    const h2 = ref(400);
    const style = computed(() => ({
      height: `${h2.value}px`,
      width: `${w.value}px`,
      transform: `translate(${position.value.x}px, ${position.value.y}px)`,
      "--content-padding-left": props.content_padding_left || "15%",
      "--content-padding-right": props.content_padding_right || "15%",
      "--content-padding-top": props.content_padding_top || "5%",
      "--content-padding-bottom": props.content_padding_bottom || "5%",
      "--fullscreen": windowsStore.getFullscreenWindowHeight
      // assuming this is a method in your store
    }));
    const getImagePath = (iconImage) => {
      const path = `../assets/win95Icons/${iconImage}`;
      const modules = /* @__PURE__ */ Object.assign({ "../assets/win95Icons/bio.png": __vite_glob_0_0, "../assets/win95Icons/file.png": __vite_glob_0_1, "../assets/win95Icons/folder.png": __vite_glob_0_2, "../assets/win95Icons/mail.png": __vite_glob_0_3, "../assets/win95Icons/photos.png": __vite_glob_0_4, "../assets/win95Icons/resume.png": __vite_glob_0_5 });
      const mod = modules[path];
      if (mod == void 0) {
        return "";
      } else {
        return mod.default;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        id: window.value.windowId,
        style: style.value,
        class: ["window window-style", {
          "fullscreen": window.value.fullscreen == true,
          "minimize": window.value.fullscreen == "minimize"
        }]
      }, _attrs))} data-v-87ed50b4><div id="top-bar" class="${ssrRenderClass([
        unref(windowsStore).activeWindow == window.value.windowId ? "top-bar" : "top-bar-deactivated",
        "top-bar-window"
      ])}" data-v-87ed50b4><div class="window-name" data-v-87ed50b4><img class="icon-image"${ssrRenderAttr("src", getImagePath(window.value.iconImage))}${ssrRenderAttr("alt", window.value.altText)} data-v-87ed50b4>${ssrInterpolate(window.value.displayName)}</div><div class="triple-button" data-v-87ed50b4><button class="minimize-button button" data-v-87ed50b4><span style="${ssrRenderStyle({ "height": "2px", "width": "6px", "background": "black", "margin-top": "8px", "margin-right": "2px" })}" data-v-87ed50b4></span></button><button class="expand-button button" data-v-87ed50b4><span style="${ssrRenderStyle({ "height": "8px", "width": "9px", "border-left": "black 1px solid", "border-right": "black 1px solid", "border-bottom": "black 1px solid", "border-top": "black 2px solid" })}" data-v-87ed50b4></span></button><button class="close-button button" style="${ssrRenderStyle({ "margin-right": "3px", "padding-left": "1px" })}" data-v-87ed50b4> × </button></div></div><div class="content" data-v-87ed50b4>`);
      ssrRenderSlot(_ctx.$slots, "content", { class: "window-content" }, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/Window.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const Window = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-87ed50b4"]]);
const _imports_0$3 = "" + __buildAssetsURL("windows-95.BRE2HTh4.png");
const _imports_1$2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAFVBMVEUAAAC/vwAAAACAgIDAwMD//////wBeSt57AAAAAXRSTlMAQObYZgAAAAFiS0dEBfhv6ccAAAAHdElNRQfiBhgXES2C2lBpAAAAzElEQVQoz32RSxLCIAxAU3sCKnQtYPeM6AFsLQewhgsI3v8IUvqDzmgWzOTxJpAE4EdUp/Es17xouzFXK6Dnl0rz4tGgSnKg7xsOScXCPPsMUN8uQE2CnUGpZ8HLHlGBjveEfCxGUM4v3j1OYCrILENEoTeAI5BDsxm1tTYFnvnwSjf+XYcAZmpjTASz4ahzTuoNREOIfgEFIdFYAQgRFHldfxqCByPpBeBAzCXrFjjJ5xGUKp8Y8GM+06Dspg58txc4VLvNgdjt9k98AQS0M6MCJf0BAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA2LTI0VDIzOjE3OjQ1LTA0OjAwrlSXUQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNi0yNFQyMzoxNzo0NS0wNDowMN8JL+0AAAAASUVORK5CYII=";
const _sfc_main$8 = {
  __name: "Navbar",
  __ssrInlineRender: true,
  setup(__props) {
    ref("");
    const time = ref("");
    const windowsStore = useWindowsStore();
    const getImagePath = (iconImage) => {
      const path = `../assets/win95Icons/${iconImage}`;
      const modules = /* @__PURE__ */ Object.assign({
        "../assets/win95Icons/bio.png": __vite_glob_0_0,
        "../assets/win95Icons/file.png": __vite_glob_0_1,
        "../assets/win95Icons/folder.png": __vite_glob_0_2,
        "../assets/win95Icons/mail.png": __vite_glob_0_3,
        "../assets/win95Icons/photos.png": __vite_glob_0_4,
        "../assets/win95Icons/resume.png": __vite_glob_0_5
      });
      const mod = modules[path];
      if (mod == void 0) {
        return "";
      } else {
        return mod.default;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "navbar-container" }, _attrs))} data-v-93252668><div alt="start" class="${ssrRenderClass([
        unref(windowsStore).activeWindow == "Menu" ? "start-menu-depressed" : "start-menu",
        "start-menu"
      ])}" data-v-93252668><div class="${ssrRenderClass([
        unref(windowsStore).activeWindow == "Menu" ? "border-box" : "container-border",
        "flex"
      ])}" data-v-93252668><img class="start-icon"${ssrRenderAttr("src", _imports_0$3)} data-v-93252668><button style="${ssrRenderStyle({ "padding-left": "3px", "font-size": "0.9rem", "font-weight": "bold" })}" data-v-93252668> Start </button></div></div><div class="overflow-x-scroll flex no-scrollbar" data-v-93252668><!--[-->`);
      ssrRenderList(unref(windowsStore).activeWindows, (window) => {
        _push(`<div data-v-93252668>`);
        if (unref(windowsStore).activeWindow !== window.windowId && (window.windowState == "open" || window.windowState == "minimize")) {
          _push(`<button class="navbar-item open" data-v-93252668><img class="icon-image"${ssrRenderAttr("src", getImagePath(window.iconImage))}${ssrRenderAttr("alt", window.altText)} data-v-93252668><p data-v-93252668>${ssrInterpolate(window.displayName)}</p></button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(windowsStore).activeWindow == window.windowId) {
          _push(`<button class="navbar-item-depressed" data-v-93252668><img class="icon-image"${ssrRenderAttr("src", getImagePath(window.iconImage))}${ssrRenderAttr("alt", window.altText)} data-v-93252668><p data-v-93252668>${ssrInterpolate(window.displayName)}</p></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="spacer" data-v-93252668></div><div alt="time" class="time" data-v-93252668><img${ssrRenderAttr("src", _imports_1$2)} class="icon-image" data-v-93252668><time data-v-93252668>${ssrInterpolate(unref(time))}</time></div></nav>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/Navbar.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const Navbar = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-93252668"]]);
const _sfc_main$7 = {
  __name: "AppGrid",
  __ssrInlineRender: true,
  setup(__props) {
    const windowsStore = useWindowsStore();
    const gridHeight = ref("");
    const getImagePath = (iconImage) => {
      const path = `../assets/win95Icons/${iconImage}`;
      const modules = /* @__PURE__ */ Object.assign({ "../assets/win95Icons/bio.png": __vite_glob_0_0, "../assets/win95Icons/file.png": __vite_glob_0_1, "../assets/win95Icons/folder.png": __vite_glob_0_2, "../assets/win95Icons/mail.png": __vite_glob_0_3, "../assets/win95Icons/photos.png": __vite_glob_0_4, "../assets/win95Icons/resume.png": __vite_glob_0_5 });
      const mod = modules[path];
      return mod.default;
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: "grid-container",
        style: { height: unref(gridHeight) }
      }, _attrs))}><!--[-->`);
      ssrRenderList(unref(windowsStore).windows, (window2) => {
        _push(`<li>`);
        if (window2.showInAppGrid != false) {
          _push(`<button class="icon"><img class="icon-image"${ssrRenderAttr("src", getImagePath(window2.iconImage))}${ssrRenderAttr("alt", window2.altText)}><div class="border-box"><p class="icon-text">${ssrInterpolate(window2.displayName)}</p></div></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></nav>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/AppGrid.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const AppGrid = _sfc_main$7;
const _imports_0$2 = "" + __buildAssetsURL("self.DJZ3vD7_.jpeg");
const _sfc_main$6 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(_attrs)}><img class="w-full h-auto"${ssrRenderAttr("src", _imports_0$2)}><h2 class="font-bold text-2xl py-5">Kunal Jaglan aka (h00dy)</h2><h4 class="text-gray-600 font-medium text-xs" style="${ssrRenderStyle({ "padding-bottom": "10px" })}"> Penetration Tester / Red Teamer / CyberSecurity Engineer 🚀 </h4><h4 class="text-gray-600 font-medium text-xs">postponing-sleep, it&#39;s a hacker life for me...★</h4><div class="pt-7"><h3 class="underline font-bold text-md pb-1">About Me</h3><p class="font-thin text-sm pb-2.5"> I’m a ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear() - 2004)} year old hacker in the making, With each keystroke, I strive further to the Dark Arts of Computing, devoting the better part of my life oscillating between Individual Contribution and maintaining a versatile skillset spanning the breadth of contemporary security practices, from to AppSec to NetSec to DevSecOps, with a firm emphasis on OffSec ensuring the ethos of hacking space and cyber world remain in me so that i may never lose sight of its inherent struggles. </p><p class="font-thin text-sm pb-2.5"> I am my own worst critic. As a result, I allow myself the space to navigate burnouts and re-writing internet privacy rights when they&#39;re still left, and recently, probing the whimsy of the IoT Sphere, all from the comfort of my cubicle. </p></div><div class="pt-7"><h3 class="pb-1"><b>Résumé</b></h3><a style="${ssrRenderStyle({ "color": "#ff5733" })}" href="/files/Kunal_SecurityEngineer_Apr.pdf" class="font-thin text-sm pb-2.5">Check out my résumé here.</a></div></div>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("views/Bio.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const Bio = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$1]]);
const _imports_0$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfiBhgXBwzSK/XgAAAAjElEQVRIx+2VQQrAIAwE1+K/oz9rX5ZeiopaTazFHronETMOIRCDK44hiDP5jY1H6pZ7gJEhNsm/iQHAjwBUIJSAEmF15aEBoRcqAwKDwdiTu8LAdxB5bP9JOwoDkgFeNKjD5xvc2wh7oLVRGNSR8w2+PImr54BGAP8cyLLeQL1YGgbHECDuWtF6LytPTdMhXzC2L6sAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MDc6MTItMDQ6MDDinXh7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjA3OjEyLTA0OjAwk8DAxwAAAABJRU5ErkJggg==";
const _imports_1$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAulBMVEUEBAT/AACGhob///+ZmZlVVVX/+/DMzMzn59bx8fF3d3czMzMAZv8AZszq6urAwMAAmf8zmcwzZv8zZpkzM8xmmczMzJkzzP8AZplmmZmgoKT//8wAAJn//5kzZsxm//8zmf+Z//9mZswz//8zM5nMzGb/zJlmzP8zM2aZmWYAAICtqZDMmWaWlpZmZmaZmTMAzP9mZjNmZpmAgABfX18AM5lNTU0AAGYpKSkcHBwAM8wEBAQAM2YAAP9Z2XwCAAAAAXRSTlMAQObYZgAAAAFiS0dEAxEMTPIAAAAHdElNRQfiBhgXDQAhclFBAAACWklEQVRIx42Ua2ObIBSGdVEjrlDDSGQdM7uYdskuXbq0Wy77/39rBxBEPbZ7zeXL83DOQTGKXOJXk4nQxLNZDF8kSYrQWojjDE2CGHEMnwk+S+ao0QYTctyYbomMjOfWB2FGsBoax41khhm6pSzDBALC2IjjYobScKWvXXolesIVhDqD5fP59XWSFOlACHH4pSMDF64sbg3dESHOGAlUp1y0S4Nh1ieMMGv0BQ1zvuCLclG2CvU8y7URCm9CHmIM6nlrBIIAfLlaLS1fVdaACi3Ocm10gpD07c275dJWqLyh5/V8IAhFb96vauCFEBTwdbUu7cRmYHt1glByBTznH/Sq1vhYlZS4jvJBBcN/anlnfC7pgPeCaDa3G+C5235Fq/VdVVEWdBQKX7Ybw4fC3VqPzQjxE3fCrvj67XttBB+9TZUWwo6c8ON+uwWeagW21d43uBflT8p6HTlhX9w/cF5bITDKiQrFvvjFuWwkHxmU9Xgv7GHiRkIFNUyfd0L6YArU3S65BE9FIBxAAF6A4QVhNo3LPu8FTh93YHQlhDQP7UL6pygUnlIuf+8aIXVT0kbPHvD9GZ4OXP6BEkKYMcwx8g2hFUCIjo+qkSdZ8y6SDCbwMxwk/B6PqtmdZKdIe5J7RnunjRBF57NqTjUotZmFkFFHAyEqzkqd2qnt2c8nKoid+ZfyeLwoJUTGMoas352Hy1+zqlLuBuuLjSYIjujFxL0qWda+KoZ8+Jrx71a9uj77bLSnuGC6IQRdHxN898jEmODp/6wQ8vmIxoTpZnBh/mIGQvpyAPsHj11az1NkJfkAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDYtMjRUMjM6MTM6MDAtMDQ6MDBxzRZ2AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTA2LTI0VDIzOjEzOjAwLTA0OjAwAJCuygAAAABJRU5ErkJggg==";
const _sfc_main$5 = {
  __name: "Resume",
  __ssrInlineRender: true,
  setup(__props) {
    const windowsStore = useWindowsStore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "display": "flex", "height": "100%", "flex-direction": "column" } }, _attrs))} data-v-4033eddd><nav class="download-bar" data-v-4033eddd><a href="/files/Kunal_SecurityEngineer_Apr.pdf" class="download" style="${ssrRenderStyle({ "z-index": "10" })}" download target="_blank" data-v-4033eddd><span style="${ssrRenderStyle({ "display": "flex" })}" class="border" data-v-4033eddd><img${ssrRenderAttr("src", _imports_0$1)} class="icon-image" data-v-4033eddd><p style="${ssrRenderStyle({ "margin-top": "2px" })}" data-v-4033eddd>Download</p></span></a><a href="/files/Kunal_SecurityEngineer_Apr.pdf" class="download" style="${ssrRenderStyle({ "z-index": "10" })}" target="_blank" data-v-4033eddd><span style="${ssrRenderStyle({ "display": "flex" })}" class="border" data-v-4033eddd><img${ssrRenderAttr("src", _imports_1$1)} class="icon-image" data-v-4033eddd><p style="${ssrRenderStyle({ "margin-top": "2px" })}" data-v-4033eddd>Open In New Tab</p></span></a></nav><div class="frame" style="${ssrRenderStyle({ "z-index": "99" })}" data-v-4033eddd><iframe class="frame" src="https://drive.google.com/file/d/1AJQ5Exhr3WL2saYTyrgXOBT95hCkGwyD/preview" data-v-4033eddd></iframe>`);
      if (unref(windowsStore).activeWindow != "ResumeWindow") {
        _push(`<span style="${ssrRenderStyle({ "bottom": "0", "left": "0", "width": "100%", "height": "95%", "position": "absolute" })}" class="overlay" data-v-4033eddd></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("views/Resume.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const Resume = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-4033eddd"]]);
const currentIndex = 0;
const _sfc_main$4 = {
  __name: "ImagePreviewWindow",
  __ssrInlineRender: true,
  props: {
    windowId: String,
    nameOfWindow: String,
    content_padding_left: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_right: {
      required: false,
      type: String,
      default: "15%"
    },
    content_padding_top: {
      required: false,
      type: String,
      default: "5%"
    },
    content_padding_bottom: {
      required: false,
      type: String,
      default: "5%"
    }
  },
  setup(__props) {
    const props = __props;
    const position = ref({
      x: 0,
      y: 0
    });
    ref({
      x: 0,
      y: 0
    });
    const windowsStore = useWindowsStore();
    const window = ref({});
    props.nameOfWindow;
    const w = ref(0);
    const h2 = ref(0);
    const gridHeight = ref("");
    ref(null);
    const files = ref(windowsStore.photoFolderContent);
    const file = ref(files.value[currentIndex]);
    const style = computed(() => ({
      height: `${h2.value}px`,
      width: `${w.value}px`,
      transform: `translate(${position.value.x}px, ${position.value.y}px)`,
      "--content-padding-left": props.content_padding_left || "15%",
      "--content-padding-right": props.content_padding_right || "15%",
      "--content-padding-top": props.content_padding_top || "5%",
      "--content-padding-bottom": props.content_padding_bottom || "5%",
      "--fullscreen": windowsStore.getFullscreenWindowHeight
      // assuming this is a method in your store
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        id: window.value.windowId,
        style: style.value,
        class: ["window window-style", {
          "fullscreen": window.value.fullscreen == true,
          "minimize": window.value.fullscreen == "minimize"
        }]
      }, _attrs))} data-v-c4b84f44><div id="top-bar" class="${ssrRenderClass([
        unref(windowsStore).activeWindow == window.value.windowId ? "top-bar" : "top-bar-deactivated",
        "top-bar-window"
      ])}" data-v-c4b84f44><div class="window-name" data-v-c4b84f44>`);
      if (file.value.type == "photo") {
        _push(`<img class="icon-image"${ssrRenderAttr("src", _imports_0$4)}${ssrRenderAttr("alt", window.value.altText)} data-v-c4b84f44>`);
      } else {
        _push(`<img class="icon-image"${ssrRenderAttr("src", _imports_1$4)}${ssrRenderAttr("alt", window.value.altText)} data-v-c4b84f44>`);
      }
      _push(`<span data-v-c4b84f44>${ssrInterpolate(file.value.title)}</span></div><div class="triple-button" data-v-c4b84f44><button class="minimize-button button" data-v-c4b84f44><span style="${ssrRenderStyle({ "height": "2px", "width": "6px", "background": "black", "margin-top": "8px", "margin-right": "2px" })}" data-v-c4b84f44></span></button><button class="expand-button button" data-v-c4b84f44><span style="${ssrRenderStyle({ "height": "8px", "width": "9px", "border-left": "black 1px solid", "border-right": "black 1px solid", "border-bottom": "black 1px solid", "border-top": "black 2px solid" })}" data-v-c4b84f44></span></button><button class="close-button button" style="${ssrRenderStyle({ "margin-right": "3px", "padding-left": "1px" })}" data-v-c4b84f44> × </button></div></div><div class="content" data-v-c4b84f44><div class="top-bar-nav" data-v-c4b84f44><div class="top-bar-text" data-v-c4b84f44><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-c4b84f44><u data-v-c4b84f44>F</u>ile </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-c4b84f44><u data-v-c4b84f44>E</u>dit </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-c4b84f44><u data-v-c4b84f44>V</u>iew </span><span style="${ssrRenderStyle({ "margin-right": "12px" })}" data-v-c4b84f44><u data-v-c4b84f44>H</u>elp </span></div></div>`);
      if (file.value.type == "file") {
        _push(`<div class="file-explorer !h-[95%] !w-[100%]" style="${ssrRenderStyle([{ "width": "100%" }, { height: gridHeight.value }])}" data-v-c4b84f44><iframe class="mx-auto responsive-iframe w-[100%]" height="100%"${ssrRenderAttr("src", file.value.content.src)} data-v-c4b84f44></iframe></div>`);
      } else {
        _push(`<div class="file-explorer" data-v-c4b84f44><div class="grid-container-photos" style="${ssrRenderStyle({ height: gridHeight.value })}" data-v-c4b84f44><img${ssrRenderAttr("src", file.value.src)} data-v-c4b84f44></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/ImagePreviewWindow.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const ImagePreviewWindow = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-c4b84f44"]]);
const _imports_0 = "" + __buildAssetsURL("x.DCZW4L5G.webp");
const _imports_1 = "data:image/webp;base64,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";
const _imports_2 = "" + __buildAssetsURL("youtube.CYi_A4-D.webp");
const _imports_3 = "data:image/webp;base64,UklGRl4FAABXRUJQVlA4IFIFAAAwHACdASppAGkAPtFcqU0oJSQiJ9QMwQAaCWwAx6Crft++fax7z9Zfxfjy71ZHvZRkA9RX6G3hXmT/bv1b/Q5/gvRj6j70AOlm/dPCPuyKRMLZQz5WA3HvqhFwNfo8n9QtVbmjeJntEQWBBUqEUE/gl0Ut6WxRollhDtrNc67moz5X5y0Chf+2X5Vh/Vrm1m981g6wPkAJwmlJ+FxeOGD+sqKW5QZsN0EQt77lWLldGjF6k6ZbA5ENXJtAJy/g8cnTX9lElcRczYuX+6Xpc3fJQizlrCKWUkR1s90vWUa0fSB29V4dAnWTm4AA/tlP3bqpPJch4+2FcTVIkIYLyhcu+aZOiS0ocWBWL/yoNCGZ1vmuAu6JNITmZWDA736B8oIYyd8GJ+0QJHjCJ7qGEs5PNsEDRe5FDyK0QE7uTLZSkQWItKlE/oSW3jm5FQITZYtL882zquQxo/HHZwujG3keUAtMWwY1DBXDOFhmsRCmDZ3x+DuUPZvH/qTX5WUAA8wZykd85PSm+sDeALOK0Y8DXzviPKxJg5TD1bdm8yjm9pmwOPZo+g44zYw1FrABBEFYNZB8jth1fznP53oa2iRWiav8sQugsgJOCUOdxe5p2ZFv4HEIb69jLkd3Yn66oLpeIK17QoleEd+XoFTtGZiSIUIB0Xw8UeyKAM6Mh4k1enxWRgP7xOSzZDhhSqn9IWp+dtfoEO0UbOSHqyytKpag/x+fH7dbbF09oHMsQNC6nbl1TpCUj9zipSOHXS9a2XNWwDu8P+Hl3CG/pqJRMYWBFxMGJvXRYO59WWZQvNRiOqpaxdn5ryHHoxLsPN2q+7Zvz/FUf+wF3luWDZU8HLJJfkCmsVaTrmf8QPgaWPN2nuu0OnKt4ZA5Nmp7v/JHmOMBOUQh5dl6uFE1E9c7T7nLvE2TAdu7irjBjz6q1FbI9pnwrAVEe8Py9JgP6Y2e8dRZGNelG3skhtHfgoVzdgasthElUJc1IKUQvAUaT/eA8YNSq8kTaJZuZOdzh1hmIcDTExV1tlMlln/9KQAi62u7b/obZL93IJIwIDPf0pF4KHHiqXI9RR+VtwMLD0uNvzXGPcpjGhr6bX/Doqf2sUIbfTMad7zARDDmdebVdCv4jLsZch1hAFlvF5PnOs1O6/BEoDu43kAORhgC9w5V+S9ZSOldjktP4vo937q9XC9tvAc5cwnuNo/YknIPyqEvz+abpAgB61bTreePuYMfJtANm/wblMRWJZh1xDzThsK9uAlj+c/7Y5a1Onfz0abuCSTzuvQ02th12lXA5WrkS09zyd27Ker0CDDgex1EZ91jv3FOQ+TF4m1/POorJ+kftqT30HFVkxcGCXZZeFVsdzLUvVD3DBBJkLY/wNCUNmvyTbQSHU4G43PMmJZvPeNQgnzjoycaJFWvLO4EPUxA4/yzR/dLOC9Kjuzg39WtkC8OH8vpDB6mbphyhWGh2hmeXHYTMHZz3WQqa8RG17SraqtSmEYQCd/jIG67e/mazdO6speekOAMueIX35LKgbgep21Ww2nspBqm1pgrRPxxK7PlJD+yvLs7byLbNGan9hYoYJW8NNEOggZOESdASguOwTi1s/CnpJ8bAhZd7dgv3NXQefbPC++FemupCqOoamgjOwZ1T6qv08I+ErKCWvaii/eQgp29xkqD13HHrnYlLVhpmgsTK5Frznq0Xt3xlK0RvkZYK/IfvVoMsXOcogzBeleO/Jnw12UBKsQOpH+7bOR7H9/jWZnwSdPcxfn2t568EIOTyXJoaFt7cyuEPNVBXGh43CDDnudESDnwm5l7a7kgAAA=";
const _imports_4 = "data:image/webp;base64,UklGRooFAABXRUJQVlA4IH4FAACQMwCdASozATMBPtFosFEoJiUipjHoWQAaCWVu4XJ1Jl9iL/zmuZdw/pHJe8PySHx/OfoE9AH6M9gDnF+YDzdPSvvOe9I5DL5RfUSyBMjVNd8JJ3Gx8nY+TsfJ2VoxheTsfJ2Pk7HxNWbZ0Bky+5yxsLydj5OxAsMYMe4rGBWghfTpxSPk7Hh4N36X9+H8NEWN3rG71Lua2dD+BIN7/rJNnefRGOF2ixu9Y3evmqtG71Q4fE1cgKR8mTTiXvlISDhz6NZXrJu0e6pfi/75wopimP6sduK3JO7LLeYpFBPw5CtWCSOYFJ83+Zo4pBFdV6JZnYgZ4q/HaJbg5fpDJk1y02jXM64UZGCbaGluvKnXAlqkByvaA/MsBZzpkm7xuaW68qdcRmxgQwfi+qHp5tign2Y4jyl/KpIRGBLhYx4Fbvx8LA6bhyM1AQosRmkhTfXvjzb1YLBV2p2IGeKvx2lb5TaKxVghEVDDwjWAtCEETcnxmZDFzjGnYy3CmB7a6SZjQEFMK4NvZ6kJ3SFo23NrC8nY+TsfJ2Pk7Hydj5Ox8nY+TsPAAP777Z7y9+At5/TsnZNQmEAQnXwAEHRF21iIK8sazw5Di58tTWMSJBOq8Vm8OrHOuOAtn43dA6GVyB9tQbik6q/NaqpcB1oRGti9Cl8iZtcrXOYIDb6YJSNuC6C9fuyopEGkMeMagM1XEqOCtEW9ilde/rk92Ycx7ehBvyvuyMGjyAO7gO/CPPInM8yQIqnbr2QjA4FlhOJLwRPqMMQP3rqdvPRFnlwFs6HgJqas9BEDlVvp9JqN8PGJxKrh9SEsNyJyFfck03ZkvzYLKB39KUWFoOX6QsilsIaznQGwAqwK1S81m9SsdETxWK21K9gAx2ezDBdiwndL/AbFiIAE4c04oH1qT2iCEGDaYimWyzM4RRiYKRUXbYkdDp+t14gec6C6x4FWqjPTLDsMZISBkNZh7FbpxnCY9g7wAvJ67jxqy4AAAQYjWOzdwrxIwgh2fPwkFgDST+Fn35EPUpoD0/lzjsa0iu+eYhgEAqzuROZXPtyizr/MtiG9Wkpw8cRa2QsTqztieL/2D3a9NbzCOLo7X7BzkEepX6vl6FFzyWGG3wrI1WK73aEkadh8OF/YYm3eGxzDR/t4C1KbiCMLX66Z3FvxW42+5VLznc3j8dVXyMXWMIftwZgIkuSmn2ZQzgLEKsLAmwoxV0G/ZpcGfIiDUHLnWEq9CceMBMZO657+8bOQcNiF+ndcMGbmOe8VrRWXKsLahSrxrmNxHXGnMR0jwguAJtZ0Nh9gwpt3bPjwstK07C78GSjq58pxi+zmgMl/XCxp/cX6EYJInHEXEtlYD3bYZMRcjKZ0YR9EhfOp5rm3WwZW026IbDI/IDY5XW6z8pJGHn7842rx8LBFORIx+vxp/Bdp0H38yDK+0aSWXGPJHsUc6qb/SrDZyvY7Gyhbk86WrsQoj9zRGTyY3NgxcpM3iM92ai7hKxxT/VNk+9kNLeXLhgpHYXB//Z37TfwdNW2VMQjCuStD8gm2LgHZyINNcTxW8FcCRWpfDn57FbBf3a7BcD/1pWAqAx8PL3uZjoOwRup8y0Bp6RGYSPUkYt1vooZYU1j+gj9qHO9lqx/uwrAW7mAWcBOPlbm8Kqlod+zTe3hKMKrek07bN+vh9UdzBoJ9NNM5InbbvgmEnqmVIyZ8oSYT6tMq31P203hkM5emHuoNmfv9UykVIinE4ulK1mN+4nlfRBU0kcc78OuhtaoXvbBUJ0GMeJUCtgISKwl1BBh0S4JPIDcWGK5LXzyyfCgqQBd0Yef4WA2I3JTSGAP5dTjdDiwxXJa+V9hBz+Gorv0gkuXFtvglWOOAAAAAAAAAAA==";
const _imports_5 = "" + __buildAssetsURL("github.DkTr3Tul.png");
const _sfc_main$3 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: "menu",
    style: { "z-index": "1000000" }
  }, _attrs))} data-v-2e3bcba4><div class="topbar" data-v-2e3bcba4><h4 data-v-2e3bcba4> h00dy ≈)</h4></div><div class="socials" data-v-2e3bcba4><a href="https://x.com/hoodietramp" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_0)} data-v-2e3bcba4><u data-v-2e3bcba4>T</u>witter </div></a><a href="https://www.instagram.com/hoodietramp/" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_1)} data-v-2e3bcba4><div class="social-text" data-v-2e3bcba4><u data-v-2e3bcba4>I</u>nstagram</div></div></a><a href="https://youtube.com/@hoodietramp/" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_2)} data-v-2e3bcba4><div class="social-text" data-v-2e3bcba4><u data-v-2e3bcba4>Y</u>outube</div></div></a><a href="https://www.reddit.com/user/_kunaljaglan" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_3)} data-v-2e3bcba4><u data-v-2e3bcba4>R</u>eddit </div></a><a href="https://www.linkedin.com/in/h00dy" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_4)} data-v-2e3bcba4><u data-v-2e3bcba4>L</u>inkedIn </div></a><a href="https://github.com/hoodietramp" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_5)} data-v-2e3bcba4><u data-v-2e3bcba4>G</u>itHub </div></a><div class="divider" data-v-2e3bcba4></div><a href="/files/Kunal_SecurityEngineer_Apr.pdf" target="_blank" data-v-2e3bcba4><div class="bar" data-v-2e3bcba4><img class="social-image"${ssrRenderAttr("src", _imports_6)} data-v-2e3bcba4><u data-v-2e3bcba4>R</u>ésumé </div></a></div></div>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("templates/StartMenu.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const StartMenu = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-2e3bcba4"]]);
const __default__ = {
  data() {
    const jsonld = {
      "@context": "http://schema.org",
      "@type": "Person",
      "name": ["Kunal Jaglan", "h00dy", "hoodietramp", "Kunal Jaglan h00dy"],
      "image": "img/avatar.png",
      "jobTitle": ["Pentester", "Red Teamer", "Cyber Security"],
      "description": "Kunal Jaglan, also know by his alias h00dy, is a seasoned expert who is witnessing the evolution of cybersecurity from its alluring days to the complexities of the modern digital landscape. He brings a blend of experience, wisdom, and adaptability to the work, ethics making him a valuable asset in any cybersecurity endeavor.",
      "url": "https://h00dy.me",
      "sameAs": [
        "https://facebook.com/0xh00dy",
        "https://twitter.com/hoodietramp",
        "https://instagram.com/hoodietramp",
        "https://youtube.com/@hoodietramp",
        "https://twitch.tv/hoodietramp",
        "https://linkedin.com/in/h00dy",
        "https://github.com/hoodietramp"
      ],
      "birthDate": "2004-02-14"
    };
    return {
      jsonld
    };
  }
};
const _sfc_main$2 = /* @__PURE__ */ Object.assign(__default__, {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const windowsStore = useWindowsStore();
    const windows = windowsStore.windows;
    const windowComponents = [
      { name: "window", comp: Window },
      { name: "ImagePreviewWindow", comp: ImagePreviewWindow },
      { name: "FilesWindow", comp: FileWindow }
    ];
    const slotViews = [
      { name: "bio", comp: Bio },
      { name: "resume", comp: Resume }
    ];
    const windowCheck = (windowId) => {
      if (windowsStore.getWindowById(windowId).windowState == "open") {
        return true;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><title>Kunal Jaglan - h00dy</title><meta name="author" content="Kunal Jaglan"><meta name="description" content="Kunal Jaglan, also know by his alias h00dy, is a seasoned cybersecurity expert who is witnessing the evolution of cybersecurity from its alluring days to the complexities of the modern digital landscape. His love for CTFs and dedication brings a blend of experience, wisdom, and adaptability to his work. Rooted in strong ethical principles and passion for working tirelessly, Kunal proves to be an invaluable asset in any cybersecurity endeavor."><div id="app"><div class="screen" id="screen"><!--[-->`);
      ssrRenderList(unref(windows), (window2) => {
        _push(`<div${ssrRenderAttr("aria-label", window2.displayName)}>`);
        if (windowCheck(window2.windowId)) {
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(windowComponents.find((comp) => comp.name === window2.windowComponent).comp), {
            nameOfWindow: window2.windowId,
            content_padding_bottom: window2.windowContentPadding["bottom"],
            content_padding_left: window2.windowContentPadding["left"],
            content_padding_right: window2.windowContentPadding["right"],
            content_padding_top: window2.windowContentPadding["top"],
            id: window2.windowId,
            style: {
              position: window2.position,
              left: window2.positionX,
              top: window2.positionY
            },
            folderContent: window2.folderContent,
            folderSize: window2.folderSize
          }, {
            content: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(slotViews.find((comp) => comp.name === window2.windowContent).comp), null, null), _parent2, _scopeId);
              } else {
                return [
                  (openBlock(), createBlock(resolveDynamicComponent(slotViews.find((comp) => comp.name === window2.windowContent).comp)))
                ];
              }
            }),
            _: 2
          }), _parent);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(AppGrid, null, null, _parent));
      _push(`</div>`);
      if (unref(windowsStore).activeWindow == "Menu") {
        _push(ssrRenderComponent(StartMenu, { style: { "position": "absolute", "z-index": "9999", "left": "0", "bottom": "36px" } }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(Navbar, {
        style: { "position": "absolute", "bottom": "0", "z-index": "9999" },
        id: "navbar"
      }, null, _parent));
      _push(`</div><!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = _sfc_main$2;
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-DC7p7rXc.mjs').then((r) => r.default || r));
    const _Error = defineAsyncComponent(() => import('./error-500-CCXRWcmL.mjs').then((r) => r.default || r));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ErrorComponent = _sfc_main$1;
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = /* @__PURE__ */ useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RootComponent = _sfc_main;
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(RootComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error = nuxt.payload.error || createError(error);
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

export { _export_sfc as _, useRuntimeConfig as a, entry$1 as default, injectHead as i, navigateTo as n, resolveUnrefHeadInput as r, useRouter as u };
//# sourceMappingURL=server.mjs.map
