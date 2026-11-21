import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface AddedItem {
  productId: string;
  colorwayId: string;
  size: string;
}

interface UIContextValue {
  bagOpen: boolean;
  openBag: (added?: AddedItem) => void;
  closeBag: () => void;
  /** The pair just added, shown as a confirmation at the top of the bag drawer. */
  justAdded: AddedItem | null;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [bagOpen, setBagOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<AddedItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openBag = useCallback((added?: AddedItem) => {
    setJustAdded(added ?? null);
    setBagOpen(true);
  }, []);
  const closeBag = useCallback(() => setBagOpen(false), []);

  const value = useMemo(
    () => ({ bagOpen, openBag, closeBag, justAdded, searchOpen, setSearchOpen, menuOpen, setMenuOpen }),
    [bagOpen, openBag, closeBag, justAdded, searchOpen, menuOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
