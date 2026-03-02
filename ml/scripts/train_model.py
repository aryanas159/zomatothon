import pandas as pd
import lightgbm as lgb
import joblib
import os

def train_ranker():
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    MODEL_DIR = os.path.join(BASE_DIR, "models")
    
    
    train_path = os.path.join(DATA_DIR, "training_dataset.csv")
    if not os.path.exists(train_path):
        print(f"Error: {train_path} not found. Run build_training_dataset first.")
        return
        
    df = pd.read_csv(train_path)
    
   
    X = df[["cart_size", "candidate_price", "is_drink"]] 
    y = df["label"]

    model = lgb.LGBMClassifier(
        n_estimators=50, 
        min_child_samples=1, 
        min_data_in_bin=1,
        verbosity=-1
    )
    
    print("Training the LightGBM ranker model...")
    model.fit(X, y)
    
   
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "ranker_v1.pkl")
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_ranker()