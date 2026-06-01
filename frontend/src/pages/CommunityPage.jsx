import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CommunityPage = () => {
  const [locations, setLocations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [postBody, setPostBody] = useState("");
  const [author, setAuthor] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [locationRes, postRes] = await Promise.all([
          axios.get(`${API_URL}/locations`),
          axios.get(`${API_URL}/community/posts`),
        ]);
        setLocations(locationRes.data);
        setPosts(postRes.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError("Failed to load community reports.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = locations
    .filter((loc) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return String(loc.latitude).includes(s) || String(loc.longitude).includes(s);
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

  const createPost = async (e) => {
    e.preventDefault();
    if (!postBody.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/community/posts`, {
        author: author.trim() || "Citizen",
        body: postBody.trim(),
      });
      setPosts((current) => [res.data, ...current]);
      setPostBody("");
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post.");
    }
  };

  const likePost = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/community/posts/${id}/like`);
      setPosts((current) => current.map((post) => (post._id === id ? res.data : post)));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const commentOnPost = async (id) => {
    const body = commentDrafts[id]?.trim();
    if (!body) return;
    try {
      const res = await axios.post(`${API_URL}/community/posts/${id}/comments`, {
        author: author.trim() || "Citizen",
        body,
      });
      setPosts((current) => current.map((post) => (post._id === id ? res.data : post)));
      setCommentDrafts((current) => ({ ...current, [id]: "" }));
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen bg-asphalt-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <span className="badge badge-warn mb-3">Community</span>
          <h1 className="text-3xl md:text-4xl font-display text-white mb-3">Citizen Reports</h1>
          <p className="text-road-light max-w-xl">
            A live feed of road damage reports from citizens across the network. Every report
            contributes to safer roads.
          </p>
        </div>

        {/* Composer */}
        <form onSubmit={createPost} className="card p-5 mb-8">
          <div className="grid sm:grid-cols-[180px_1fr_auto] gap-3">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="input"
              maxLength={80}
            />
            <input
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Share an update, ask a question, or coordinate repair awareness"
              className="input"
              maxLength={1000}
            />
            <button type="submit" className="btn-primary rounded-xl" disabled={!postBody.trim()}>
              Post
            </button>
          </div>
        </form>

        {/* Community posts */}
        {!loading && posts.length > 0 && (
          <div className="grid gap-4 mb-10">
            {posts.map((post) => (
              <div key={post._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{post.author || "Citizen"}</p>
                    <p className="text-xs text-road mt-0.5">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => likePost(post._id)}
                    className="btn-ghost text-xs"
                  >
                    Like ({post.likes || 0})
                  </button>
                </div>
                <p className="text-road-light text-sm mt-4">{post.body}</p>
                {post.comments?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-asphalt-700 pt-4">
                    {post.comments.map((comment) => (
                      <div key={comment._id || comment.createdAt} className="text-xs text-road-light">
                        <span className="text-warn">{comment.author || "Citizen"}:</span>{" "}
                        {comment.body}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <input
                    value={commentDrafts[post._id] || ""}
                    onChange={(e) =>
                      setCommentDrafts((current) => ({ ...current, [post._id]: e.target.value }))
                    }
                    placeholder="Write a comment"
                    className="input text-xs"
                    maxLength={500}
                  />
                  <button
                    type="button"
                    onClick={() => commentOnPost(post._id)}
                    className="btn-secondary text-xs rounded-xl"
                  >
                    Comment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-road"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by coordinates..."
              className="input pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input w-auto min-w-[160px] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Stats bar */}
        {!loading && locations.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-2xl font-display text-warn">{locations.length}</div>
              <div className="text-xs text-road uppercase tracking-wider mt-1">Total Reports</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-display text-white">
                {locations.filter((l) => l.videoPath).length}
              </div>
              <div className="text-xs text-road uppercase tracking-wider mt-1">With Video</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-display text-white">
                {
                  new Set(
                    locations.map(
                      (l) => `${Number(l.latitude).toFixed(1)}_${Number(l.longitude).toFixed(1)}`,
                    ),
                  ).size
                }
              </div>
              <div className="text-xs text-road uppercase tracking-wider mt-1">Unique Areas</div>
            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-asphalt-800 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-road text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-asphalt-600 border-t-warn rounded-full animate-spin" />
            <p className="text-road mt-4 text-sm">Fetching reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-asphalt-700 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-road"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              {search ? "No matching reports" : "No reports yet"}
            </p>
            <p className="text-road mb-6">
              {search ? "Try a different search term." : "Be the first to report a pothole!"}
            </p>
            {!search && (
              <Link to="/report" className="btn-primary rounded-full">
                Report a Pothole
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc, idx) => (
              <div
                key={loc._id}
                className="card overflow-hidden group"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Video / Placeholder */}
                {loc.mediaType === "image" && (loc.imagePath || loc.mediaPath) ? (
                  <div className="relative">
                    <img
                      className="w-full h-48 object-cover bg-asphalt-900"
                      src={`${API_URL}/${loc.imagePath || loc.mediaPath}`}
                      alt="Road damage report"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-warn text-[10px]">Image</span>
                    </div>
                  </div>
                ) : loc.videoPath || loc.mediaPath ? (
                  <div className="relative">
                    <video
                      controls
                      className="w-full h-48 object-cover bg-asphalt-900"
                      src={`${API_URL}/${loc.videoPath || loc.mediaPath}`}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-warn text-[10px]">Video</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-asphalt-900 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-asphalt-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-5">
                  {/* Coordinates */}
                  <div className="flex items-center gap-2 text-sm text-road-light mb-2">
                    <svg
                      className="w-3.5 h-3.5 text-warn flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-mono text-xs">
                      {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}
                    </span>
                  </div>

                  {/* Date */}
                  {loc.createdAt && (
                    <p className="text-xs text-road mb-3">
                      {new Date(loc.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge badge-warn text-[10px]">{loc.status || "submitted"}</span>
                    {loc.severity && loc.severity !== "unknown" && (
                      <span className="badge badge-red text-[10px]">{loc.severity}</span>
                    )}
                    <span className="badge text-[10px] bg-asphalt-800 text-road-light">
                      {loc.confirmCount || 0} confirmations
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-asphalt-700">
                    <a
                      href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-warn hover:text-warn-light font-medium transition inline-flex items-center gap-1"
                    >
                      Google Maps
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <Link
                      to="/map"
                      className="text-xs text-road hover:text-white font-medium transition"
                    >
                      View on Map
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
