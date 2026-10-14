# -*- coding: utf-8 -*-
import json
import re
from pdf_data import pdf_entries

def norm(s):
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

SENTENCES_PATH = 'server/data/sentences.json'

with open(SENTENCES_PATH, 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

print(f"Initial count in sentences.json: {len(existing_data)}")
max_id = max(item['id'] for item in existing_data)
print(f"Max existing ID: {max_id}")

seen_en = {norm(item['english']): item for item in existing_data}

def get_parts(en, cat, sub):
    en_lower = en.lower()
    if 'old-looking building' in en_lower:
        return [2]
    if 'modern art gallery' in en_lower:
        return [2, 3]
    if any(k in en_lower for k in [
        'is taking a picture', 'picture was taken', 'is taking an order',
        'is entering an old-looking', 'is doing an experiment',
        'is going up the stairs', 'is going along the river',
        'is taking notes', 'are having a meeting', 'are taking a break'
    ]):
        return [2]
    return [3, 5]

added_count = 0
skipped_existing = 0
skipped_pdf_dup = 0
seen_in_pdf = set()

for entry in pdf_entries:
    en_norm = norm(entry['en'])
    
    # Check if duplicate within PDF list
    if en_norm in seen_in_pdf:
        skipped_pdf_dup += 1
        continue
    seen_in_pdf.add(en_norm)
    
    # Check if already in existing_data
    if en_norm in seen_en:
        skipped_existing += 1
        # Ensure difficulty is 1
        seen_en[en_norm]['difficulty'] = 1
        continue
    
    max_id += 1
    new_item = {
        "id": max_id,
        "category": entry["cat"],
        "categoryName": entry["catName"],
        "subcategory": entry["sub"],
        "pattern": entry["pat"],
        "korean": entry["ko"],
        "english": entry["en"],
        "keyExpression": entry["key"],
        "difficulty": 1,
        "parts": get_parts(entry["en"], entry["cat"], entry["sub"])
    }
    existing_data.append(new_item)
    seen_en[en_norm] = new_item
    added_count += 1

print(f"Added count: {added_count}")
print(f"Skipped (already in sentences.json): {skipped_existing}")
print(f"Skipped (internal PDF duplicate): {skipped_pdf_dup}")
print(f"Final total count: {len(existing_data)}")

# Verification: Ensure all 395 PDF items are present in the final data
final_set = {norm(item['english']) for item in existing_data}
missing = [entry['en'] for entry in pdf_entries if norm(entry['en']) not in final_set]
if missing:
    print(f"ERROR: {len(missing)} items still missing!")
    for m in missing[:5]:
        print(" -", m)
else:
    print("SUCCESS: 100% of PDF sentences are included in sentences.json!")

# Verification: Check for any duplicate IDs or duplicate English sentences
all_ids = [item['id'] for item in existing_data]
assert len(all_ids) == len(set(all_ids)), "Duplicate IDs found!"

all_en = [norm(item['english']) for item in existing_data]
assert len(all_en) == len(set(all_en)), "Duplicate English sentences found!"

# Save
with open(SENTENCES_PATH, 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, ensure_ascii=False, indent=2)

print(f"Saved successfully to {SENTENCES_PATH}")
