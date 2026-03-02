import json
import random
import os

def generate_items():

    cuisines = {
        "Indian": {
            "main": ["Biryani", "Pulao", "Dal Makhani", "Paneer Butter Masala"],
            "side": ["Raita", "Salan", "Butter Naan", "Tandoori Roti"],
            "dessert": ["Gulab Jamun", "Rasgulla", "Kheer"],
            "beverage": ["Masala Chaas", "Lassi"],
        },
        "Chinese": {
            "main": ["Hakka Noodles", "Fried Rice", "Schezwan Rice"],
            "side": ["Spring Rolls", "Manchurian", "Chilli Paneer"],
            "dessert": ["Honey Noodles", "Fortune Cookie"],
            "beverage": ["Green Tea", "Lemon Tea"],
        },
        "Italian": {
            "main": ["Margherita Pizza", "Pasta Alfredo", "Lasagna"],
            "side": ["Garlic Bread", "Bruschetta"],
            "dessert": ["Tiramisu", "Panna Cotta"],
            "beverage": ["Cold Coffee", "Iced Tea"],
        },
    }

    variants = ["Veg", "Chicken", "Mutton", "Spicy", "Special", "Deluxe"]

    items = []
    item_id = 0

    for cuisine, categories in cuisines.items():
        for category, dishes in categories.items():
            for dish in dishes:
                for variant in variants:

                    name = f"{variant} {dish}"

                    base_price = {
                        "main": random.randint(200, 400),
                        "side": random.randint(50, 200),
                        "dessert": random.randint(70, 150),
                        "beverage": random.randint(40, 120),
                    }

                    items.append(
                        {
                            "item_id": item_id,
                            "name": name,
                            "cuisine": cuisine,
                            "category": category,
                            "price": base_price[category],
                            "popularity": round(random.uniform(0.2, 0.95), 2),
                        }
                    )

                    item_id += 1

    return items


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    items_path = os.path.join(DATA_DIR, "items.json")
    
    items = generate_items()
    print(f"Generated {len(items)} items")

    with open(items_path, "w") as f:
        json.dump(items, f, indent=4)
