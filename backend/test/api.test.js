const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const { createApp, parseCoordinate, verifyJwt, validateBidRisk } = require("../server");

const request = async (app, path, options = {}) => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      ...options,
      headers: { "content-type": "application/json", ...(options.headers || {}) },
    });
    const body = await response.json();
    return { status: response.status, body };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

const chain = (value) => ({
  sort: () => ({ lean: async () => value }),
  limit: () => value,
});

const makeUserModel = () => {
  const users = [];
  return {
    users,
    async findOne(query) {
      if (query.refreshTokenHash) return users.find((user) => user.refreshTokenHash === query.refreshTokenHash) || null;
      return users.find((user) => user.email === query.email) || null;
    },
    async findById(id) {
      return users.find((user) => String(user._id) === String(id)) || null;
    },
    async create(data) {
      const user = {
        _id: String(users.length + 1),
        reputation: 50,
        completedContracts: 0,
        walletAddress: "",
        refreshTokenHash: "",
        async save() {
          return this;
        },
        ...data,
      };
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
    find: () => chain(posts),
    async findByIdAndUpdate(id, update) {
      const post = posts.find((candidate) => candidate._id === id);
      if (!post) return null;
      if (update.$inc?.likes) post.likes += update.$inc.likes;
      if (update.$push?.comments) {
        post.comments.push({ _id: `${id}-${post.comments.length + 1}`, ...update.$push.comments });
      }
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
    Location: { find: () => chain([]), findById: async () => null },
    MLPrediction: {},
    Bid: { find: () => chain([]) },
    RepairContract: { find: () => chain([]) },
    AuditLog: { create: async () => ({}) },
  });
});

test("parseCoordinate validates ranges", () => {
  assert.equal(parseCoordinate("28.6", -90, 90), 28.6);
  assert.equal(parseCoordinate("91", -90, 90), null);
  assert.equal(parseCoordinate("nope", -90, 90), null);
});

test("register creates user with JWT access and refresh token", async () => {
  const response = await request(app, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Asha", email: "asha@example.com", password: "password1" }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, "asha@example.com");
  assert.equal(response.body.user.role, "citizen");
  assert.equal(verifyJwt(response.body.accessToken).email, "asha@example.com");
  assert.ok(response.body.refreshToken);
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

test("community posts require auth and support create, like, comments", async () => {
  const unauth = await request(app, "/community/posts", {
    method: "POST",
    body: JSON.stringify({ body: "Large pothole near the flyover" }),
  });
  assert.equal(unauth.status, 401);

  const auth = await request(app, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Asha", email: "asha@example.com", password: "password1" }),
  });
  const headers = { authorization: `Bearer ${auth.body.accessToken}` };

  const created = await request(app, "/community/posts", {
    method: "POST",
    headers,
    body: JSON.stringify({ body: "Large pothole near the flyover" }),
  });
  assert.equal(created.status, 201);

  const liked = await request(app, `/community/posts/${created.body._id}/like`, {
    method: "POST",
    headers,
    body: "{}",
  });
  assert.equal(liked.body.likes, 1);

  const commented = await request(app, `/community/posts/${created.body._id}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ body: "Confirmed this morning" }),
  });
  assert.equal(commented.body.comments.length, 1);
});

test("bid risk flags extreme bids", () => {
  assert.deepEqual(validateBidRisk({ estimatedCost: 50000, bidAmount: 48000 }), {
    isSuspicious: false,
    riskScore: 5,
    recommendedAction: "accept",
  });
  assert.equal(validateBidRisk({ estimatedCost: 50000, bidAmount: 200000 }).recommendedAction, "reject");
  assert.equal(validateBidRisk({ estimatedCost: 50000, bidAmount: 5000 }).recommendedAction, "reject");
});
