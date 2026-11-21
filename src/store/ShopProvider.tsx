import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { getColorway, getProduct, products, type Colorway, type Product } from "@/data/products";
import { initialState, reviveState, shopReducer, type BagLine, type ShopState } from "./reducer";

const STORAGE_KEY = "hike:shop:v2";
const knownIds = new Set(products.map((p) => p.id));

function load(): ShopState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? reviveState(JSON.parse(raw), knownIds) : initialState;
  } catch {
    return initialState;
  }
}

export interface DetailedLine extends BagLine {
  product: Product;
  colorway: Colorway;
  lineTotal: number;
}

interface ShopContextValue {
  bag: DetailedLine[];
  bagCount: number;
  subtotal: number;
  favorites: string[];
  recent: string[];
  addToBag: (productId: string, colorwayId: string, size: string, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  changeSize: (key: string, size: string) => void;
  removeLine: (key: string) => void;
  clearBag: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  recordView: (productId: string) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, undefined, load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode or storage full: the shop still works for this visit.
    }
  }, [state]);

  // Keep tabs in sync: a pair added in one tab shows up in the other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        dispatch({ type: "replace", state: reviveState(JSON.parse(e.newValue), knownIds) });
      } catch {
        /* ignore malformed writes */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const bag = useMemo<DetailedLine[]>(
    () =>
      state.bag.flatMap((l) => {
        const product = getProduct(l.productId);
        if (!product) return [];
        return [{ ...l, product, colorway: getColorway(product, l.colorwayId), lineTotal: product.price * l.quantity }];
      }),
    [state.bag],
  );

  const favoritesSet = useMemo(() => new Set(state.favorites), [state.favorites]);
  const isFavorite = useCallback((id: string) => favoritesSet.has(id), [favoritesSet]);

  const value = useMemo<ShopContextValue>(
    () => ({
      bag,
      bagCount: bag.reduce((n, l) => n + l.quantity, 0),
      subtotal: bag.reduce((n, l) => n + l.lineTotal, 0),
      favorites: state.favorites,
      recent: state.recent,
      addToBag: (productId, colorwayId, size, quantity) => dispatch({ type: "add", productId, colorwayId, size, quantity }),
      setQuantity: (key, quantity) => dispatch({ type: "setQuantity", key, quantity }),
      changeSize: (key, size) => dispatch({ type: "changeSize", key, size }),
      removeLine: (key) => dispatch({ type: "remove", key }),
      clearBag: () => dispatch({ type: "clearBag" }),
      toggleFavorite: (productId) => dispatch({ type: "toggleFavorite", productId }),
      isFavorite,
      recordView: (productId) => dispatch({ type: "viewed", productId }),
    }),
    [bag, state.favorites, state.recent, isFavorite],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
