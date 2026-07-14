from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

import asyncio

from app.database import engine, Base, get_db
from app.routes import auth, categories, requests, messages, ratings, payments, admin, provider
from app.events import event_manager
from app.models.models import User, Provider, ServiceCategory, ServiceRequest, Rating, Company

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MtaaniGo API", version="1.0.0", description="Location-based service marketplace for Kenya")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(requests.router)
app.include_router(messages.router)
app.include_router(ratings.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(provider.router)


@app.get("/")
def health_check():
    return {"status": "healthy", "app": "MtaaniGo API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/admin/metrics/stream")
async def metrics_stream():
    async def event_stream():
        queue = event_manager.subscribe("metrics")
        try:
            while True:
                payload = await queue.get()
                yield f"data: {payload}\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/search")
def search(q: str = "", db: Session = Depends(get_db)):
    results = {"users": [], "providers": [], "services": [], "companies": [], "bookings": []}
    if not q.strip():
        return results

    term = f"%{q}%"

    users = db.query(User).filter(
        or_(
            User.full_name.ilike(term),
            User.email.ilike(term),
            User.phone.ilike(term),
        )
    ).limit(8).all()
    results["users"] = [
        {"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role.value}
        for u in users
    ]

    providers = db.query(Provider).join(User).filter(User.full_name.ilike(term)).limit(8).all()
    results["providers"] = [
        {
            "id": p.id,
            "full_name": p.user.full_name,
            "address": p.address,
            "status": p.status.value if hasattr(p.status, "value") else p.status,
        }
        for p in providers
    ]

    services = db.query(ServiceCategory).filter(ServiceCategory.name.ilike(term)).limit(8).all()
    results["services"] = [
        {"id": s.id, "name": s.name, "description": s.description} for s in services
    ]

    companies = db.query(Company).filter(Company.name.ilike(term)).limit(8).all()
    results["companies"] = [
        {"id": c.id, "name": c.name, "description": c.description} for c in companies
    ]

    bookings = db.query(ServiceRequest).filter(
        or_(
            ServiceRequest.description.ilike(term),
            ServiceRequest.address.ilike(term),
        )
    ).limit(8).all()
    results["bookings"] = [
        {
            "id": b.id,
            "description": b.description,
            "status": b.status.value if hasattr(b.status, "value") else b.status,
            "address": b.address,
        }
        for b in bookings
    ]

    return results
