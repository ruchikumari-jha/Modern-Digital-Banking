import re

def normalize(text):
    return (text or "").strip().lower()


def assign_category(transaction, rules):

    #  MOST IMPORTANT FIX (ADD THIS)
    if getattr(transaction, "is_categorized", False):
        return transaction.category

    merchant = normalize(transaction.merchant)
    description = normalize(transaction.description)

    # ===============================
    # 1️⃣ EXACT MATCH (HIGHEST PRIORITY)
    # ===============================
    for rule in rules:
        if rule.merchant_pattern:
            if merchant == normalize(rule.merchant_pattern):
                return rule.category

    # ===============================
    # 2️⃣ PARTIAL MERCHANT MATCH
    # ===============================
    for rule in rules:
        if rule.merchant_pattern:
            if normalize(rule.merchant_pattern) in merchant:
                return rule.category

    # ===============================
    # 3️⃣ KEYWORD MATCH (DESCRIPTION)
    # ===============================
    for rule in rules:
        if rule.keyword_pattern:
            if normalize(rule.keyword_pattern) in description:
                return rule.category

    # ===============================
    # 4️⃣ DEFAULT
    # ===============================
    return "Uncategorized"


# OPTIONAL (FOR FUTURE)
def create_rule_safe(db, txn, current_user):
    existing = db.query(CategoryRule).filter(
        CategoryRule.user_id == current_user.id,
        CategoryRule.merchant_pattern == txn.merchant,
        CategoryRule.category == txn.category
    ).first()

    if existing:
        return existing

    rule = CategoryRule(
        user_id=current_user.id,
        merchant_pattern=txn.merchant,
        keyword_pattern=None,
        category=txn.category,
        is_active=True,
        priority=1
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule