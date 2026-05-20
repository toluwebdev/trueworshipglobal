export function slugifyTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function ensureUniqueSlug(Model, base, excludeId) {
  const root = base || "item";
  let attempt = 0;

  while (attempt < 100) {
    const candidate = attempt === 0 ? root : `${root}-${attempt}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    const exists = await Model.findOne(query).select("_id");
    if (!exists) return candidate;
    attempt += 1;
  }

  return `${root}-${Date.now()}`;
}
