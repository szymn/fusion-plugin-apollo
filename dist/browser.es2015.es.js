import { ApolloProvider } from 'react-apollo';
import ReactDOM from 'react-dom';
import React from 'react';
import { createToken, createPlugin } from 'fusion-core';
import { prepare } from 'fusion-react';

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env node */

/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/* eslint-env browser */
var clientRender = (root => {
  const domElement = document.getElementById('root');

  if (!domElement) {
    throw new Error("Could not find 'root' element");
  }

  ReactDOM.hydrate ? ReactDOM.hydrate(root, domElement) : ReactDOM.render(root, domElement);
});

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
  return {
    getApolloClient: ApolloClientToken
  };
}

var Plugin = createPlugin({
  deps: getDeps(),

  provides(deps) {
    return (el, ctx) => new Promise(function ($return, $error) {
      return $return(prepare(el).then(() => clientRender(el)));
    });
  },

  middleware({
    schema,
    endpoint = '/graphql',
    getApolloClient,
    apolloContext = ctx => ctx
  }) {
    const renderMiddleware = (ctx, next) => {
      if (!ctx.element) {
        return next();
      }

      let initialState = null;

      {
        // Deserialize initial state for the browser
        const apolloState = document.getElementById('__APOLLO_STATE__');

        if (apolloState) {
          initialState = JSON.parse(unescape(apolloState.textContent));
        }
      } // Create the client and apollo provider


      const client = getApolloClient(ctx, initialState);
      ctx.element = React.createElement(ApolloCacheContext.Provider, {
        value: client.cache
      }, React.createElement(ApolloProvider, {
        client: client
      }, ctx.element));

      return next();
    };

    {
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
//# sourceMappingURL=browser.es2015.es.js.map
