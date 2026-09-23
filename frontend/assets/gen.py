code = ""
for i in range(1, 2001):
    block = f'''
def santex_{i}(ism,fam,yosh):
    print(f"{ism} {fam} {yosh} yoshda")

santex_{i}("ali_{i}","vaxobov_{i}",34)

# funksiya chaqirib {i}

def santexnik_ism_{i}(ism):
    print(ism)

santexnik_ism_{i}("ali_{i}")

def santexnik_fam_{i}(fam):
    print(fam)

santexnik_fam_{i}("vaxobov_{i}")

def santexnik_yosh_{i}(yosh):
    print(yosh)

santexnik_yosh_{i}({34 + i % 50})

def santexnik_{i}(ism,fam,yosh):
    print(f"{ism} {fam} {yosh} yoshda")

santexnik_{i}("ali_{i}","vaxobov_{i}",34)

def santexnik_id_{i}(number,passport_id):
    print(f"sizning raqamingiz:{number},sizning passport IDingiz:{passport_id}")

santexnik_id_{i}("+998901234567", 1234567890 + {i})
'''
    code += block

with open(r"c:\Users\user\Documents\GitHub\Santexnik.uz_web-site\frontend\assets\py.py", "w", encoding="utf-8") as f:
    f.write(code.replace("{ism}", "{ism}").replace("{fam}", "{fam}").replace("{yosh}", "{yosh}").replace("{number}", "{number}").replace("{passport_id}", "{passport_id}"))

