import { renderToStringWithData, ApolloProvider } from 'react-apollo';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { createToken, createPlugin, html } from 'fusion-core';
import { prepare } from 'fusion-react';
import { LoggerToken } from 'fusion-tokens';
import { ApolloServer } from 'apollo-server-koa';
import compose from 'koa-compose';

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
  return renderToStringWithData(root).catch(e => {
    logger && logger.error('SSR Failed with Error', e);
    return renderToString(root);
  }).then(content => {
    return `<div id='root'>${content}</div>`;
  });
});

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env browser */

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
// We should have better flow types for the schema
const GraphQLSchemaToken = createToken('GraphQlSchemaToken');
const ApolloContextToken = createToken('ApolloContextToken');
const ApolloCacheContext = React.createContext();
const GraphQLEndpointToken = createToken('GraphQLEndpointToken');
const ApolloClientToken = createToken('ApolloClientToken');

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
      logger: LoggerToken.optional,
      schema: GraphQLSchemaToken.optional,
      endpoint: GraphQLEndpointToken.optional,
      getApolloClient: ApolloClientToken
    };
  } // $FlowFixMe


  return {
    getApolloClient: ApolloClientToken
  };
}

var Plugin = createPlugin({
  deps: getDeps(),

  provides(deps) {
    return async (el, ctx) => {
      return prepare(el).then(() => {
        return serverRender(el, deps.logger);
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
    const renderMiddleware = (ctx, next) => {
      if (!ctx.element) {
        return next();
      }

      let initialState = null;

      const client$$1 = getApolloClient(ctx, initialState);
      ctx.element = React.createElement(ApolloCacheContext.Provider, {
        value: client$$1.cache
      }, React.createElement(ApolloProvider, {
        client: client$$1
      }, ctx.element));

      {
        // Serialize state into html on server side render
        const initialState = client$$1.cache && client$$1.cache.extract();
        const serialized = JSON.stringify(initialState);
        const script = html`
          <script type="application/json" id="__APOLLO_STATE__">
            ${serialized}
          </script>
        `;
        ctx.template.body.push(script);
      }

      return next();
    };

    if (true && schema) {
      const server = new ApolloServer({
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

export default Plugin;
export { gql, GraphQLSchemaToken, ApolloContextToken, ApolloCacheContext, GraphQLEndpointToken, ApolloClientToken };
//# sourceMappingURL=index.es.js.map
