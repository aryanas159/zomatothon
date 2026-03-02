# scripts/build_dataset.py

import os
import json
from generators.generate_items import generate_items
from generators.generate_users import generate_users
from generators.generate_orders import generate_orders


def build_dataset():

    # Resolve project root safely
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Create data directory if it doesn't exist
    os.makedirs(DATA_DIR, exist_ok=True)

    # --------------------
    # Generate Items
    # --------------------
    print("Generating items...")
    items = generate_items()

    items_path = os.path.join(DATA_DIR, "items.json")
    with open(items_path, "w") as f:
        json.dump(items, f, indent=4)

    print(f"Saved items to {items_path}")

    # --------------------
    # Generate Users
    # --------------------
    print("Generating users...")
    users = generate_users()

    users_path = os.path.join(DATA_DIR, "users.json")
    with open(users_path, "w") as f:
        json.dump(users, f, indent=4)

    print(f"Saved users to {users_path}")

    # --------------------
    # Generate Orders
    # --------------------
    print("Generating orders...")
    orders = generate_orders()
    orders_path = os.path.join(DATA_DIR, "orders.json")
    with open(orders_path, "w") as f:
        json.dump(orders, f, indent=4)

    print(f"Saved orders to {orders_path}")

    print("\nDataset generation complete.")


if __name__ == "__main__":
    build_dataset()
