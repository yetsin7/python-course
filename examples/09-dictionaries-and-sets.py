"""Represent stock by product code and summarize distinct categories."""

stock_by_code = {"PAPER": 8, "PEN": 12}
stock_by_code["PAPER"] += 2
print(stock_by_code["PAPER"])
print(stock_by_code.get("RULER", 0))
print(sum(stock_by_code.values()))
print(sorted(set(["office", "tools", "office"])))
