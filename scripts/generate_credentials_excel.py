import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.drawing.image import Image
from openpyxl.utils import get_column_letter

# Account credentials data
accounts = [
    {
        "id": 1,
        "name": "الإعلامي (سوبر أدمن - الإدارة العليا)",
        "role": "Super Admin (مشرف عام)",
        "email": "spp.media.ksu@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 2,
        "name": "ممثل مبادرة طويق",
        "role": "مبادرة (Tuwaiq Initiative)",
        "email": "tuwaiq.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 3,
        "name": "ممثل مبادرة تقانة",
        "role": "مبادرة (Taqana Initiative)",
        "email": "taqana.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 4,
        "name": "ممثل مبادرة وفود",
        "role": "مبادرة (Wofood Initiative)",
        "email": "wofood.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 5,
        "name": "ممثل مبادرة متنفس",
        "role": "مبادرة (Mutanafs Initiative)",
        "email": "mutanafs.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 6,
        "name": "ممثل مبادرة بريق النور",
        "role": "مبادرة (Bariq Initiative)",
        "email": "bariq.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 7,
        "name": "ممثل مبادرة ديوان",
        "role": "مبادرة (Diwan Initiative)",
        "email": "diwan.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 8,
        "name": "ممثل مبادرة كفة",
        "role": "مبادرة (Kaffah Initiative)",
        "email": "kaffah.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    },
    {
        "id": 9,
        "name": "ممثل مبادرة إثمار",
        "role": "مبادرة (Eithmar Initiative)",
        "email": "eithmar.initiative@gmail.com",
        "password": "Aa112233@112233@",
        "status": "نشط (Active)"
    }
]

# Write CSV with UTF-8 BOM
csv_file_path = "سجل_حسابات_المنصة_الاعلامية.csv"
with open(csv_file_path, mode="w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["#", "الاسم / جهة الحساب", "نوع الحساب / الدور", "البريد الإلكتروني", "كلمة السر المعتمدة", "حالة الحساب"])
    for acc in accounts:
        writer.writerow([acc["id"], acc["name"], acc["role"], acc["email"], acc["password"], acc["status"]])

print(f"CSV file created successfully: {csv_file_path}")

# Write Executive Excel File (.xlsx)
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "سجل الحسابات"
ws.views.sheetView[0].rightToLeft = True

# Styling definitions
header_fill = PatternFill(start_color="06266F", end_color="06266F", fill_type="solid")
header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")

title_font = Font(name="Arial", size=16, bold=True, color="06266F")
subtitle_font = Font(name="Arial", size=10, bold=False, color="475569")
badge_font = Font(name="Arial", size=10, bold=True, color="D97706")

row_even_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
row_odd_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

# Header Branding Info
ws.merge_cells("C2:F2")
ws["C2"] = "المنصة التنظيمية للجنة الإعلامية — برنامج الشراكة الطلابية"
ws["C2"].font = title_font
ws["C2"].alignment = Alignment(horizontal="right", vertical="center")

ws.merge_cells("C3:F3")
ws["C3"] = "سجل بيانات حسابات الدخول الرسمية مع كلمات السر المعتمدة"
ws["C3"].font = subtitle_font
ws["C3"].alignment = Alignment(horizontal="right", vertical="center")

# Add Technical Committee Logo
logo_path = "public/images/technical-committee.png"
if os.path.exists(logo_path):
    img = Image(logo_path)
    img.width = 120
    img.height = 45
    ws.add_image(img, "A2")

# Table Column Headers at Row 6
headers = ["#", "الاسم / جهة الحساب", "نوع الحساب / الدور", "البريد الإلكتروني", "كلمة السر المعتمدة", "حالة الحساب"]
ws.row_dimensions[6].height = 28

for col_num, header_title in enumerate(headers, 1):
    cell = ws.cell(row=6, column=col_num)
    cell.value = header_title
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = thin_border

# Populate Rows starting at Row 7
for idx, acc in enumerate(accounts):
    row_num = 7 + idx
    ws.row_dimensions[row_num].height = 24
    row_fill = row_even_fill if idx % 2 == 0 else row_odd_fill

    values = [acc["id"], acc["name"], acc["role"], acc["email"], acc["password"], acc["status"]]
    
    for col_num, val in enumerate(values, 1):
        cell = ws.cell(row=row_num, column=col_num)
        cell.value = val
        cell.fill = row_fill
        cell.border = thin_border
        
        # Center align ID, Password, Status
        if col_num in [1, 4, 5, 6]:
            cell.alignment = Alignment(horizontal="center", vertical="center")
        else:
            cell.alignment = Alignment(horizontal="right", vertical="center")
            
        # Font settings
        if col_num == 5:
            cell.font = Font(name="Courier New", size=11, bold=True, color="0284C7")
        elif col_num == 4:
            cell.font = Font(name="Arial", size=10, bold=True, color="0F172A")
        elif col_num == 6:
            cell.font = Font(name="Arial", size=10, bold=True, color="059669")
        else:
            cell.font = Font(name="Arial", size=10, bold=False, color="1E293B")

# Auto-adjust Column Widths
for col in ws.columns:
    max_len = 0
    col_letter = get_column_letter(col[0].column)
    for cell in col:
        if cell.row >= 6 and cell.value:
            max_len = max(max_len, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = max(max_len + 6, 15)

# Save Excel File
excel_file_path = "سجل_حسابات_المنصة_الاعلامية.xlsx"
wb.save(excel_file_path)
print(f"Excel file created successfully: {excel_file_path}")
