import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-20">
    <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
      <div>
        <h3 className="text-lg font-extrabold tracking-widest mb-4">HIKE</h3>
        <p className="text-primary-foreground/60 leading-relaxed">
          Engineered for speed. Designed for style. Hike sneakers push the boundaries of athletic footwear.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-xs tracking-widest text-primary-foreground/40">SHOP</h4>
        <div className="flex flex-col gap-2 text-primary-foreground/70">
          <Link to="/products" className="hover:text-accent transition-colors">All Products</Link>
          <Link to="/cart" className="hover:text-accent transition-colors">Cart</Link>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-xs tracking-widest text-primary-foreground/40">CONNECT</h4>
        <div className="flex flex-col gap-2 text-primary-foreground/70">
          <span>Instagram</span>
          <span>Twitter</span>
          <span>Facebook</span>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10">
      <div className="container py-4 text-xs text-primary-foreground/40 text-center">
        © 2026 Hike. All rights reserved. This is a demo website.
      </div>
    </div>
  </footer>
);

export default Footer;
