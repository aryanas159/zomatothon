# generators/generate_users.py

import json
import random
import os


def generate_users(n_users=500):

    first_names = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun",
        "Sai", "Reyansh", "Krishna", "Ishaan", "Shaurya",
        "Aisha", "Fatima", "Zara", "Sara", "Anaya",
        "Emma", "Olivia", "Noah", "Liam", "Sophia",
        "Rahul", "Priya", "Karan", "Sneha", "Riya",
        "Matt", "John", "David", "Daniel", "Aryan"
    ]

    cuisines = ["Indian", "Chinese", "Italian"]

    segments = {
        "budget": {
            "price_sensitivity_range": (0.7, 1.0),
            "avg_order_value_range": (200, 400)
        },
        "regular": {
            "price_sensitivity_range": (0.4, 0.7),
            "avg_order_value_range": (400, 700)
        },
        "premium": {
            "price_sensitivity_range": (0.1, 0.4),
            "avg_order_value_range": (700, 1200)
        }
    }

    users = []

    for user_id in range(n_users):

        segment = random.choices(
            population=list(segments.keys()),
            weights=[0.4, 0.4, 0.2]  # more budget & regular users
        )[0]

        segment_info = segments[segment]

        user = {
            "user_id": user_id,
            "name": random.choice(first_names) + "_" + str(user_id),
            "segment": segment,
            "preferred_cuisine": random.choice(cuisines),

            "price_sensitivity": round(
                random.uniform(*segment_info["price_sensitivity_range"]), 2
            ),

            "avg_order_value": random.randint(
                *segment_info["avg_order_value_range"]
            ),

            "avg_items_per_order": random.randint(1, 5),

            "dessert_ratio": round(random.uniform(0.1, 0.6), 2),
            "beverage_ratio": round(random.uniform(0.1, 0.5), 2),

            "order_frequency_per_week": random.randint(1, 7)
        }

        users.append(user)

    return users


if __name__ == "__main__":

    # Resolve project root dynamically
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Ensure data folder exists
    os.makedirs(DATA_DIR, exist_ok=True)

    users = generate_users(n_users=1000)

    users_path = os.path.join(DATA_DIR, "users.json")

    with open(users_path, "w") as f:
        json.dump(users, f, indent=4)

    print(f"Generated {len(users)} users successfully.")
    print(f"Saved to: {users_path}")