import {
  fetchEvent,
  formatEventDescription,
  sendOgResponse,
  type OgEvent,
  type OgReq,
  type OgRes,
} from "../../_lib/og-html.js";

export default function handler(req: OgReq, res: OgRes) {
  return sendOgResponse(req, res, {
    slugParam: "slug",
    pagePathPrefix: "/events",
    fetchItem: fetchEvent,
    getTitle: (event: OgEvent) => `${event.title} — True Worship Global`,
    getDescription: formatEventDescription,
    notFoundTitle: "Event not found — True Worship Global",
    notFoundDescription: "This event could not be found.",
    ctaLabel: "View event",
    logTag: "og/event",
  });
}
