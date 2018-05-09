# GraphQL workshop

<!-- TOC -->

* [GraphQL workshop](#graphql-workshop)
  * [Introduction](#introduction)
  * [Motivation: REST and some headaches over time](#motivation-rest-and-some-headaches-over-time)
    * [Data requirements changes over time](#data-requirements-changes-over-time)
    * [GraphQL is a 🌟 here](#graphql-is-a-🌟-here)
  * [Getting started](#getting-started)
    * [Folder Structure](#folder-structure)
    * [How to work](#how-to-work)
    * [URLs](#urls)
    * [Test query](#test-query)
    * [Run test watcher](#run-test-watcher)
* [Implementing your posts resolver - `posts.spec.js`](#implementing-your-posts-resolver---postsspecjs)
  * [definition](#definition)
    * [should exist on schema](#should-exist-on-schema)
    * [should contain fields _[...]_](#should-contain-fields-__)
    * [Query.posts should be defined](#queryposts-should-be-defined)
  * [querying posts](#querying-posts)
    * [without params](#without-params)
      * [returns a post array](#returns-a-post-array)
      * [returns posts](#returns-posts)
    * [with `limit` argument](#with-limit-argument)
    * [when getting related users](#when-getting-related-users)
      * [can return the users' handle](#can-return-the-users-handle)
      * [can return the users' firstName](#can-return-the-users-firstname)
      * [can batch fetch users](#can-batch-fetch-users)
* [What's next?](#whats-next)
  * [Ideas for challenges](#ideas-for-challenges)
  * [Deploy using now.sh](#deploy-using-nowsh)
    * [… your REST-service](#-your-rest-service)
    * [… your GraphQL-service](#-your-graphql-service)
    * [… your React-app](#-your-react-app)

<!-- /TOC -->

## Introduction

The goal of the workshop is to create your own GraphQL-server that acts as a gateway on top of a few REST-services.

We assume that all participants have a basic idea of GraphQL is and have seen a GraphQL-query before.

In this workshop we will be covering:

* Creating a Hello World GraphQL-app
* Proxying requests from existing REST-service
* Tying different data types in your REST-service together in a graph
* Optional: Batch fetching of resources
* Optional: Creating a little server-rendered React app that uses your service

## Motivation: REST and some headaches over time

So. We're building a blog site and we're designing the API for it too.

If you start by installing (`npm i`) & running the project (`npm run dev`) you can see that the REST service exposes a few endpoints.

When querying http://localhost:3101/posts?_limit=10 we get a list of this sort of objects:

```json
{
  "id": "post21",
  "title": "Quod maiores eveniet",
  "slug": "Et-velit-harum-voluptas-quasi-ad-in-ut.",
  "text": "Quod nobis eveniet minima blandit [..]",
  "user": {
    "id": "user1",
    "handle": "Jillian_Brakus24"
  }
}
```

And when querying http://localhost:3101/users we get this sort of objects:

```json
{
  "id": "user1",
  "handle": "Jillian_Brakus24",
  "firstName": "Jillian",
  "lastName": "Brakus",
  "url": null,
  "job": {
    "title": "District Communications Supervisor",
    "area": "Operations",
    "type": "Architect",
    "companyName": "Homenick, Leffler and Shanahan"
  }
}
```

Let's say this was the agreement of exactly what information was needed when the page was designed. We wanted to be able to display a list of posts, and together with the post we wanted to display the user's `handle`. Great! This works fine.

### Data requirements changes over time

However, with time we revise the design and decide we also want to display users' `firstName` & `lastName` in the list instead of the handle.

We have a few options:

* Add `firstName` and `lastName` to `/posts`
  * 😷 Increases payload for **all** consumers. Maybe you have a mobile app that doesn't need this, why should those users be punished with a slow experience?
  * 😷 Requires additional work on the backend - the data is already there!
* Build a `/v2/posts`-endpoint or specific endpoint for this client
  * 😷 Maintain new and old endpoints
  * 😷 Doesn't solve same problem in the future
* Add something like dynamic `?fields=..` param to specify which fields you want to return
  * 😷 Not part of REST-spec
  * 😷 Quite difficult to structure and write good resolvers
  * 😷 Hard to test properly and quite messy to dynamically build this query string
  * 😷 Does not work nicely when there's complex structures like arrays or nested objects
* Request `/user?=id=..` for each user in posts
  * 😷 Extra roundtrips to server. Have to fetch requests posts, and then each user. Inefficent.
  * 😷 Over-fetching: you'll get more data than you actually need on the users. Slow.
  * 😷 A lot of glue code on the clients to put the objects together

### GraphQL is a 🌟 here

In GraphQL, you define your types and their relationships on a graph and let the consumer request exactly what data they need, and they'll receive just that - no more, no less.

Assume you have implemented a GraphQL-server with this schema:

```graphql
type Query {
  posts(limit: Int page: Int) [Post!]!
}

type Post {
  id: String!
  title: String!
  slug: String!
  text: String!
  user: User!
}

type User {
  id: String!
  handle: String!
  url: String
  firstName: String!
  lastName: String!
}
```

You can then let the client request exactly what they want with a query like this:

```graphql
query {
  posts(limit: 1) {
    id
    title
    slug
    text
    user {
      id
      firstName
      lastName
    }
  }
}
```

This would give the following output:

```json
{
  "data": [
    {
      "id": "post21",
      "title": "Quod maiores eveniet",
      "slug": "Et-velit-harum-voluptas-quasi-ad-in-ut.",
      "text": "Quod nobis eveniet minima blandit [..]",
      "user": {
        "id": "user1",
        "firstName": "Jillian",
        "lastName": "Brakus"
      }
    }
  ]
}
```

Isn't that nicer? You can define your data requirements in your client rather than hardcoding them in the API.

## Getting started

```sh
git clone git@github.com:KATT/graphql-workshop.git
cd graphql-workshop
npm i
npm run dev
```

### Folder Structure

```
.
|-- graphql: graphql service (this is the main working directory)
|  |-- src
|  |  |-- index.js: entry point of app, starts server
|  |  |-- server.js: graphql server. ❗ where we'll be writing all our logic
|  |  `-- schema.graphql: graphql definition of our API
|  |-- test
|  |  |-- query: tests for grapql queries
|  |  |   |-- hello.spec.js: tests for `query.hello`
|  |  |   `-- posts.spec.js: tests for `query.posts` ❗
|-- rest: mock REST service running with resources `posts`, `users`, &, `comments`
|  `-- [..]
|  | -- [..]
```

### How to work

The whole workshop is in TDD-style. We have tests written in [`graphql/test/query`](graphql/test/query) and your job is to gradually remove `.skip()` and make them pass with the help of the paired markdown-file.

### URLs

* http://localhost:3100 - your GraphQL-server
* http://localhost:3101 - your REST-server
* http://localhost:3200 - your React app

### Test query

Start by opening http://localhost:3100 (after `npm run dev`) to see your GraphQL playground and get familiar with the project.

Try this query:

```graphql
{
  hello(name: "World")
}
```

This query takes an input argument called `name` and outputs it in the results. See in the [`schema.graphql`](graphql/src/schema.graphql) & [`server.js`](graphql/src/server.js) & how it fits togeter.

This is the equivalent of doing the following query in `curl`

```sh
curl 'http://localhost:3100/' \
    -H 'content-type: application/json' \
    --data-binary '{"query":"{ hello(name: \"World\") } "}' \
    --compressed
```

It's a simple POST request containg the `query` string in a JSON body. All requests follow this structure - it's always a POST to the same endpoint.

### Run test watcher

To start the test watcher run: `npm t -- --watch`

# Implementing your posts resolver - `posts.spec.js`

Now, head over to [`graphql/test/query/posts.spec.js`](graphql/test/query/posts.spec.js) and remove `.skip()` from the first integration test.

🌟 Bonus: If you're running vscode and installed the recommended jest plugin you can get your test results in the editor.

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
* `id` and `title` are fields on the `Post` type. That means that `id` and `title` are the only fields that can appear in any part of a GraphQL query that operates on the `Post` type.
* `String` is one of the built-in _scalar_ types (together with `Float`/`Int`/`Boolean`) - these are types that resolve to a single scalar object, and can't have sub-selections in the query. Think of it as a primitive type for now.
* `String!` means that the field is non-nullable, meaning that the GraphQL service promises to always give you a value when you query this field. In the type language, we'll represent those with an exclamation mark.

### should exist on schema

Take the post definition above and add it to `schema.graphql`

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

### with `limit` argument

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
if (args.limit) {
  query._limit = args.limit;
}

const search = `?${querystring.stringify(query)}`;
const posts = await request({
  uri: `${REST_SERVICE_URL}/posts${search}`,
  json: true,
});
```

### when getting related users

#### can return the users' handle

* Define a `User` type
* Define the relation between `Post` and `User` (`User!`)

#### can return the users' firstName

Since the `/posts` endpoint don't contain the users' `firstName`s, you need to resolve the related `/users?id=x` when you resolve a post.

In your resolvers, you need to add a `Post` resolver, like this

```js
Post: {
  user: async (post, args, ctx) => {
    // ..
```

The first argument when resolving any field on a type will be the source object, in this case, your post. You can use this to fetch the user on `/users/${post.user.id}`.

#### can batch fetch users

It is quite inefficent to do one user request per post & since our REST-API allows us to batch fetch users based on their ids, we'd like to leverage that.

We are able to fetch several users at once by calling [`/users?id=user1&id=user2&..`](http://localhost:3101/users/?id=user1&id=user2).

There's a library called [DataLoader](https://github.com/facebook/dataloader) which has a neat approach to this sort of problem. Basically, you create a dataloader where you define how to batch fetch objects based on a list of identifiers and then you use said data loader to load all of your objects. If the same id has already been fetched, it's simply returned or otherwise it will be fetch in the next batch request.

When we define our `GraphQLServer` we can define a `context` object. The context we create is unique for each request to our API, hence we can create a cached dataloader here that will exist only for this request.

The third argument in our resolvers are always said context object, and we can use this to call our loader (`ctx.userById.load(post.user.id)`).

# What's next?

Once you've done the above you should be equipped with knowledge to define your GraphQL-schema and write your own resolvers.

## Ideas for challenges

* Make it into an actual blog! Try to add the queries so that [`web/`](web) works (server-rendered React app using Next.js)
* Add `limit` and `page` for pagination.
* `Comment` <-> `Post` relationship + resolvers
* Ability to add posts / comments (Mutations)
* Try deploying your services using [now.sh](https://now.sh/)

## Deploy using now.sh

```
npm i now -g
```

### … your REST-service

```sh
cd rest
now
```

### … your GraphQL-service

First, get the URL of your REST-service

Then,

```sh
cd graphql
now -e REST_SERVICE_URL=https://...something.now.sh
```

### … your React-app

Get the URL from your GraphQL-service.

```sh
cd web
now -e GRAPHQL_URL=https://...something.now.sh
```
