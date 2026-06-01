const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const { createApp, parseCoordinate, verifyToken } = require("../server");

const request = async (app, path, options = {}) => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      headers: { "content-type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const body = await response.json();
    return { status: response.status, body };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

const makeUserModel = () => {
  const users = [];
  return {
    users,
    async findOne(query) {
      return users.find((user) => user.email === query.email) || null;
    },
    async create(data) {
      const user = { _id: String(users.length + 1), ...data };
      users.push(user);
      return user;
    },
  };
};

const makePostModel = () => {
  const posts = [];
  return {
    async create(data) {
      const post = { _id: String(posts.length + 1), likes: 0, comments: [], createdAt: new Date(), ...data };
      posts.unshift(post);
      return post;
    },
    find() {
      return {
        sort() {
          return {
            lean: async () => posts,
          };
        },
      };
    },
    async findByIdAndUpdate(id, update) {
      const post = posts.find((candidate) => candidate._id === id);
      if (!post) return null;
      if (update.$inc?.likes) post.likes += update.$inc.likes;
      if (update.$push?.comments) post.comments.push({ _id: `${id}-${post.comments.length + 1}`, ...update.$push.comments });
      return post;
    },
  };
};

let User;
let CommunityPost;
let app;

beforeEach(() => {
  User = makeUserModel();
  CommunityPost = makePostModel();
  app = createApp({
    User,
    CommunityPost,
    Location: {
      find: () => ({
        sort: () => ({
          lean: async () => [],
        }),
      }),
    },
  });
});

test("parseCoordinate validates ranges", () => {
  assert.equal(parseCoordinate("28.6", -90, 90), 28.6);
  assert.equal(parseCoordinate("91", -90, 90), null);
  assert.equal(parseCoordinate("nope", -90, 90), null);
});

test("register creates a user and signed token", async () => {
  const response = await request(app, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Asha", email: "asha@example.com", password: "password1" }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, "asha@example.com");
  assert.equal(verifyToken(response.body.token).email, "asha@example.com");
});

test("login rejects invalid credentials", async () => {
  await request(app, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Asha", email: "asha@example.com", password: "password1" }),
  });

  const response = await request(app, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "asha@example.com", password: "wrongpass" }),
  });

  assert.equal(response.status, 401);
});

test("community posts support create, like, and comments", async () => {
  const created = await request(app, "/community/posts", {
    method: "POST",
    body: JSON.stringify({ author: "Asha", body: "Large pothole near the flyover" }),
  });

  assert.equal(created.status, 201);

  const liked = await request(app, `/community/posts/${created.body._id}/like`, {
    method: "POST",
    body: "{}",
  });
  assert.equal(liked.body.likes, 1);

  const commented = await request(app, `/community/posts/${created.body._id}/comments`, {
    method: "POST",
    body: JSON.stringify({ author: "Ravi", body: "Confirmed this morning" }),
  });
  assert.equal(commented.body.comments.length, 1);
});
