import shoeAirRunner from "@/assets/shoe-air-runner.png";
import shoeVelocity from "@/assets/shoe-velocity.png";
import shoeStreetPro from "@/assets/shoe-street-pro.png";
import shoeFlexMotion from "@/assets/shoe-flex-motion.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: "air-runner",
    name: "Hike Air Runner",
    price: 120,
    image: shoeAirRunner,
    description:
      "Lightweight and breathable, the Air Runner is engineered for speed. Its responsive cushioning and seamless mesh upper keep you moving mile after mile.",
  },
  {
    id: "velocity",
    name: "Hike Velocity",
    price: 140,
    image: shoeVelocity,
    description:
      "Built for the fast lane. The Velocity features an aerodynamic silhouette and energy-return sole that propels you forward with every stride.",
  },
  {
    id: "street-pro",
    name: "Hike Street Pro",
    price: 110,
    image: shoeStreetPro,
    description:
      "From the track to the street. The Street Pro combines chunky, fashion-forward styling with all-day comfort and durable outsole grip.",
  },
  {
    id: "flex-motion",
    name: "Hike Flex Motion",
    price: 130,
    image: shoeFlexMotion,
    description:
      "Adaptive flexibility meets bold design. The Flex Motion's knit upper moves with your foot, delivering a sock-like fit for training and everyday wear.",
  },
];
