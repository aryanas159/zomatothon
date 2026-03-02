from fastapi import FastAPI, Query
from ml.src.engine import ZomathonEngine
from typing import List, Optional
import uvicorn
from typing import Optional

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

# Updated ml/app.py to align with Backend Controller
@app.get("/recommend/user/{userId}")
@app.get("/recommendations")
async def get_user_recs(userId: int, limit: int = 10):
    # Mapping: Use a default item or previous order for this user to get recs
    # In a real scenario, you'd fetch the user's last cart from a DB
    dummy_cart = [1] 
    recommendations = engine.get_recommendations(dummy_cart, top_n=limit)
    return {"restaurants": recommendations} # Key must be 'restaurants' for backend

@app.get("/recommend/similar/{restaurantId}")
@app.get("/similar-restaurants")
async def get_similar(restaurantId: str, limit: int = 5):
    # Mapping the backend's 'restaurantId' to your 'item_id'
    recommendations = engine.get_recommendations([int(restaurantId)], top_n=limit)
    return {
        "status": "success",
        "restaurants": recommendations # Match the key the backend expects
    }

#  Cuisine-based Recommendations
@app.get("/recommendations-by-cuisine")
@app.get("/recommend/cuisine/{cuisine}")
async def get_cuisine_recs(cuisine: Optional[str] = None,
    limit: int = 10):
    try:
        # Filter logic: We find items matching the cuisine from metadata
        # For now, providing ranked items from a sample seed matching cuisine types
        recommendations = engine.get_recommendations([15], top_n=limit)
        return {"status": "success", "cuisine": cuisine, "restaurants": recommendations}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#  Trending Restaurants/Items
@app.get("/trending-restaurants") # Path matches mlService.js trending call
@app.get("/recommend/trending")
async def get_trending(limit: int = 10):
    try:
        # Trending: Top items overall by popularity
        recommendations = engine.get_recommendations([20], top_n=limit)
        return {"status": "success", "restaurants": recommendations}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#  Group Recommendations
@app.get("/group-recommendations")
@app.get("/recommend/group")
async def get_group_recs(user_ids: Optional[str] = None, limit: int = 5):
    try:
        recommendations = engine.get_recommendations([1, 2], top_n=limit)
        return {"status": "success", "restaurants": recommendations}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/health")
async def health_check():
    return {"status": "online", "service": "Zomathon ML Engine"}

if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)