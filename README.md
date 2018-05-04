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
    * [Implementing your posts resolver](#implementing-your-posts-resolver)

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
  posts(limit: Int skip: Int) [Post!]!
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
|  |  |   |-- posts.spec.js: tests for `query.posts`
|  |  |   `-- posts.spec.md: ❗ help docs on how to make the tests pass
|-- rest: mock REST service running with resources `posts`, `users`, &, `comments`
|  `-- [..]
|  | -- [..]
```

### How to work

The whole workshop is in TDD-style. We have tests written in [`graphql/test/query`](graphql/test/query) and your job is to gradually remove `.skip()` and make them pass with the help of the paired markdown-file.

### URLs

http://localhost:3100 - your GraphQL-server
http://localhost:3101 - your REST-server

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

### Implementing your posts resolver

Now, head over to [`graphql/test/query/posts.spec.js`](graphql/test/query/posts.spec.js) and remove `.skip()` from the first integration test.

And from now on follow the instructions in [`posts.spec.md`](graphql/test/query/posts.spec.md) to work through getting a fully functional gateway in place.

🌟 Bonus: If you're running vscode and installed the recommended jest plugin you can get your test results in the editor.
