from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import ServiceCategory

categories = [
    {"name": "Plumber", "icon": "🔧", "description": "Pipe installation, repairs, and maintenance"},
    {"name": "Electrician", "icon": "⚡", "description": "Wiring, installations, and electrical repairs"},
    {"name": "Painter", "icon": "🎨", "description": "Interior and exterior painting services"},
    {"name": "Carpenter", "icon": "🔨", "description": "Furniture making and woodwork"},
    {"name": "Mason", "icon": "🧱", "description": "Masonry, bricklaying, and construction"},
    {"name": "Welder", "icon": "🔥", "description": "Welding and metal fabrication"},
    {"name": "Barber", "icon": "💈", "description": "Hair cutting and grooming"},
    {"name": "Salon", "icon": "💅", "description": "Hair styling and beauty services"},
    {"name": "Makeup Artist", "icon": "💄", "description": "Professional makeup application"},
    {"name": "Nail Technician", "icon": "💅", "description": "Nail care and manicures"},
    {"name": "Mechanic", "icon": "🔩", "description": "Vehicle repairs and maintenance"},
    {"name": "Car Wash", "icon": "🚗", "description": "Car cleaning and detailing"},
    {"name": "House Cleaning", "icon": "🧹", "description": "Home cleaning services"},
    {"name": "Laundry", "icon": "👕", "description": "Washing and ironing services"},
    {"name": "DJ", "icon": "🎵", "description": "Music and entertainment for events"},
    {"name": "Photographer", "icon": "📸", "description": "Event and portrait photography"},
    {"name": "CCTV Installer", "icon": "📹", "description": "Security camera installation"},
]


def seed_categories(db: Session):
    for cat in categories:
        existing = db.query(ServiceCategory).filter(ServiceCategory.name == cat["name"]).first()
        if not existing:
            db.add(ServiceCategory(**cat))
    db.commit()
    print("Categories seeded successfully!")


if __name__ == "__main__":
    db = SessionLocal()
    seed_categories(db)
    db.close()
