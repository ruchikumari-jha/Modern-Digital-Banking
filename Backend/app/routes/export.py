import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from io import StringIO
import tempfile

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from app.database import SessionLocal
from app.models.transaction import Transaction

router = APIRouter(prefix="/export", tags=["Export"])


# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================================================
# ✅ EXPORT TRANSACTIONS (CSV)
# ==================================================
@router.get("/transactions")
def export_transactions(format: str, db: Session = Depends(get_db)):

    if format != "csv":
        return {"error": "Only csv format supported"}

    transactions = db.query(
    Transaction.id,
    Transaction.amount,
    Transaction.txn_type,
    Transaction.category,
    Transaction.txn_date
).all()

    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["ID", "Amount", "Type", "Category", "Date"])

    # Safe data writing (NO ERRORS GUARANTEED)
    for t in transactions:
        writer.writerow(list(t))

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=transactions.csv"
        },
    )


# ==================================================
# ✅ EXPORT INSIGHTS (PDF)
# ==================================================
@router.get("/insights")
def export_insights(format: str = "pdf", db: Session = Depends(get_db)):

    if format != "pdf":
        return {"error": "Only pdf format supported"}

    # Cashflow
    cashflow_data = db.query(
        Transaction.txn_type,
        func.sum(Transaction.amount)
    ).group_by(Transaction.type).all()

    # Category spend
    category_data = db.query(
        Transaction.category,
        func.sum(Transaction.amount)
    ).group_by(Transaction.category).all()

    # Top merchants
    merchant_data = db.query(
        Transaction.merchant,
        func.sum(Transaction.amount)
    ).group_by(Transaction.merchant).order_by(func.sum(Transaction.amount).desc()).limit(5).all()

    # Burn rate
    burn_rate = db.query(
        func.sum(Transaction.amount)
    ).filter(Transaction.txn_type == "expense").scalar()

    #  Create PDF
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    c = canvas.Canvas(temp.name, pagesize=letter)

    y = 750

    c.drawString(50, y, "INSIGHTS REPORT")
    y -= 40

    # Cashflow
    c.drawString(50, y, "Cashflow:")
    y -= 20
    for t in cashflow_data:
        c.drawString(70, y, f"{t[0]}: {t[1]}")
        y -= 15

    y -= 10

    # Category
    c.drawString(50, y, "Category Spend:")
    y -= 20
    for cdata in category_data:
        c.drawString(70, y, f"{cdata[0]}: {cdata[1]}")
        y -= 15

    y -= 10

    # Merchants
    c.drawString(50, y, "Top Merchants:")
    y -= 20
    for m in merchant_data:
        c.drawString(70, y, f"{m[0]}: {m[1]}")
        y -= 15

    y -= 10

    # Burn Rate
    c.drawString(50, y, f"Total Expense (Burn Rate): {burn_rate}")

    c.save()

    return FileResponse(
        temp.name,
        media_type="application/pdf",
        filename="insights_report.pdf"
    )