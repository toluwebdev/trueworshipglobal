import mongoose from "mongoose";
import WorshipSchoolClass from "../schema/worshipSchoolClassSchema.js";
import { ensureUniqueSlug, slugifyTitle } from "./slug.js";

function isObjectId(value) {
  return (
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === value
  );
}

function decodeParam(param) {
  try {
    return decodeURIComponent(param).trim();
  } catch {
    return param.trim();
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleFromParam(param) {
  return decodeParam(param).replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

async function persistSlug(item) {
  if (item.slug) return item;
  item.slug = await ensureUniqueSlug(
    WorshipSchoolClass,
    slugifyTitle(item.title),
    item._id,
  );
  await item.save();
  return item;
}

export async function findWorshipClassByIdOrSlug(param) {
  const decoded = decodeParam(param);
  const slugCandidate = slugifyTitle(decoded);
  const titleCandidate = titleFromParam(param);

  if (isObjectId(decoded)) {
    const byId = await WorshipSchoolClass.findById(decoded);
    if (byId) return persistSlug(byId);
  }

  const byStoredSlug = await WorshipSchoolClass.findOne({ slug: decoded });
  if (byStoredSlug) return byStoredSlug;

  if (slugCandidate) {
    const bySlugified = await WorshipSchoolClass.findOne({ slug: slugCandidate });
    if (bySlugified) return bySlugified;
  }

  if (titleCandidate) {
    const byTitle = await WorshipSchoolClass.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(titleCandidate)}$`, "i") },
    });
    if (byTitle) return persistSlug(byTitle);
  }

  const classes = await WorshipSchoolClass.find();
  const match = classes.find((item) => {
    const itemSlug = item.slug || slugifyTitle(item.title);
    const itemTitle = item.title.trim().toLowerCase();
    return (
      itemSlug === decoded.toLowerCase() ||
      itemSlug === slugCandidate ||
      itemTitle === titleCandidate.toLowerCase()
    );
  });

  if (!match) return null;
  return persistSlug(match);
}

export async function assignWorshipClassSlug(item) {
  const base = slugifyTitle(item.title);
  item.slug = await ensureUniqueSlug(WorshipSchoolClass, base, item._id);
  return item;
}
