import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ordered, setOrdered] = useState(false);

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("purchase", {
      transaction_id: `TXN-${Date.now()}`,
      value: totalPrice,
      items: items.map((i) => ({
        item_id: i.product.id,
        item_name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
    });
    clearCart();
    setOrdered(true);
  };

  if (ordered) {
    return (
      <main className="pt-24 pb-16">
        <div className="container max-w-md text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" strokeWidth={1.5} />
          <h1 className="text-3xl font-extrabold tracking-wide">ORDER CONFIRMED</h1>
          <p className="text-muted-foreground">Your order has been placed successfully.</p>
          <Link
            to="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            BACK TO HOME
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-16">
        <div className="container text-center space-y-6">
          <h1 className="text-3xl font-extrabold tracking-wide">CHECKOUT</h1>
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
      <div className="container max-w-lg">
        <h1 className="text-3xl font-extrabold tracking-wide mb-10">CHECKOUT</h1>

        {/* Order summary */}
        <div className="space-y-3 mb-8">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>
                {item.product.name} × {item.quantity} (Size {item.size})
              </span>
              <span className="font-bold">${item.product.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>${totalPrice}</span>
          </div>
        </div>

        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest text-muted-foreground mb-2">NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-muted-foreground mb-2">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-accent-foreground py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity mt-4"
          >
            BUY NOW
          </button>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
