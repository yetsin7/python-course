"""Verify rollback when a transfer violates a balance constraint."""

import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE balances (id INTEGER PRIMARY KEY, cents INTEGER CHECK(cents >= 0))")
with connection:
    connection.executemany("INSERT INTO balances VALUES (?, ?)", [(1, 100), (2, 50)])
try:
    with connection:
        connection.execute("UPDATE balances SET cents = cents + 200 WHERE id = 2")
        connection.execute("UPDATE balances SET cents = cents - 200 WHERE id = 1")
except sqlite3.IntegrityError:
    pass
print(connection.execute("SELECT cents FROM balances ORDER BY id").fetchall())
connection.close()
