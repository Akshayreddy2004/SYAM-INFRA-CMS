import sqlite3
import os
import glob
from app.database import SessionLocal
from app import models, auth

# 1. Clear database tables
conn = sqlite3.connect('syam_infra.db')
cursor = conn.cursor()
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
for t in tables:
    if t[0] != 'sqlite_sequence':
        cursor.execute(f'DELETE FROM {t[0]}')
conn.commit()
conn.close()
print('All database tables cleared.')

# 2. Recreate admin user
db = SessionLocal()
hashed = auth.get_password_hash('admin123')
db.add(models.User(username='admin', hashed_password=hashed))
db.commit()
db.close()
print('Admin user recreated.')

# 3. Clear uploads
uploads_dir = 'uploads'
if os.path.exists(uploads_dir):
    files = glob.glob(os.path.join(uploads_dir, '*'))
    for f in files:
        try:
            os.remove(f)
        except Exception as e:
            print(f'Could not delete {f}: {e}')
print('Uploads folder cleared.')

print('HARD RESET COMPLETE!')
