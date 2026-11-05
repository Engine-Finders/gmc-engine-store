import Link from "next/link";
import Icon from "./Icon";
import rawShopByBrand from "@/data/shopByBrand.json";
import { resolveLinks } from "@/lib/links";
import ShopByBrandClient from "./ShopByBrandClient";

const shopByBrand = resolveLinks(rawShopByBrand);

export default function ShopByBrand() {
  return <ShopByBrandClient data={shopByBrand} />;
}
