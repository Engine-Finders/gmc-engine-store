#!/usr/bin/env python3
"""Add the catalog entries whose source page was incomplete or absent."""

import copy
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def save(name, value):
    (DATA / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def zero_model(template, brand, model, slug, description):
    entry = copy.deepcopy(template)
    entry["slug"] = slug
    entry["brandSlug"] = f"{brand.lower().replace(' ', '-')}-engines"
    entry["seo"] = {
        "title": f"{brand} {model} Engines for Sale | Used & Reconditioned | GMC",
        "description": description,
    }
    entry["hero"].update({
        "brand": brand,
        "model": model,
        "description": description,
        "longDescription": description,
        "cards": [],
    })
    entry["featured"].update({
        "title": f"Featured {model} Engines in Stock",
        "subtitle": description,
        "engines": [],
    })
    entry["engineTable"].update({
        "title": f"Engines available for the {brand} {model}",
        "subtitle": description,
        "generations": ["All Generations"],
        "viewAllText": "No confirmed engine families",
        "rows": [],
    })
    entry["priceGuide"].update({"title": f"{model} Engine Price Guide", "generations": []})
    entry["usedVsRecon"] = {"title": f"Used or Reconditioned {model} Engines", "options": []}
    entry["generations"] = {"title": f"{model} Through the Generations", "items": []}
    entry["faqs"] = {"title": f"{model} Engine Buying FAQs", "items": []}
    entry["related"] = {"title": f"Related {brand} Models", "models": [{"name": f"All {brand} Engines", "href": f"/{entry['brandSlug']}", "all": True}]}
    entry["cta"].update({"title": f"Check {brand} {model} fitment", "description": description})
    return entry


def main():
    models = load("modelPage.json")
    brands = load("brandPage.json")
    home_brands = load("brands.json")
    shop_brands = load("shopByBrand.json")
    brand_logos = load("brandLogos.json")

    logo_paths = {
        "Fiat": "/images/brands/logos/fiat-logo-small.webp.webp",
        "Honda": "/images/brands/logos/honda-logo-small.webp.webp",
        "MG": "/images/brands/logos/mg-logo-small.webp.webp",
        "Mitsubishi": "/images/brands/logos/mitsubishi-logo-small.webp.webp",
    }
    for name, path in logo_paths.items():
        brand_logos[name.lower()] = path

    # No ID Range source document was supplied. Create an explicit, safe
    # zero-state page rather than inventing combustion-engine products.
    models["id-range"] = zero_model(
        models["electric"],
        "Volkswagen",
        "ID Range",
        "id-range",
        "The Volkswagen ID Range is fully electric. No internal-combustion engine families are confirmed for this model range in the current GMC catalog.",
    )

    # These two model files were named in the requested missing list but were
    # not present in the supplied ZIP. Keep their routes available with a
    # schema-valid, explicitly unpopulated resource until their source pages
    # arrive.
    models["sharan"] = zero_model(
        models["electric"], "Volkswagen", "Sharan", "sharan",
        "Volkswagen Sharan engine fitment is being prepared from confirmed GMC source data. No unsupported engine family or price is shown yet.",
    )
    models["up"] = zero_model(
        models["electric"], "Volkswagen", "Up!", "up",
        "Volkswagen Up! engine fitment is being prepared from confirmed GMC source data. No unsupported engine family or price is shown yet.",
    )
    models["gt86"] = zero_model(
        models["electric"], "Toyota", "GT86", "gt86",
        "Toyota GT86 engine fitment is being prepared from confirmed GMC source data. No unsupported engine family or price is shown yet.",
    )

    # A first dry-run of the mixed ZIP produced this incorrect intermediate
    # key; remove it so Toyota keeps the canonical land-cruiser route only.
    if models.get("cruiser", {}).get("hero", {}).get("model") == "Cruiser":
        del models["cruiser"]

    # Existing brand cards become live automatically when modelPage.json gains
    # the matching key. Add only cards absent from the current brand arrays.
    additions = {
        "mini-engines": ("Electric", "F56 BEV", "0 engine families", "electric"),
        "volkswagen-engines": ("ID Range", "MEB", "0 engine families", "id-range"),
    }
    for brand_slug, (name, chassis, families, model_slug) in additions.items():
        models_list = brands[brand_slug]["shopByModel"]["models"]
        if not any(m.get("href") == f"/{brand_slug}/{model_slug}" for m in models_list):
            models_list.append({
                "name": name,
                "chassis": chassis,
                "families": families,
                "image": "/images/brands/Brandpage_car.png",
                "href": f"/{brand_slug}/{model_slug}",
            })
        count = len(models_list)
        brands[brand_slug]["shopByModel"]["viewAllText"] = f"View all {count} models"
        brands[brand_slug]["shopByModel"]["allModelsCount"] = f"{count} models available"

    # The supplied Toyota Land Cruiser resource explicitly confirms zero
    # engine hubs, so correct the pre-existing navigation card's summary.
    for model in brands["toyota-engines"]["shopByModel"]["models"]:
        if model.get("href") == "/toyota-engines/land-cruiser":
            model["families"] = "0 engine families"

    # The ZIP contains no Fiat/Honda/MG/Mitsubishi brand documents. Build
    # schema-valid, explicitly empty brand pages until those source documents
    # arrive; no engine family or price is fabricated.
    brand_specs = {
        "fiat": "Fiat",
        "honda": "Honda",
        "mg": "MG",
        "mitsubishi": "Mitsubishi",
    }
    template = brands["suzuki-engines"]
    for key, name in brand_specs.items():
        slug = f"{key}-engines"
        if slug in brands:
            brands[slug]["hero"]["logo"] = logo_paths[name]
            if not brands[slug]["hero"].get("cards") or brands[slug]["hero"]["cards"][0].get("code") == "CATALOG-PENDING":
                brands[slug]["hero"]["cards"] = [{
                    "code": "CATALOG-PENDING",
                    "name": "Confirmed resources pending",
                    "ps": "",
                    "nm": "",
                    "years": "",
                    "image": "/images/engines/engine.png",
                    "inStock": False,
                    "href": "/engines",
                    "pos": {"top": 120, "left": 260, "width": 210, "rotate": 0, "z": 20},
                    "featured": True,
                }]
            for home_brand in home_brands.get("brands", []):
                if home_brand.get("href") == f"/{slug}":
                    home_brand["logo"] = logo_paths[name]
            if not any(b.get("href") == f"/{slug}" for b in shop_brands.get("brands", [])):
                shop_brands["brands"].insert(-1, {
                    "name": name,
                    "logo": logo_paths[name],
                    "href": f"/{slug}",
                })
            continue
        entry = copy.deepcopy(template)
        entry["slug"] = slug
        entry["seo"] = {"title": f"{name} Engines for Sale | Used & Reconditioned | GMC", "description": f"Browse GMC {name} engine resources and confirm exact fitment by registration."}
        entry["hero"].update({"brand": name, "name": name, "logo": logo_paths[name], "description": f"{name} engine resources with registration-based fitment and UK delivery.", "cards": [{
            "code": "CATALOG-PENDING",
            "name": "Confirmed resources pending",
            "ps": "",
            "nm": "",
            "years": "",
            "image": "/images/engines/engine.png",
            "inStock": False,
            "href": "/engines",
            "pos": {"top": 120, "left": 260, "width": 210, "rotate": 0, "z": 20},
            "featured": True,
        }]})
        entry["featuredEngines"]["title"] = f"Featured {name} Engines in Stock"
        entry["featuredEngines"]["engines"] = []
        entry["shopByModel"].update({"title": f"Shop {name} Engines by Model", "viewAllText": "View all 0 models", "allModelsCount": "0 models available", "models": []})
        entry["engineFamilies"].update({"title": f"All {name} Engine Families", "families": []})
        entry["priceGuide"]["title"] = f"{name} Engine Price Guide"
        entry["priceGuide"]["rows"] = []
        entry["usedVsRecon"]["title"] = f"Used or Reconditioned — Which {name} Engine to Buy?"
        entry["usedVsRecon"]["options"] = []
        entry["about"] = {"title": f"About {name} Engines", "logo": "/images/brands/Brand_logo.png", "carImage": "/images/brands/Brandpage_about.png", "paragraphs": [f"GMC is preparing the {name} engine catalog. Confirmed model, engine-family and listing data will be added as source resources become available."]}
        entry["warrantyDelivery"]["title"] = f"Warranty & Delivery on {name} Engines"
        entry["warrantyDelivery"]["items"] = []
        entry["faqs"]["title"] = f"{name} Engine Buying FAQs"
        entry["faqs"]["items"] = []
        entry["cta"]["title"] = f"Find the right {name} engine"
        brands[slug] = entry

        if not any(b.get("href") == f"/{slug}" for b in home_brands.get("brands", [])):
            home_brands.setdefault("brands", []).append({
                "name": name,
                "logo": logo_paths[name],
                "car": "/images/brands/Brandpage_car.png",
                "engineCount": 0,
                "glow": "#6aa4ff",
                "glowBright": "#b3d6ff",
                "href": f"/{slug}",
            })

        if not any(b.get("href") == f"/{slug}" for b in shop_brands.get("brands", [])):
            shop_brands["brands"].insert(-1, {
                "name": name,
                "logo": logo_paths[name],
                "href": f"/{slug}",
            })

    save("modelPage.json", models)
    save("brandPage.json", brands)
    save("brands.json", home_brands)
    save("shopByBrand.json", shop_brands)
    save("brandLogos.json", brand_logos)


if __name__ == "__main__":
    main()
