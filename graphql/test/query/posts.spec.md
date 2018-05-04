# query.posts

<!-- TOC -->

* [query.posts](#queryposts)
  * [definition](#definition)
    * [should exist on schema](#should-exist-on-schema)
    * [should contain fields _[...]_](#should-contain-fields-__)
    * [Query.posts should be defined](#queryposts-should-be-defined)
  * [query without params](#query-without-params)
    * [returns a post array](#returns-a-post-array)
    * [returns posts](#returns-posts)

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

## query without params

### returns a post array

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

### returns posts

The REST-API returns an endpoint, `/posts`, where you can fetch all post resources.
