import json
import os
import random
import pandas as pd


def build_training_dataset(neg_samples=5):

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    orders_path = os.path.join(DATA_DIR, "orders.json")
    items_path = os.path.join(DATA_DIR, "items.json")
    users_path = os.path.join(DATA_DIR, "users.json")
    co_path = os.path.join(DATA_DIR, "cooccurrence.json")

    with open(orders_path) as f:
        orders = json.load(f)

    with open(items_path) as f:
        items = json.load(f)

    with open(users_path) as f:
        users = json.load(f)

    with open(co_path) as f:
        co_prob = json.load(f)

    item_dict = {item["item_id"]: item for item in items}
    user_dict = {user["user_id"]: user for user in users}

    all_item_ids = list(item_dict.keys())

    rows = []
    group_counter = 0  # Unique group id per cart state

    for order in orders:
        user_id = order["user_id"]
        order_id = order["order_id"]
        items_in_order = order["items"]

        cart = []

        for position in range(len(items_in_order)):

            current_item = items_in_order[position]

            if len(cart) > 0:

                positive = current_item

                last_item = cart[-1]
                candidates = list(co_prob.get(str(last_item), {}).keys())
                candidates = [int(c) for c in candidates]

                negatives = random.sample(all_item_ids, neg_samples)
                candidate_pool = list(set(candidates + negatives))

                cart_value = sum(item_dict[item]["price"] for item in cart)

                # 🔥 SAME group_id for this entire cart state
                group_id = group_counter

                for candidate in candidate_pool:
                    rows.append({
                        "group_id": group_id,
                        "user_id": user_id,
                        "cart_size": len(cart),
                        "cart_value": cart_value,
                        "candidate_item": candidate,
                        "candidate_price": item_dict[candidate]["price"],
                        "user_segment": user_dict[user_id]["segment"],
                        "preferred_cuisine": user_dict[user_id]["preferred_cuisine"],
                        "label": 1 if candidate == positive else 0
                    })

                group_counter += 1  # Increment after finishing this cart state

            cart.append(current_item)

    df = pd.DataFrame(rows)

    output_path = os.path.join(DATA_DIR, "training_dataset.csv")
    df.to_csv(output_path, index=False)

    print(f"Training dataset built with {len(df)} rows.")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    build_training_dataset()