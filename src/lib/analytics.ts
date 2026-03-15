// GA4 analytics helper — event tracking only
// GA4 script is loaded via index.html for reliable loading on deployed sites

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
  // Always log to console for debugging
  console.log(`[GA4 Event] ${eventName}`, params);
};

// Keep initGA4 as a no-op for backward compatibility (GA4 loads from index.html)
export const initGA4 = () => {
  console.log("[GA4] Initialized via index.html script tag");
};
