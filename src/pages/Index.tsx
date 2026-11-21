import HeroShowcase from "@/components/home/HeroShowcase";
import Marquee from "@/components/home/Marquee";
import SportTiles from "@/components/home/SportTiles";
import LabStory from "@/components/home/LabStory";
import Membership from "@/components/home/Membership";
import ProductRail from "@/components/product/ProductRail";
import { ButtonLink } from "@/components/common/Button";
import { products, sortProducts } from "@/data/products";

const Index = () => (
  <main id="main">
    <HeroShowcase />
    <Marquee />
    <div className="mt-24 space-y-28 md:mt-32 md:space-y-36">
      <ProductRail
        title="Trending now"
        products={sortProducts(products, "featured").slice(0, 8)}
        action={
          <ButtonLink to="/products" variant="ghost" size="sm" className="mr-2">
            Shop all
          </ButtonLink>
        }
      />
      <SportTiles />
    </div>
    <LabStory />
    <div className="space-y-28 md:space-y-36">
      <ProductRail title="New arrivals" products={sortProducts(products, "newest").slice(0, 8)} />
      <Membership />
    </div>
  </main>
);

export default Index;
