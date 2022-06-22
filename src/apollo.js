import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
const GRAPHQL_HOST = process.env.REACT_APP_GRAPHQL_HOST || "localhost:8080";
const GRAPHQL_HOST_ADMIN_SECRET = process.env.REACT_APP_GRAPHQL_HOST_ADMIN_SECRET;

const scheme = (proto) =>
  window.location.protocol === "https:" ? `${proto}s` : proto;

const splitter = ({ query }) => {
  const { kind, operation } = getMainDefinition(query) || {};
  const isSubscription =
    kind === "OperationDefinition" && operation === "subscription";
  return isSubscription;
};

const cache = new InMemoryCache();

const wsURI = `${scheme("ws")}://${GRAPHQL_HOST}/v1/graphql`;
const httpurl = `${scheme("http")}://${GRAPHQL_HOST}/v1/graphql`;

const wsLink = new GraphQLWsLink(createClient({
  url: wsURI,
  connectionParams: {
    reconnect: true,
    headers: {
      "content-type":"application/json",
      'x-hasura-admin-secret': GRAPHQL_HOST_ADMIN_SECRET
    }
  },
}));


const httpLink = new HttpLink({
  uri: httpurl,
  headers: {
    "content-type":"application/json",
    'x-hasura-admin-secret': GRAPHQL_HOST_ADMIN_SECRET
  }
});

const link = split(splitter, wsLink, httpLink);
const client = new ApolloClient({ link, cache });
export default client;
