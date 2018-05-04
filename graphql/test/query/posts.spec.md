# query.posts

<!-- TOC -->

* [query.posts](#queryposts)
  * [definition](#definition)
    * [should exist on schema](#should-exist-on-schema)
    * [should contain fields _[...]_](#should-contain-fields-__)
    * [Query.posts should be defined](#queryposts-should-be-defined)
  * [querying posts](#querying-posts)
    * [without params](#without-params)
      * [returns a post array](#returns-a-post-array)
      * [returns posts](#returns-posts)
  * [with `limit` argument](#with-limit-argument)

<!-- /TOC -->

## definition

What is a post?

```graphql
type Post {
  id: String!
  title: String!
  # [... TBC]
}
```

* `Post` is a _GraphQL Object Type_, meaning it's a type with some fields. Most of the types in your schema will be object types.
* `id` and `title` are fields on the Character type. That means that `id` and `title` are the only fields that can appear in any part of a GraphQL query that operates on the `Post` type.
* `String` is one of the built-in _scalar_ types (together with `Float`/`Int`/`Boolean`) - these are types that resolve to a single scalar object, and can't have sub-selections in the query. Think of it as a primitive type for now.
* `String!` means that the field is non-nullable, meaning that the GraphQL service promises to always give you a value when you query this field. In the type language, we'll represent those with an exclamation mark.

### should exist on schema

Take the post definition and add it to `schema.graphql`

### should contain fields _[...]_

Look at a post object in http://localhost:3101/posts and add the remaining fields. You can skip `user` for now, we will return to that later.

### Query.posts should be defined

In order to query your API for posts, you need to define a query for posts.

We do that by defining the following on your root `type Query`

```graphql
type Query {
  # [...other resolvers]
  posts: [Post!]!
}
```

## querying posts

### without params

#### returns a post array

In order to get your GraphQL API to return something based on your definition, you need to define _resolvers_ for your queries.

For starters, in order to fulfill this test, all you need to have is a resolver that returns an array.

In `server.js` there's an object of resolvers - on `Query`, add a `posts` field.

```js
const resolvers = {
  Query: {
    // [..]
    posts: async (source, args) => {
      return [];
    },
  },
};
```

We want this to do external requests later on (or maybe in another app it'd be a DB query), so and `async` function is preferred.

#### returns posts

The REST-API returns an endpoint, `/posts`, where you can fetch all post resources.

Here's a tip:

```js
await request({
  uri: `${REST_SERVICE_URL}/posts`,
  json: true,
});

return posts;
```

## with `limit` argument

You probably want to limit the results & you don't want to do that on the GraphQL-side, it's nicer to just pass on the limit to the underlying service and make use of it's pagination.

In order to do this you need to build up a query string.

The endpoint you want to query is the following: http://localhost:3101/posts?_limit=2

First, you need to add to your GraphQL-schema that you want to accept arguemnt `limit` and which type it is.

```graphql
posts(limit: Int): [Post!]!
```

Secondly, you want to use this argument to build up a query in the resolver.

```js
const query = {};
if (args, 'limit') {
  query._limit = args.limit;
}

const search = `?${querystring.stringify(query)}`;
const posts = await request({
  uri: `${REST_SERVICE_URL}/posts${search}`,
  json: true,
});
```
