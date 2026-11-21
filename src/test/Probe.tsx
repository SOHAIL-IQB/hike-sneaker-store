import { useLocation } from "react-router-dom";
import { useUI } from "@/store/UIProvider";

/** Renders the current URL and bag-drawer state so tests can assert on navigation and UI state. */
export default function Probe() {
  const { pathname } = useLocation();
  const { bagOpen } = useUI();
  return (
    <div hidden>
      <span data-testid="pathname">{pathname}</span>
      <span data-testid="bag-open">{String(bagOpen)}</span>
    </div>
  );
}
