import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const Products = () => (
  <main className="pt-24 pb-16">
    <div className="container">
      <h1 className="text-3xl font-extrabold tracking-wide mb-10">ALL PRODUCTS</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  </main>
);

export default Products;
