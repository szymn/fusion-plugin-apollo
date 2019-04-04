'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var reactApollo = require('react-apollo');
var ReactDOM = _interopDefault(require('react-dom'));
var React = _interopDefault(require('react'));
var fusionCore = require('fusion-core');
var fusionReact = require('fusion-react');

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
var clientRender = (function (root) {
  var domElement = document.getElementById('root');

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
var GraphQLSchemaToken = fusionCore.createToken('GraphQlSchemaToken');
var ApolloContextToken = fusionCore.createToken('ApolloContextToken');
var ApolloCacheContext = React.createContext();
var GraphQLEndpointToken = fusionCore.createToken('GraphQLEndpointToken');
var ApolloClientToken = fusionCore.createToken('ApolloClientToken');

var _templateObject = /*#__PURE__*/ _taggedTemplateLiteralLoose(["\n          <script type=\"application/json\" id=\"__APOLLO_STATE__\">\n            ", "\n          </script>\n        "], ["\n          <script type=\"application/json\" id=\"__APOLLO_STATE__\">\n            ", "\n          </script>\n        "]);

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

var Plugin = fusionCore.createPlugin({
  deps: getDeps(),
  provides: function provides(deps) {
    return function (el, ctx) {
      return new Promise(function ($return, $error) {
        return $return(fusionReact.prepare(el).then(function () {
          return clientRender(el);
        }));
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
      if (!ctx.element) {
        return next();
      }

      var initialState = null;

      {
        // Deserialize initial state for the browser
        var apolloState = document.getElementById('__APOLLO_STATE__');

        if (apolloState) {
          initialState = JSON.parse(unescape(apolloState.textContent));
        }
      } // Create the client and apollo provider


      var client = getApolloClient(ctx, initialState);
      ctx.element = React.createElement(ApolloCacheContext.Provider, {
        value: client.cache
      }, React.createElement(reactApollo.ApolloProvider, {
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

exports.default = Plugin;
exports.gql = gql;
exports.GraphQLSchemaToken = GraphQLSchemaToken;
exports.ApolloContextToken = ApolloContextToken;
exports.ApolloCacheContext = ApolloCacheContext;
exports.GraphQLEndpointToken = GraphQLEndpointToken;
exports.ApolloClientToken = ApolloClientToken;
//# sourceMappingURL=browser.es5.js.map
