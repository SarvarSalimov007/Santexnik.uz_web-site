"""Seed script to populate the database with initial demo data."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models import User, Worker, Review
from auth import get_password_hash

def seed_database():
    """Populate database with initial data."""
    init_db()
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("⚠️  Database already has data. Skipping seed.")
            return
        
        # Create Super Admin
        super_admin = User(
            username="Sarvar",
            email="admin@santexnik.uz",
            full_name="Sarvar Salimov",
            phone="+998901234567",
            hashed_password=get_password_hash("exa1122211"),
            role="super_admin",
            is_active=True
        )
        db.add(super_admin)
        db.flush()
        
        # Create demo workers
        workers_data = [
            {
                "full_name": "Azamat Toshmatov",
                "phone": "998901234567",
                "age": 35,
                "category": "santexnik",
                "experience_years": 8,
                "description": "Professional santexnik. Barcha turdagi quvurlarni almashtirish va isitish tizimlarini o'rnatish. 8 yillik tajriba.",
                "address": "Chilonzor tumani",
                "city": "Toshkent shahri",
                "avg_rating": 4.9,
                "total_reviews": 124,
                "is_active": True,
                "is_verified": True,
                "price_range": "Kelishilgan",
                "telegram_username": "azamat_santexnik",
                "added_by": super_admin.id
            },
            {
                "full_name": "Bobur Aliyev",
                "phone": "998931112233",
                "age": 28,
                "category": "elektrik",
                "experience_years": 5,
                "description": "Rozetka, vikluchatel va noldan sim tortish xizmatlari. Sifatiga kafolat beraman. Tez va ishonchli.",
                "address": "Yakkasaroy tumani",
                "city": "Toshkent shahri",
                "avg_rating": 4.7,
                "total_reviews": 86,
                "is_active": True,
                "is_verified": True,
                "price_range": "50 000 so'mdan",
                "telegram_username": "bobur_elektrik",
                "added_by": super_admin.id
            },
            {
                "full_name": "Sanjar Karimberdiyev",
                "phone": "998977778899",
                "age": 42,
                "category": "umumiy_tamir",
                "experience_years": 12,
                "description": "Yevro remont, kafellar terish, oboy yopishtirish va h.k. O'z brigadamiz bor. Barcha ishlar sifatli va tez bajariladi.",
                "address": "Siob tumani",
                "city": "Samarqand viloyati",
                "avg_rating": 5.0,
                "total_reviews": 210,
                "is_active": True,
                "is_verified": True,
                "price_range": "Kelishilgan",
                "telegram_username": "sanjar_remont",
                "added_by": super_admin.id
            },
            {
                "full_name": "Dilshod Rahmatov",
                "phone": "998994445566",
                "age": 30,
                "category": "konditsioner",
                "experience_years": 4,
                "description": "Konditsioner o'rnatish, tozalash va freon quyish. Tez va sifatli xizmat. Kafolatli ish.",
                "address": "Mirzo Ulug'bek tumani",
                "city": "Toshkent shahri",
                "avg_rating": 4.5,
                "total_reviews": 45,
                "is_active": True,
                "is_verified": False,
                "price_range": "100 000 so'm/soat",
                "telegram_username": "dilshod_kondi",
                "added_by": super_admin.id
            },
            {
                "full_name": "Jasur Mamatov",
                "phone": "998905556677",
                "age": 38,
                "category": "duradgor",
                "experience_years": 15,
                "description": "Professional duradgor. Eshiklar, derazalar va yog'och konstruktsiyalarni yasash va o'rnatish.",
                "address": "Sergeli tumani",
                "city": "Toshkent shahri",
                "avg_rating": 4.8,
                "total_reviews": 67,
                "is_active": True,
                "is_verified": True,
                "price_range": "80 000 so'mdan",
                "telegram_username": "jasur_duradgor",
                "added_by": super_admin.id
            },
            {
                "full_name": "Ulugbek Normatov",
                "phone": "998917778899",
                "age": 33,
                "category": "suvaqchi",
                "experience_years": 10,
                "description": "Suvoq ishlari, devorlarni tekislash va dekorativ suvoq. Sifatli material va ish kafolatlanadi.",
                "address": "Farg'ona shahri",
                "city": "Farg'ona viloyati",
                "avg_rating": 4.6,
                "total_reviews": 53,
                "is_active": True,
                "is_verified": True,
                "price_range": "Kelishilgan",
                "telegram_username": "ulugbek_suvaqchi",
                "added_by": super_admin.id
            },
            {
                "full_name": "Mirzo Karimov",
                "phone": "998933334455",
                "age": 27,
                "category": "plitakash",
                "experience_years": 6,
                "description": "Kafel va plitka terish ustasi. Hammom, oshxona va pol kafellarini professional qo'yish.",
                "address": "Olmazor tumani",
                "city": "Toshkent shahri",
                "avg_rating": 4.4,
                "total_reviews": 38,
                "is_active": True,
                "is_verified": False,
                "price_range": "70 000 so'm/m²",
                "telegram_username": "mirzo_plitka",
                "added_by": super_admin.id
            },
            {
                "full_name": "Farhod Eshmatov",
                "phone": "998909998877",
                "age": 45,
                "category": "svarka",
                "experience_years": 20,
                "description": "Svarka ishlari. Temir darvoza, panjara, qo'rg'on va barcha turdagi metall konstruktsiyalar.",
                "address": "Andijon shahri",
                "city": "Andijon viloyati",
                "avg_rating": 4.9,
                "total_reviews": 178,
                "is_active": True,
                "is_verified": True,
                "price_range": "Kelishilgan",
                "telegram_username": "farhod_svarkachi",
                "added_by": super_admin.id
            },
        ]
        
        for w_data in workers_data:
            worker = Worker(**w_data)
            db.add(worker)
        
        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   Admin: username='admin', password='admin123'")
        print(f"   Workers: {len(workers_data)} ta usta qo'shildi")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
