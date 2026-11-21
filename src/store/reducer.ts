/**
 * Pure shop state: bag, favourites and recently viewed.
 * Kept free of React so it can be unit-tested and persisted as plain JSON.
 */

export interface BagLine {
  /** productId:colorwayId:size — one line per distinct pair. */
  key: string;
  productId: string;
  colorwayId: string;
  size: string;
  quantity: number;
}

export interface ShopState {
  bag: BagLine[];
  favorites: string[];
  recent: string[];
}

export const MAX_QTY = 10;
export const MAX_RECENT = 8;

export const initialState: ShopState = { bag: [], favorites: [], recent: [] };

export const lineKey = (productId: string, colorwayId: string, size: string) => `${productId}:${colorwayId}:${size}`;

export type ShopAction =
  | { type: "add"; productId: string; colorwayId: string; size: string; quantity?: number }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "changeSize"; key: string; size: string }
  | { type: "remove"; key: string }
  | { type: "clearBag" }
  | { type: "toggleFavorite"; productId: string }
  | { type: "viewed"; productId: string }
  | { type: "replace"; state: ShopState };

const clampQty = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(MAX_QTY, Math.floor(n))) : 0);

export function shopReducer(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case "add": {
      const qty = clampQty(action.quantity ?? 1);
      if (qty === 0) return state;
      const key = lineKey(action.productId, action.colorwayId, action.size);
      const existing = state.bag.find((l) => l.key === key);
      if (existing) {
        return {
          ...state,
          bag: state.bag.map((l) => (l.key === key ? { ...l, quantity: clampQty(l.quantity + qty) } : l)),
        };
      }
      const line: BagLine = { key, productId: action.productId, colorwayId: action.colorwayId, size: action.size, quantity: qty };
      return { ...state, bag: [...state.bag, line] };
    }

    case "setQuantity": {
      const qty = clampQty(action.quantity);
      if (qty === 0) return { ...state, bag: state.bag.filter((l) => l.key !== action.key) };
      return { ...state, bag: state.bag.map((l) => (l.key === action.key ? { ...l, quantity: qty } : l)) };
    }

    case "changeSize": {
      const line = state.bag.find((l) => l.key === action.key);
      if (!line || line.size === action.size) return state;
      const newKey = lineKey(line.productId, line.colorwayId, action.size);
      const target = state.bag.find((l) => l.key === newKey);
      if (target) {
        // Merging into a line that already has that size.
        return {
          ...state,
          bag: state.bag
            .filter((l) => l.key !== action.key)
            .map((l) => (l.key === newKey ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l)),
        };
      }
      return {
        ...state,
        bag: state.bag.map((l) => (l.key === action.key ? { ...l, key: newKey, size: action.size } : l)),
      };
    }

    case "remove":
      return { ...state, bag: state.bag.filter((l) => l.key !== action.key) };

    case "clearBag":
      return { ...state, bag: [] };

    case "toggleFavorite": {
      const has = state.favorites.includes(action.productId);
      return {
        ...state,
        favorites: has ? state.favorites.filter((id) => id !== action.productId) : [action.productId, ...state.favorites],
      };
    }

    case "viewed":
      return {
        ...state,
        recent: [action.productId, ...state.recent.filter((id) => id !== action.productId)].slice(0, MAX_RECENT),
      };

    case "replace":
      return action.state;
  }
}

export const MAX_LINES = 50;

/** Optional catalogue check so saved lines can't carry unknown colourways, sizes or sold-out pairs. */
export type LineValidator = (productId: string, colorwayId: string, size: string) => boolean;

/** Accept only well-formed saved state; anything else starts fresh. Builds each line from validated fields only. */
export function reviveState(raw: unknown, knownProductIds: Set<string>, isValidLine?: LineValidator): ShopState {
  if (!raw || typeof raw !== "object") return initialState;
  const r = raw as Partial<ShopState>;
  const ids = (v: unknown) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && knownProductIds.has(x)))] : [];

  const merged = new Map<string, BagLine>();
  if (Array.isArray(r.bag)) {
    for (const l of r.bag as Partial<BagLine>[]) {
      if (!l || typeof l.productId !== "string" || typeof l.colorwayId !== "string" || typeof l.size !== "string") continue;
      if (!knownProductIds.has(l.productId) || typeof l.quantity !== "number" || !Number.isFinite(l.quantity)) continue;
      if (isValidLine && !isValidLine(l.productId, l.colorwayId, l.size)) continue;
      const quantity = clampQty(l.quantity);
      if (quantity <= 0) continue;
      const key = lineKey(l.productId, l.colorwayId, l.size);
      const existing = merged.get(key);
      if (existing) existing.quantity = clampQty(existing.quantity + quantity);
      else merged.set(key, { key, productId: l.productId, colorwayId: l.colorwayId, size: l.size, quantity });
      if (merged.size >= MAX_LINES) break;
    }
  }
  return { bag: [...merged.values()], favorites: ids(r.favorites), recent: ids(r.recent).slice(0, MAX_RECENT) };
}
