import HeaderClient from "./HeaderClient";
import { getNavMenu } from "@/lib/navMenu";

/** Server wrapper: builds the dropdown lists from the pages that exist, then hands them to the client navbar. */
export default function Header() {
  return <HeaderClient menu={getNavMenu()} />;
}
