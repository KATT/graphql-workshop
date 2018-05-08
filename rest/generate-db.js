const _ = require('lodash');
const faker = require('faker');
const { writeFileSync } = require('fs');

const nUsers = 20;
const maxPostsPerUser = 5;
const maxCommentsPerPost = 15;

const users = _.times(nUsers, () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    id: _.uniqueId('user'),
    handle: faker.internet.userName(firstName, lastName),
    firstName,
    lastName,
    url: _.random(0, 1) === 0 ? faker.internet.url() : null,
    job: {
      title: faker.name.jobTitle(),
      area: faker.name.jobArea(),
      type: faker.name.jobType(),
      companyName: faker.company.companyName(),
    },
  };
});

const posts = users.reduce((res, user) => {
  const userPosts = _.times(_.random(0, maxPostsPerUser), () => {
    const title = faker.lorem.sentence();
    return {
      id: _.uniqueId('post'),
      title: faker.lorem.sentence(),
      slug: faker.helpers.slugify(title).toLowerCase(),
      text: faker.lorem.paragraphs(_.random(2, 15)),
      user: {
        id: user.id,
        handle: user.handle,
      },
    };
  });
  return [...res, ...userPosts];
}, []);

const comments = posts.reduce((res, post) => {
  const postComments = _.times(_.random(0, maxCommentsPerPost), () => {
    const user = _.sample(users);

    return {
      id: _.uniqueId('comment'),
      text: faker.lorem.sentence(),
      post: {
        id: post.id,
        title: post.title,
      },
      user: {
        id: user.id,
        handle: user.handle,
      },
    };
  });

  return [...res, ...postComments];
}, []);

const db = { users, comments, posts };

writeFileSync(__dirname + '/db.json', JSON.stringify(db, null, 2));
