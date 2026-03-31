import re
def normalize(text):
    return (text or "").strip().lower()

def assign_category(transaction, rules):

    merchant = normalize(transaction.merchant or "").lower()
    description = normalize(transaction.description or "").lower()

    # exact match
    for rule in rules:
        if rule.merchant_pattern:
            if re.search(rule.merchant_pattern.lower(), merchant):
                return rule.category

        if rule.keyword_pattern:
            if re.search(rule.keyword_pattern.lower(), description):
                return rule.category
 
    

    return "Others" 

def create_rule_safe(db, txn, current_user):
    return None
