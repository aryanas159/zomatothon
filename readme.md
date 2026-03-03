# Zomatothon: Machine Learning Recommendation Engine

This repository contains the recommendation and ML engine for Zomatothon.  
It uses a two-stage approach (retrieval + ranking) to suggest items in real time.

## Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Build artifacts (data + model)
```bash
python main.py
```

### 3. Run ML API only
```bash
python -m ml.app
```

## Run Full Stack Locally (Windows)

From the project root:

```powershell
.\start-all.cmd
```

This starts:
- ML API on `http://localhost:8000`
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:3000`

To stop all managed services:

```powershell
.\stop-all.cmd
```
