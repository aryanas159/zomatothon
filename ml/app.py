from fastapi import FastAPI, Query
from ml.src.engine import ZomathonEngine
from typing import List
import uvicorn


app = FastAPI(title="Zomathon Recommendation API")


engine = ZomathonEngine()

@app.get("/recommend")
def recommend(cart: List[int] = Query(...), top_n: int = 3):
    """
    Endpoint to get real-time recommendations.
    Example: /recommend?cart=1&cart=2&top_n=3
    """
    try:
        recommendations = engine.get_recommendations(cart, top_n=top_n)
        return {
            "status": "success",
            "cart_input": cart,
            "recommendations": recommendations
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)