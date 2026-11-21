import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct } from "@/data/products";
import { useShop } from "@/store/ShopProvider";
import { trackEvent } from "@/lib/analytics";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToBag } = useShop();
  const product = getProduct(id);
  const sizes = product?.sizes ?? [];
  const [selectedSize, setSelectedSize] = useState(sizes[Math.min(6, sizes.length - 1)] ?? "");

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
    addToBag(product.id, product.colorways[0].id, selectedSize);
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
          <img src={product.colorways[0].image} alt={product.name} className="w-full max-w-md object-contain" />
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
