"""Use SQLite parameters and constraints for a small stock table."""

import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE products (code TEXT PRIMARY KEY, stock INTEGER NOT NULL CHECK(stock >= 0))")
connection.execute("INSERT INTO products (code, stock) VALUES (?, ?)", ("PAPER", 8))
row = connection.execute("SELECT stock FROM products WHERE code = ?", ("PAPER",)).fetchone()
print(row[0])
row = connection.execute("SELECT stock FROM products WHERE code = ?", ("PAPER' OR 1=1 --",)).fetchone()
print(row is None)
connection.close()
