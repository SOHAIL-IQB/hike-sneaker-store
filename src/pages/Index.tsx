import { Link } from "react-router-dom";
import heroShoe from "@/assets/hero-shoe.png";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const Index = () => (
  <main>
    {/* Hero */}
    <section className="min-h-[90vh] flex items-center pt-16">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium">NEW COLLECTION 2026</p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tighter">
            RUN FASTER<br />WITH HIKE
          </h1>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Engineered for speed, designed for the streets. Experience next-generation cushioning and bold style.
          </p>
          <Link
            to="/products"
            className="inline-block bg-accent text-accent-foreground px-8 py-4 text-sm font-bold tracking-widest hover:opacity-90 transition-opacity"
          >
            SHOP NOW
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <img
            src={heroShoe}
            alt="Hike sneaker hero"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </div>
      </div>
    </section>

    {/* Featured */}
    <section className="container py-20">
      <h2 className="text-2xl font-extrabold tracking-wide mb-10">FEATURED</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>

    {/* Brand strip */}
    <section className="bg-primary text-primary-foreground">
      <div className="container py-16 text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">BUILT FOR ATHLETES</h2>
        <p className="text-primary-foreground/60 max-w-xl mx-auto leading-relaxed">
          Every Hike sneaker is tested on the track, tuned in the lab, and finished for the street. Push your limits — we've already pushed ours.
        </p>
      </div>
    </section>
  </main>
);

export default Index;
