import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

function getAdminCredentials() {
  const email =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.email?.trim() ||
    process.env.EMAIL?.trim();
  const password =
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.password?.trim() ||
    process.env.PASSWORD?.trim();
  return { email, password };
}

router.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: "Admin credentials are not configured on the server" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET is not configured on the server" });
  }

  const inputEmail = String(email ?? "").trim().toLowerCase();
  const inputPassword = String(password ?? "");

  if (inputEmail !== adminEmail.toLowerCase() || inputPassword !== adminPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ role: "admin", email: adminEmail }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    token,
    admin: { email: adminEmail },
  });
});

router.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.json({ admin: { email: payload.email } });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

export default router;
