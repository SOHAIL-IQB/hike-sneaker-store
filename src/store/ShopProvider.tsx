import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { getColorway, getProduct, products, type Colorway, type Product } from "@/data/products";
import { MAX_QTY, initialState, lineKey, reviveState, shopReducer, type BagLine, type ShopState } from "./reducer";

const STORAGE_KEY = "hike:shop:v2";
const knownIds = new Set(products.map((p) => p.id));

/** A saved line is only valid if the pair still exists in the catalogue and is in stock. */
const validLine = (productId: string, colorwayId: string, size: string) => {
  const p = getProduct(productId);
  const c = p?.colorways.find((x) => x.id === colorwayId);
  return !!p && !!c && p.sizes.includes(size) && !c.soldOut?.includes(size);
};

function read(): ShopState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? reviveState(JSON.parse(raw), knownIds, validLine) : null;
  } catch {
    return null;
  }
}

export interface DetailedLine extends BagLine {
  product: Product;
  colorway: Colorway;
  lineTotal: number;
}

interface ShopState_ {
  bag: DetailedLine[];
  bagCount: number;
  subtotal: number;
  favorites: string[];
  recent: string[];
  isFavorite: (productId: string) => boolean;
}

interface ShopActions {
  /** Returns false when nothing changed because the line is already at the per-size limit. */
  addToBag: (productId: string, colorwayId: string, size: string, quantity?: number) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  changeSize: (key: string, size: string) => void;
  removeLine: (key: string) => void;
  clearBag: () => void;
  toggleFavorite: (productId: string) => void;
  recordView: (productId: string) => void;
}

const StateContext = createContext<ShopState_ | undefined>(undefined);
const ActionsContext = createContext<ShopActions | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, undefined, () => read() ?? initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode or storage full: the shop still works for this visit.
    }
  }, [state]);

  // Keep tabs in sync: changes in one tab show up in the others, and a tab that was
  // asleep catches up as soon as it becomes visible again.
  useEffect(() => {
    // Storage emptied elsewhere → empty bag here. A value we can't parse is ignored, never allowed to wipe the bag.
    const sync = () => {
      let raw: string | null;
      try {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        return;
      }
      if (raw === null) return dispatch({ type: "replace", state: initialState });
      const next = read();
      if (next) dispatch({ type: "replace", state: next });
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) sync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const next = read();
        if (next && JSON.stringify(next) !== JSON.stringify(stateRef.current)) dispatch({ type: "replace", state: next });
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const actions = useMemo<ShopActions>(
    () => ({
      addToBag: (productId, colorwayId, size, quantity = 1) => {
        const existing = stateRef.current.bag.find((l) => l.key === lineKey(productId, colorwayId, size));
        if (existing && existing.quantity >= MAX_QTY) return false;
        dispatch({ type: "add", productId, colorwayId, size, quantity });
        return true;
      },
      setQuantity: (key, quantity) => dispatch({ type: "setQuantity", key, quantity }),
      changeSize: (key, size) => dispatch({ type: "changeSize", key, size }),
      removeLine: (key) => dispatch({ type: "remove", key }),
      clearBag: () => dispatch({ type: "clearBag" }),
      toggleFavorite: (productId) => dispatch({ type: "toggleFavorite", productId }),
      recordView: (productId) => dispatch({ type: "viewed", productId }),
    }),
    [],
  );

  const bag = useMemo<DetailedLine[]>(
    () =>
      state.bag.flatMap((l) => {
        const product = getProduct(l.productId);
        if (!product) return [];
        return [{ ...l, product, colorway: getColorway(product, l.colorwayId), lineTotal: product.price * l.quantity }];
      }),
    [state.bag],
  );

  const value = useMemo<ShopState_>(() => {
    const fav = new Set(state.favorites);
    return {
      bag,
      bagCount: bag.reduce((n, l) => n + l.quantity, 0),
      subtotal: bag.reduce((n, l) => n + l.lineTotal, 0),
      favorites: state.favorites,
      recent: state.recent,
      isFavorite: (id) => fav.has(id),
    };
  }, [bag, state.favorites, state.recent]);

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={value}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

/** State and actions together — the shape every component already uses. */
export function useShop() {
  const s = useContext(StateContext);
  const a = useContext(ActionsContext);
  if (!s || !a) throw new Error("useShop must be used inside <ShopProvider>");
  return useMemo(() => ({ ...s, ...a }), [s, a]);
}

/** Actions only: components that never read state don't re-render when it changes. */
export function useShopActions() {
  const a = useContext(ActionsContext);
  if (!a) throw new Error("useShopActions must be used inside <ShopProvider>");
  return a;
}
