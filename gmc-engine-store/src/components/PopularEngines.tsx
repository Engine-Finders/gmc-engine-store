import rawBuyEngine from "@/data/buyEngine.json";
import { resolveLinks } from "@/lib/links";
import { resolveEngineCollection } from "@/lib/imageMapping";
import PopularEnginesClient from "./PopularEnginesClient";

const buyEngine = resolveEngineCollection(resolveLinks(rawBuyEngine));

export default function PopularEngines() {
  return <PopularEnginesClient data={buyEngine} />;
}
