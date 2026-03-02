from ml.scripts.build_dataset import build_dataset
from ml.scripts.build_cooccurence import build_cooccurrence
from ml.scripts.build_training_dataset import build_training_dataset
from ml.scripts.train_model import train_ranker

def run_pipeline():
    print("--- 1. Generating Raw Data ---")
    build_dataset() 
    
    print("--- 2. Building Co-occurrence Matrix ---")
    build_cooccurrence() 
    
    print("--- 3. Constructing Training Samples ---")
    build_training_dataset()
    
    print("--- 4. Training Model ---")
    train_ranker()

if __name__ == "__main__":
    run_pipeline()