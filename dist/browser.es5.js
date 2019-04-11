'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var reactApollo = require('react-apollo');
var React = _interopDefault(require('react'));
var fusionCore = require('fusion-core');
var fusionTokens = require('fusion-tokens');
var apolloClient = require('apollo-client');
var apolloLinkHttp = require('apollo-link-http');
var apolloLink = require('apollo-link');
var apolloLinkSchema = require('apollo-link-schema');
var apolloCacheInmemory = require('apollo-cache-inmemory');

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env node */
// Apollo currently does not have an effective error policy for server side rendering (see https://github.com/apollographql/react-apollo/issues/2680)
// This render function first tries to use `renderToStringWithData`. If any query in this render function fails, we will catch the error, log it, and
// fall back to a standard renderToString, which will set the `loading` props of all queries which failed to execute in the first pass to true.
// This allows us to still render with data in the happy case, and defer to client side rendering if any queries fail. This also acts as a form
// of retrying from the browser.
var serverRender = (function (root, logger) {
  return reactApollo.getDataFromTree(root).catch(function (e) {
    logger && logger.error('SSR Failed with Error', e);
  });
});

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
// We should have better flow types for the schema
var GraphQLSchemaToken = fusionCore.createToken('GraphQlSchemaToken');
var ApolloContextToken = fusionCore.createToken('ApolloContextToken');
var ApolloCacheContext = React.createContext();
var GraphQLEndpointToken = fusionCore.createToken('GraphQLEndpointToken');
var ApolloClientToken = fusionCore.createToken('ApolloClientToken');

var _templateObject = /*#__PURE__*/ _taggedTemplateLiteralLoose(["\n            <script type=\"application/json\" id=\"__APOLLO_STATE__\">\n              ", "\n            </script>\n          "], ["\n            <script type=\"application/json\" id=\"__APOLLO_STATE__\">\n              ", "\n            </script>\n          "]);

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env browser */
function getDeps() {
  return {
    getApolloClient: ApolloClientToken
  };
}

var plugin = (function (renderFn) {
  return fusionCore.createPlugin({
    deps: getDeps(),
    provides: function provides(deps) {
      {
        return renderFn;
      }

      return function (el, ctx) {
        return serverRender(el, deps.logger).then(function () {
          return renderFn(el, ctx);
        });
      };
    },
    middleware: function middleware(_ref) {
      var schema = _ref.schema,
          _ref$endpoint = _ref.endpoint,
          endpoint = _ref$endpoint === void 0 ? '/graphql' : _ref$endpoint,
          getApolloClient = _ref.getApolloClient,
          _ref$apolloContext = _ref.apolloContext;

      var renderMiddleware = function renderMiddleware(ctx, next) {
        return new Promise(function ($return, $error) {
          var initialState, apolloState, client;

          if (!ctx.element) {
            return $return(next());
          }

          initialState = null;

          {
            apolloState = document.getElementById('__APOLLO_STATE__');

            if (apolloState) {
              initialState = JSON.parse(fusionCore.unescape(apolloState.textContent));
            }
          } // Create the client and apollo provider


          client = getApolloClient(ctx, initialState);
          ctx.element = React.createElement(ApolloCacheContext.Provider, {
            value: client.cache
          }, React.createElement(reactApollo.ApolloProvider, {
            client: client
          }, ctx.element));
          return Promise.resolve(next()).then(function ($await_1) {
            try {
              return $return();
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }, $error);
        });
      };

      {
        return renderMiddleware;
      }
    }
  });
});

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
var GetApolloClientCacheToken = fusionCore.createToken('GetApolloClientCacheToken');
var ApolloClientCredentialsToken = fusionCore.createToken('ApolloClientCredentialsToken');
var ApolloClientDefaultOptionsToken = fusionCore.createToken('ApolloClientDefaultOptionsToken');
var GetApolloClientLinksToken = fusionCore.createToken('GetApolloClientLinksToken');
var ApolloClientResolversToken = fusionCore.createToken('ApolloClientResolversToken');

function Container() {}

var ApolloClientPlugin = fusionCore.createPlugin({
  deps: {
    getCache: GetApolloClientCacheToken.optional,
    endpoint: GraphQLEndpointToken.optional,
    fetch: fusionTokens.FetchToken,
    includeCredentials: ApolloClientCredentialsToken.optional,
    apolloContext: ApolloContextToken.optional,
    getApolloLinks: GetApolloClientLinksToken.optional,
    schema: GraphQLSchemaToken.optional,
    resolvers: ApolloClientResolversToken.optional,
    defaultOptions: ApolloClientDefaultOptionsToken.optional
  },
  provides: function provides(_ref) {
    var _ref$getCache = _ref.getCache,
        getCache = _ref$getCache === void 0 ? function (ctx) {
      return new apolloCacheInmemory.InMemoryCache();
    } : _ref$getCache,
        _ref$endpoint = _ref.endpoint,
        endpoint = _ref$endpoint === void 0 ? '/graphql' : _ref$endpoint,
        fetch = _ref.fetch,
        _ref$includeCredentia = _ref.includeCredentials,
        includeCredentials = _ref$includeCredentia === void 0 ? 'same-origin' : _ref$includeCredentia,
        _ref$apolloContext = _ref.apolloContext,
        apolloContext = _ref$apolloContext === void 0 ? function (ctx) {
      return ctx;
    } : _ref$apolloContext,
        getApolloLinks = _ref.getApolloLinks,
        schema = _ref.schema,
        resolvers = _ref.resolvers,
        defaultOptions = _ref.defaultOptions;

    function getClient(ctx, initialState) {
      var cache = getCache(ctx);
      var connectionLink = schema && false ? new apolloLinkSchema.SchemaLink({
        schema: schema,
        context: typeof apolloContext === 'function' ? apolloContext(ctx) : apolloContext
      }) : new apolloLinkHttp.HttpLink({
        uri: endpoint,
        credentials: includeCredentials,
        fetch: fetch
      });
      var links = getApolloLinks ? getApolloLinks([connectionLink], ctx) : [connectionLink];
      var client = new apolloClient.ApolloClient({
        ssrMode: false,
        connectToDevTools: true && process.env.NODE_ENV !== "production",
        link: apolloLink.from(links),
        cache: cache.restore(initialState),
        resolvers: resolvers,
        defaultOptions: defaultOptions
      });
      return client;
    }

    return function (ctx, initialState) {
      if (ctx.memoized.has(Container)) {
        return ctx.memoized.get(Container);
      }

      var client = getClient(ctx, initialState);
      ctx.memoized.set(Container, client);
      return client;
    };
  }
});

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function gql(path) {
  throw new Error('fusion-plugin-apollo/gql should be replaced at build time');
}

exports.ApolloRenderEnhancer = plugin;
exports.gql = gql;
exports.GraphQLSchemaToken = GraphQLSchemaToken;
exports.ApolloContextToken = ApolloContextToken;
exports.ApolloCacheContext = ApolloCacheContext;
exports.GraphQLEndpointToken = GraphQLEndpointToken;
exports.ApolloClientToken = ApolloClientToken;
exports.GetApolloClientCacheToken = GetApolloClientCacheToken;
exports.ApolloClientCredentialsToken = ApolloClientCredentialsToken;
exports.ApolloClientDefaultOptionsToken = ApolloClientDefaultOptionsToken;
exports.GetApolloClientLinksToken = GetApolloClientLinksToken;
exports.ApolloClientResolversToken = ApolloClientResolversToken;
exports.ApolloClientPlugin = ApolloClientPlugin;
//# sourceMappingURL=browser.es5.js.map
