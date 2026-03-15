import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    trackEvent("begin_checkout", {
      value: totalPrice,
      items: items.map((i) => ({
        item_id: i.product.id,
        item_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
    });
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-16">
        <div className="container text-center space-y-6">
          <h1 className="text-3xl font-extrabold tracking-wide">YOUR CART</h1>
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            SHOP NOW
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-wide mb-10">YOUR CART</h1>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-6 border-b border-border pb-6">
              <div className="w-24 h-24 bg-card flex-shrink-0 flex items-center justify-center p-2">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">{item.product.name.toUpperCase()}</h3>
                    <p className="text-xs text-muted-foreground">Size {item.size}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-sm font-bold">${item.product.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>${totalPrice}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-accent text-accent-foreground py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </main>
  );
};

export default Cart;
