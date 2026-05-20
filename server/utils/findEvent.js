import mongoose from "mongoose";
import Event from "../schema/eventSchema.js";
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

async function persistSlug(event) {
  if (event.slug) return event;
  event.slug = await ensureUniqueSlug(Event, slugifyTitle(event.title), event._id);
  await event.save();
  return event;
}

export async function findEventByIdOrSlug(param) {
  const decoded = decodeParam(param);
  const slugCandidate = slugifyTitle(decoded);
  const titleCandidate = titleFromParam(param);

  if (isObjectId(decoded)) {
    const byId = await Event.findById(decoded);
    if (byId) return persistSlug(byId);
  }

  const byStoredSlug = await Event.findOne({ slug: decoded });
  if (byStoredSlug) return byStoredSlug;

  if (slugCandidate) {
    const bySlugified = await Event.findOne({ slug: slugCandidate });
    if (bySlugified) return bySlugified;
  }

  if (titleCandidate) {
    const byTitle = await Event.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(titleCandidate)}$`, "i") },
    });
    if (byTitle) return persistSlug(byTitle);
  }

  const events = await Event.find();
  const match = events.find((event) => {
    const eventSlug = event.slug || slugifyTitle(event.title);
    const eventTitle = event.title.trim().toLowerCase();
    return (
      eventSlug === decoded.toLowerCase() ||
      eventSlug === slugCandidate ||
      eventTitle === titleCandidate.toLowerCase()
    );
  });

  if (!match) return null;
  return persistSlug(match);
}

export async function assignEventSlug(event) {
  const base = slugifyTitle(event.title);
  event.slug = await ensureUniqueSlug(Event, base, event._id);
  return event;
}
