import ast
from datetime import datetime

def parse_data_to_dict(data_string):
    # Your existing parsing function here
    try:
        return dict(ast.literal_eval(data_string))
    except Exception as e:
        print(f"Error parsing data: {e}")
        return {}
i765= "[('US Physical address', '1140 S WABASH AVE, Ste. Apt. Flr.709, CHICAGO, IL 60605-2311'),\n ('Full Legal Name', 'Shi Tianyu'),\n ('Place of Birth', 'Beijing, Beijing, Mainland China'),\n ('Date of Birth', '08/04/2000'),\n ('Form I-94 Arrival-Departure Record Number', '556990473A3'),\n ('Passport Number', 'EC9718548'),\n ('Passport Expiration Date', '04/10/2028'),\n ('SEVIS Number', '0033024501N')]"
i20= "[('SEVIS ID', 'N0033024501'),\n ('Name', 'Tianyu Shi'),\n ('Country of Birth', 'CHINA'),\n ('City of Birth', 'Beijing'),\n ('EMPLOYMENT AUTHORIZATIONS', 'POST-COMPLETION OPT FULL TIME REQUESTED 08 JULY 2024 07 JULY 2025'),\n ('OPT', True),\n ('DATE ISSUED', '27 March 2024')]"
passport= "[\n    (\"Name\", \"SHI, TIANYU\"),\n    (\"Country of Birth\", \"CHINA\"),\n    (\"Place of Birth\", \"BEIJING\"),\n    (\"Passport Expiration Date\", \"10 APR 2028\"),\n    (\"Passport Number\", \"EC97185488\"),\n    (\"Date of Birth\", \"04 AUG 2000\")\n]"
i94= "[('Admission (I-94) Record Number', '556990473A3'),\n ('Most Recent Date of Entry', '2024 April 08'),\n ('Class of Admission', 'F1'),\n ('Admit Until Date', 'D/S'),\n ('Last/Surname', 'SHI'),\n ('First (Given) Name', 'TIANYU'),\n ('Birth Date', '2000 August 04'),\n ('Document Number', 'EC9718548'),\n ('Country of Citizenship', 'China')]"
# Parse each piece of data
i765 = parse_data_to_dict(i765)
i20 = parse_data_to_dict(i20)
passport = parse_data_to_dict(passport)
i94 = parse_data_to_dict(i94)

results = {}

# 1. Name Check 
name_i765 = i765.get('Full Legal Name', '').strip().lower()
name_i20 = passport.get('Name', '').strip().replace(",","").lower()
results['Name Check'] = name_i765 == name_i20

# 2. Place of Birth Check
place_of_birth_i765 = i765.get('Place of Birth', '').strip()
place_of_birth_passport = passport.get('Place of Birth', '').strip()
print(place_of_birth_i765)
print(place_of_birth_passport)
res = True if place_of_birth_passport.lower() in place_of_birth_i765.lower() else False 
results['Place of Birth Check'] = res

# # 3. Passport number and expiration date check
# results['Passport Number Match'] = i765.get('Passport Number', '').strip() == passport.get('Passport Number', '').strip()
# results['Passport Expiration Date Match'] = i765.get('Passport Expiration Date', '').strip() == passport.get('Passport Expiration Date', '').strip()

# # 4. I-94 Checks
# results['I-94 Number Match'] = i765.get('Form I-94 Arrival-Departure Record Number', '').strip() == i94.get('Admission (I-94) Record Number', '').strip()
# results['Admit Until Date Check'] = i94.get('Admit Until Date', '').strip() == 'D/S'
# results['Class of Admission Check'] = i94.get('Class of Admission', '').strip() == 'F1'
# entry_date_i94 = datetime.strptime(i94.get('Most Recent Date of Entry', '1900 January 01'), '%Y %B %d')
# results['Entry Date Valid'] = entry_date_i94 <= datetime.now()

# # 5. SEVIS Number Match and OPT Checks
# results['SEVIS Number Match'] = i765.get('SEVIS Number', '').strip() == i20.get('SEVIS ID', '').strip()
# travel_endorsement_date = datetime.strptime(i20.get('DATE ISSUED', '1900 January 01'), '%d %B %Y')
# results['Travel Endorsement Within 30 Days'] = (datetime.now() - travel_endorsement_date).days <= 30
# results['OPT is True'] = i20.get('OPT', False)  

# Prepare the final response
response = {
    "validation_results": results,
    #"US Physical Address": i765.get("US Physical address", "Not available"),
    #"Full Legal Name": name_i765.title()  # Convert back to title case for display
}

# Output results
print("Response:", response)

