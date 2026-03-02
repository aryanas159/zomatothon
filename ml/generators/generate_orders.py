# generators/generate_orders.py

import json
import random
import os
from datetime import datetime, timedelta


def weighted_choice(items, weight_key):
    """Helper to choose item weighted by a key"""
    weights = [item[weight_key] for item in items]
    return random.choices(items, weights=weights, k=1)[0]


def generate_orders(n_weeks=4):

    # Resolve project root safely
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    items_path = os.path.join(DATA_DIR, "items.json")
    users_path = os.path.join(DATA_DIR, "users.json")

    with open(items_path) as f:
        items = json.load(f)

    with open(users_path) as f:
        users = json.load(f)

    orders = []
    order_id = 0

    # Organize items by category and cuisine
    item_map = {}
    for item in items:
        key = (item["cuisine"], item["category"])
        item_map.setdefault(key, []).append(item)

    base_date = datetime.now()

    for user in users:

        total_orders = user["order_frequency_per_week"] * n_weeks

        for _ in range(total_orders):

            preferred_cuisine = user["preferred_cuisine"]

            order_items = []

            # --- MAIN (mandatory) ---
            main_items = item_map.get((preferred_cuisine, "main"), [])
            if not main_items:
                continue

            main_item = weighted_choice(main_items, "popularity")
            order_items.append(main_item["item_id"])

            total_price = main_item["price"]

            # --- SIDE ---
            if random.random() < 0.7:
                side_items = item_map.get((preferred_cuisine, "side"), [])
                if side_items:
                    side = weighted_choice(side_items, "popularity")
                    order_items.append(side["item_id"])
                    total_price += side["price"]

            # --- DESSERT ---
            if random.random() < user["dessert_ratio"]:
                dessert_items = item_map.get((preferred_cuisine, "dessert"), [])
                if dessert_items:
                    dessert = weighted_choice(dessert_items, "popularity")
                    order_items.append(dessert["item_id"])
                    total_price += dessert["price"]

            # --- BEVERAGE ---
            if random.random() < user["beverage_ratio"]:
                beverage_items = item_map.get((preferred_cuisine, "beverage"), [])
                if beverage_items:
                    beverage = weighted_choice(beverage_items, "popularity")
                    order_items.append(beverage["item_id"])
                    total_price += beverage["price"]

            # Budget users avoid expensive total
            if user["segment"] == "budget" and total_price > user["avg_order_value"]:
                order_items = order_items[:2]  # trim extras

            # Generate timestamp
            order_time = base_date - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23)
            )

            orders.append({
                "order_id": order_id,
                "user_id": user["user_id"],
                "items": order_items,
                "total_price": total_price,
                "timestamp": order_time.isoformat()
            })

            order_id += 1

    return orders


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    orders_path = os.path.join(DATA_DIR, "orders.json")
    
    orders = generate_orders(n_weeks=6)

    with open(orders_path, "w") as f:
        json.dump(orders, f, indent=4)

    print(f"Generated {len(orders)} orders successfully.")
    print(f"Saved to: {orders_path}")