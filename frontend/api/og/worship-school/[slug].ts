import {
  fetchWorshipClass,
  formatClassDescription,
  sendOgResponse,
  type OgWorshipClass,
  type OgReq,
  type OgRes,
} from "../../_lib/og-html.js";

export default function handler(req: OgReq, res: OgRes) {
  return sendOgResponse(req, res, {
    slugParam: "slug",
    pagePathPrefix: "/worship-school",
    fetchItem: fetchWorshipClass,
    getTitle: (item: OgWorshipClass) => `${item.title} — Worship School`,
    getDescription: formatClassDescription,
    notFoundTitle: "Class not found — Worship School",
    notFoundDescription: "This Worship School class could not be found.",
    ctaLabel: "View class",
    logTag: "og/worship-school",
  });
}
