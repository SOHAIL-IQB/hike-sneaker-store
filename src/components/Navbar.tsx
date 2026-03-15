import { Link } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const Navbar = () => {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nav text-nav-foreground">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-extrabold tracking-widest">
          HIKE
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link to="/" className="hover:text-accent transition-colors">HOME</Link>
          <Link to="/products" className="hover:text-accent transition-colors">PRODUCTS</Link>
          <Link to="/cart" className="relative hover:text-accent transition-colors">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-nav border-t border-nav-foreground/10 pb-4">
          <div className="container flex flex-col gap-4 pt-4 text-sm font-medium tracking-wide">
            <Link to="/" onClick={() => setOpen(false)}>HOME</Link>
            <Link to="/products" onClick={() => setOpen(false)}>PRODUCTS</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2">
              CART {totalItems > 0 && <span className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 font-bold">{totalItems}</span>}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
