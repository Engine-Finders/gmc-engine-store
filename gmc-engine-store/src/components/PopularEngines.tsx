import rawBuyEngine from "@/data/buyEngine.json";
import { resolveLinks } from "@/lib/links";
import PopularEnginesClient from "./PopularEnginesClient";

const buyEngine = resolveLinks(rawBuyEngine);

export default function PopularEngines() {
  return <PopularEnginesClient data={buyEngine} />;
}
