# Zomatothon: Machine Learning Recommendation Engine

This repository contains the Recommendation & ML Engine for the Zomatothon project. It uses a two-stage approach (Retrieval + Ranking) to suggest the best menu items to users in real-time.

## 🚀 Quick Start

### 1. Installation
Ensure you are using Python 3.12. Install all dependencies:
```bash
pip install -r requirements.txt

# Generate raw data (items, users, orders)
python -m ml.scripts.build_dataset

# Build retrieval layer (Co-occurrence matrix)
python -m ml.scripts.build_cooccurence

# Build training dataset with negative samples
python -m ml.scripts.build_training_dataset

# Train the LightGBM Ranker model
python -m ml.scripts.train_model

## 🌐 API Deployment
To start the recommendation microservice:
```bash
python -m ml.app