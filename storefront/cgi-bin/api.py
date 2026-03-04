#!/usr/bin/env python3
import json
import os
import sqlite3
import sys
import uuid
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'airportfits.db')

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            first_name TEXT,
            last_name TEXT,
            address TEXT,
            city TEXT,
            country TEXT,
            postal_code TEXT,
            shipping_method TEXT,
            shipping_cost REAL,
            subtotal REAL,
            total REAL,
            items TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.execute("""
        CREATE TABLE IF NOT EXISTS newsletter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    db.commit()
    return db

def send_response(status, data, cors=True):
    print(f"Status: {status}")
    print("Content-Type: application/json")
    if cors:
        print("Access-Control-Allow-Origin: *")
        print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        print("Access-Control-Allow-Headers: Content-Type")
    print()
    print(json.dumps(data))

def generate_order_number():
    now = datetime.now()
    uid = str(uuid.uuid4()).replace('-', '').upper()[:8]
    return f"AF-{now.strftime('%y%m%d')}-{uid}"

def estimate_delivery(shipping_method):
    now = datetime.now()
    if shipping_method == 'express':
        delta = timedelta(days=3)
        label = "Express (2-4 business days)"
    elif shipping_method == 'free':
        delta = timedelta(days=10)
        label = "Free Shipping (7-12 business days)"
    else:
        delta = timedelta(days=7)
        label = "Standard (5-8 business days)"
    delivery_date = now + delta
    return {
        "label": label,
        "estimated_date": delivery_date.strftime("%B %d, %Y")
    }

method = os.environ.get("REQUEST_METHOD", "GET").upper()
query = os.environ.get("QUERY_STRING", "")

# Parse query string
params = {}
if query:
    for part in query.split("&"):
        if "=" in part:
            k, v = part.split("=", 1)
            params[k] = v
        else:
            params[part] = ""

action = params.get("action", "")

# Handle OPTIONS preflight
if method == "OPTIONS":
    print("Status: 200")
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
    print("Access-Control-Allow-Headers: Content-Type")
    print()
    print("{}")
    sys.exit(0)

try:
    db = get_db()

    if action == "place_order" and method == "POST":
        content_length = int(os.environ.get("CONTENT_LENGTH", 0))
        body = sys.stdin.read(content_length) if content_length > 0 else sys.stdin.read()
        data = json.loads(body)

        order_number = generate_order_number()
        items_json = json.dumps(data.get("items", []))
        shipping_method = data.get("shipping_method", "standard")
        shipping_cost = data.get("shipping_cost", 8.0)
        subtotal = data.get("subtotal", 0.0)
        total = subtotal + shipping_cost

        db.execute("""
            INSERT INTO orders (
                order_number, email, phone, first_name, last_name,
                address, city, country, postal_code,
                shipping_method, shipping_cost, subtotal, total, items
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            order_number,
            data.get("email", ""),
            data.get("phone", ""),
            data.get("first_name", ""),
            data.get("last_name", ""),
            data.get("address", ""),
            data.get("city", ""),
            data.get("country", ""),
            data.get("postal_code", ""),
            shipping_method,
            shipping_cost,
            subtotal,
            total,
            items_json
        ])
        db.commit()

        delivery = estimate_delivery(shipping_method)

        send_response(201, {
            "success": True,
            "order_number": order_number,
            "total": total,
            "subtotal": subtotal,
            "shipping_cost": shipping_cost,
            "shipping_method": shipping_method,
            "delivery": delivery,
            "items": data.get("items", []),
            "email": data.get("email", ""),
            "name": f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
        })

    elif action == "get_order" and method == "GET":
        order_id = params.get("id", "")
        if not order_id:
            send_response(400, {"error": "Order ID required"})
            sys.exit(0)

        row = db.execute(
            "SELECT * FROM orders WHERE order_number = ?", [order_id]
        ).fetchone()

        if not row:
            send_response(404, {"error": "Order not found"})
            sys.exit(0)

        order = dict(row)
        order["items"] = json.loads(order["items"])
        order["delivery"] = estimate_delivery(order["shipping_method"])
        send_response(200, order)

    elif action == "newsletter" and method == "POST":
        content_length = int(os.environ.get("CONTENT_LENGTH", 0))
        body = sys.stdin.read(content_length) if content_length > 0 else sys.stdin.read()
        data = json.loads(body)
        email = data.get("email", "").strip().lower()

        if not email or "@" not in email:
            send_response(400, {"error": "Valid email required"})
            sys.exit(0)

        try:
            db.execute("INSERT INTO newsletter (email) VALUES (?)", [email])
            db.commit()
            send_response(201, {"success": True, "message": "Thank you for subscribing!"})
        except sqlite3.IntegrityError:
            send_response(200, {"success": True, "message": "You're already subscribed!"})

    else:
        send_response(400, {"error": "Unknown action or method"})

except Exception as e:
    send_response(500, {"error": str(e)})
