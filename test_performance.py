import time
import numpy as np
import json
import pandas as pd
from ml.src.engine import ZomathonEngine

def run_evaluation():
    engine = ZomathonEngine()
    
    # --- 1. Latency Test ---
    latencies = []
    all_item_ids = [int(k) for k in engine.item_meta.keys()]
    for _ in range(100):
        test_cart = np.random.choice(all_item_ids, size=np.random.randint(1, 4), replace=False).tolist()
        start = time.perf_counter()
        engine.get_recommendations(test_cart)
        latencies.append((time.perf_counter() - start) * 1000)

    # --- 2. Accuracy Test (Hit Rate @ 3) ---
    with open('ml/data/orders.json', 'r') as f:
        test_orders = json.load(f)[:100]
    
    hits = 0
    total = 0
    for order in test_orders:
        if len(order['items']) < 2: continue
        cart, actual = order['items'][:-1], order['items'][-1]
        recs = engine.get_recommendations(cart, top_n=3)
        if engine.item_meta[str(actual)]['name'] in recs:
            hits += 1
        total += 1

    # --- 3. Output Type Check ---
    sample_cart = [all_item_ids[0]]
    sample_output = engine.get_recommendations(sample_cart)

    print("\n--- 📊 Zomathon Model Report ---")
    print(f"🔹 Accuracy (Hit Rate @ 3): {(hits/total)*100:.2f}%")
    print(f"🔹 Avg Latency:            {np.mean(latencies):.2f} ms")
    print(f"🔹 P99 Latency:             {np.percentile(latencies, 99):.2f} ms")
    print(f"🔹 Output Format:           {type(sample_output)} of {type(sample_output[0]) if sample_output else 'None'}")
    print(f"🔹 Sample Output:           {sample_output}")

if __name__ == "__main__":
    run_evaluation()