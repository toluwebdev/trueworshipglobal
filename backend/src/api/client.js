const DEFAULT_API = "https://trueworshipglobal-server.vercel.app";
const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, "");

function getToken() {
  return sessionStorage.getItem("twg_admin_token");
}

export function setToken(token) {
  if (token) sessionStorage.setItem("twg_admin_token", token);
  else sessionStorage.removeItem("twg_admin_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Check that https://trueworshipglobal-server.vercel.app is running and VITE_API_URL in backend/.env is set correctly.",
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/api/auth/me"),

  stats: () => request("/api/admin/stats"),

  blogs: {
    list: () => request("/api/admin/blogs"),
    get: (id) => request(`/api/admin/blogs/${id}`),
    create: (body) =>
      request("/api/admin/blogs", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/api/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id) => request(`/api/admin/blogs/${id}`, { method: "DELETE" }),
  },

  events: {
    list: () => request("/api/admin/events"),
    get: (id) => request(`/api/admin/events/${id}`),
    create: (body) =>
      request("/api/admin/events", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/api/admin/events/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id) => request(`/api/admin/events/${id}`, { method: "DELETE" }),
  },

  worshipSchool: {
    list: () => request("/api/admin/worship-school"),
    get: (id) => request(`/api/admin/worship-school/${id}`),
    create: (body) =>
      request("/api/admin/worship-school", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/api/admin/worship-school/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id) => request(`/api/admin/worship-school/${id}`, { method: "DELETE" }),
  },

  comments: {
    list: () => request("/api/admin/comments"),
    remove: (id) => request(`/api/admin/comments/${id}`, { method: "DELETE" }),
  },

  mailing: {
    list: () => request("/api/admin/mailing"),
    remove: (id) => request(`/api/admin/mailing/${id}`, { method: "DELETE" }),
  },

  uploadImage: async (file, type = "blogs") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${API_BASE}/api/admin/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch {
      throw new Error(
        "Cannot reach the API. Start the server with: cd server && npm run dev",
      );
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Upload failed (${res.status})`);
    }
    return data;
  },
};
