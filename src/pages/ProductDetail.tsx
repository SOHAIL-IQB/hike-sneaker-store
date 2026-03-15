import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { trackEvent } from "@/lib/analytics";

const sizes = ["7", "8", "9", "10", "11", "12"];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState(sizes[2]);

  useEffect(() => {
    if (product) {
      trackEvent("view_product", {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pt-24 container text-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, selectedSize);
    trackEvent("add_to_cart", {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      size: selectedSize,
    });
  };

  return (
    <main className="pt-24 pb-16">
      <div className="container grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
        {/* Image — 60% */}
        <div className="md:col-span-3 bg-card flex items-center justify-center p-12">
          <img src={product.image} alt={product.name} className="w-full max-w-md object-contain" />
        </div>

        {/* Details — 40% sticky */}
        <div className="md:col-span-2 md:sticky md:top-24 space-y-6">
          <h1 className="text-3xl font-extrabold tracking-wide">{product.name.toUpperCase()}</h1>
          <p className="text-2xl font-bold">${product.price}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Size selector */}
          <div>
            <p className="text-xs font-bold tracking-widest text-muted-foreground mb-3">SELECT SIZE</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 text-sm font-bold border transition-colors ${
                    s === selectedSize
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-accent text-accent-foreground py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            ADD TO CART
          </button>
          <button
            onClick={() => navigate("/products")}
            className="w-full border border-border py-4 text-sm font-bold tracking-widest hover:bg-secondary transition-colors"
          >
            BACK TO PRODUCTS
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
