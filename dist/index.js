'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var reactApollo = require('react-apollo');
var React = _interopDefault(require('react'));
var fusionCore = require('fusion-core');
var fusionTokens = require('fusion-tokens');
var apolloServerKoa = require('apollo-server-koa');
var compose = _interopDefault(require('koa-compose'));
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
var serverRender = ((root, logger) => {
  return reactApollo.getDataFromTree(root).catch(e => {
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
const GraphQLSchemaToken = fusionCore.createToken('GraphQlSchemaToken');
const ApolloContextToken = fusionCore.createToken('ApolloContextToken');
const ApolloCacheContext = React.createContext();
const GraphQLEndpointToken = fusionCore.createToken('GraphQLEndpointToken');
const ApolloClientToken = fusionCore.createToken('ApolloClientToken');

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env browser */
function getDeps() {
  {
    return {
      apolloContext: ApolloContextToken.optional,
      logger: fusionTokens.LoggerToken.optional,
      schema: GraphQLSchemaToken.optional,
      endpoint: GraphQLEndpointToken.optional,
      getApolloClient: ApolloClientToken
    };
  } // $FlowFixMe


  return {
    getApolloClient: ApolloClientToken
  };
}

var plugin = (renderFn => fusionCore.createPlugin({
  deps: getDeps(),

  provides(deps) {
    return (el, ctx) => {
      return serverRender(el, deps.logger).then(() => {
        return renderFn(el, ctx);
      });
    };
  },

  middleware({
    schema,
    endpoint = '/graphql',
    getApolloClient,
    apolloContext = ctx => {
      return ctx;
    }
  }) {
    const renderMiddleware = async (ctx, next) => {
      if (!ctx.element) {
        return next();
      }

      let initialState = null;

      const client = getApolloClient(ctx, initialState);
      ctx.element = React.createElement(ApolloCacheContext.Provider, {
        value: client.cache
      }, React.createElement(reactApollo.ApolloProvider, {
        client: client
      }, ctx.element));
      await next();

      {
        // Serialize state into html on server side render
        const initialState = client.cache && client.cache.extract();
        const serialized = JSON.stringify(initialState);
        console.log(serialized);
        const script = fusionCore.html`
            <script type="application/json" id="__APOLLO_STATE__">
              ${serialized}
            </script>
          `;
        ctx.template.body.push(script);
      }
    };

    if (true && schema) {
      const server = new apolloServerKoa.ApolloServer({
        schema,
        // investigate other options
        context: ({
          ctx
        }) => {
          if (typeof apolloContext === 'function') {
            return apolloContext(ctx);
          }

          return apolloContext;
        }
      });
      let serverMiddleware = [];
      server.applyMiddleware({
        // switch to server.getMiddleware once https://github.com/apollographql/apollo-server/pull/2435 lands
        app: {
          use: m => {
            serverMiddleware.push(m);
          }
        },
        // investigate other options
        path: endpoint
      });
      return compose([...serverMiddleware, renderMiddleware]);
    } else {
      return renderMiddleware;
    }
  }

}));

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const GetApolloClientCacheToken = fusionCore.createToken('GetApolloClientCacheToken');
const ApolloClientCredentialsToken = fusionCore.createToken('ApolloClientCredentialsToken');
const ApolloClientDefaultOptionsToken = fusionCore.createToken('ApolloClientDefaultOptionsToken');
const GetApolloClientLinksToken = fusionCore.createToken('GetApolloClientLinksToken');
const ApolloClientResolversToken = fusionCore.createToken('ApolloClientResolversToken');

function Container() {}

const ApolloClientPlugin = fusionCore.createPlugin({
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

  provides({
    getCache = ctx => new apolloCacheInmemory.InMemoryCache(),
    endpoint = '/graphql',
    fetch,
    includeCredentials = 'same-origin',
    apolloContext = ctx => ctx,
    getApolloLinks,
    schema,
    resolvers,
    defaultOptions
  }) {
    function getClient(ctx, initialState) {
      const cache = getCache(ctx);
      const connectionLink = schema && true ? new apolloLinkSchema.SchemaLink({
        schema,
        context: typeof apolloContext === 'function' ? apolloContext(ctx) : apolloContext
      }) : new apolloLinkHttp.HttpLink({
        uri: endpoint,
        credentials: includeCredentials,
        fetch
      });
      const links = getApolloLinks ? getApolloLinks([connectionLink], ctx) : [connectionLink];
      const client = new apolloClient.ApolloClient({
        ssrMode: true,
        connectToDevTools: false && process.env.NODE_ENV !== "production",
        link: apolloLink.from(links),
        cache: cache.restore(initialState),
        resolvers,
        defaultOptions
      });
      return client;
    }

    return (ctx, initialState) => {
      if (ctx.memoized.has(Container)) {
        return ctx.memoized.get(Container);
      }

      const client = getClient(ctx, initialState);
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
//# sourceMappingURL=index.js.map
