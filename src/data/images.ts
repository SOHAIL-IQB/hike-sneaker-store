/**
 * Product image lookup.
 *
 * Final images live in src/assets/products/<productId>--<colorwayId>.webp and
 * are picked up automatically. Until a file exists, the colourway shows a
 * neutral placeholder tile.
 */
import placeholder from "@/assets/placeholder-shoe.svg";

const files = import.meta.glob<string>("/src/assets/products/*.{webp,png,jpg}", {
  eager: true,
  query: "?url",
  import: "default",
});

const byName = new Map(
  Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(/\.(webp|png|jpg)$/, ""), url] as const),
);

export const PLACEHOLDER_IMAGE = placeholder;

export const productImage = (productId: string, colorwayId: string) =>
  byName.get(`${productId}--${colorwayId}`) ?? placeholder;

export const hasRealImage = (productId: string, colorwayId: string) => byName.has(`${productId}--${colorwayId}`);
