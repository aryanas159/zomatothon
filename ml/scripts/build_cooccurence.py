import json
import os
from collections import defaultdict


def build_cooccurrence():

    # Resolve paths safely
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    orders_path = os.path.join(DATA_DIR, "orders.json")
    output_path = os.path.join(DATA_DIR, "cooccurrence.json")

    with open(orders_path) as f:
        orders = json.load(f)

    co_matrix = defaultdict(lambda: defaultdict(int))

    # Count forward transitions
    for order in orders:
        items = order["items"]

        for i in range(len(items) - 1):
            current_item = items[i]
            next_item = items[i + 1]

            co_matrix[current_item][next_item] += 1

    # Normalize to probabilities
    co_prob = {}

    for item_i in co_matrix:
        total = sum(co_matrix[item_i].values())
        co_prob[item_i] = {
            item_j: co_matrix[item_i][item_j] / total for item_j in co_matrix[item_i]
        }

    with open(output_path, "w") as f:
        json.dump(co_prob, f, indent=4)

    print(f"Co-occurrence matrix built.")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    build_cooccurrence()
