import pandas as pd
import numpy as np
import joblib
import json
import os

class ZomathonEngine:
    def __init__(self, model_path=None, co_path=None, items_path=None):
        # Dynamically resolve paths relative to this file if not provided
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        model_path = model_path or os.path.join(self.base_dir, "models", "ranker_v1.pkl")
        co_path = co_path or os.path.join(self.base_dir, "data", "cooccurrence.json")
        items_path = items_path or os.path.join(self.base_dir, "data", "items.json")

        # Load artifacts
        self.model = joblib.load(model_path)
        
        with open(co_path, 'r') as f:
            self.co_prob = json.load(f)
            
        with open(items_path, 'r') as f:
            items = json.load(f)
            # Use string keys to match the JSON structure of cooccurrence.json
            self.item_meta = {str(item['item_id']): item for item in items}
        
        # Ensure feature columns exactly match those used in build_training_dataset.py
        self.feature_cols = ["cart_size", "candidate_price", "is_drink"]

    def get_recommendations(self, cart_item_ids, top_n=3):
        """
        Calculates real-time recommendations based on the last item added to the cart.
        """
        if not cart_item_ids:
            return []

        # Step 1: Retrieval (Candidate Generation)
        last_item = str(cart_item_ids[-1])
        if last_item not in self.co_prob: 
            return []
        
        candidates = list(self.co_prob[last_item].keys())
        
        # Step 2: Feature Engineering (Optimized for speed)
        features = []
        for cand_id in candidates:
            item = self.item_meta[cand_id]
            features.append({
                "cart_size": len(cart_item_ids),
                "candidate_price": item['price'],
                "is_drink": 1 if item['category'] == 'beverage' else 0 # Matches generator logic
            })
        
        # Step 3: Ranking using LightGBM
        features_df = pd.DataFrame(features)[self.feature_cols]
        scores = self.model.predict_proba(features_df)[:, 1]
        
        # Step 4: Sort, Filter duplicates, and Return names
        ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
        
        final_recs = [
            self.item_meta[cand_id]['name'] 
            for cand_id, score in ranked 
            if int(cand_id) not in cart_item_ids
        ]
        
        return final_recs[:top_n]