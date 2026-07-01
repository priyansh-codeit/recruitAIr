import json

with open("sample_output.json", "r", encoding="utf-8") as f:
    candidate = json.load(f)

print("JSON loaded successfully!")
print("Name:", candidate["name"])
print("Skills:", candidate["skills"])