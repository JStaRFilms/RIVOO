# RIVOO Seeded Users Documentation

This document contains all the user accounts that have been seeded into the RIVOO database for testing and development purposes.

## Overview

The database has been populated with sample data including:
- 1 Hospital (City General Hospital)
- 4 Hospital Staff Accounts
- 3 Regular User Accounts
- 2 Medical Profiles
- 3 Sample Incidents

---

## 🏥 Hospital Information

**City General Hospital**
- **Address:** 123 Medical Center Drive, Springfield, IL 62701
- **Phone:** (555) 123-4567
- **Email:** info@citygeneral.com
- **Website:** https://citygeneral.com
- **Location:** 39.7817°N, 89.6501°W

---

## 👨‍⚕️ Hospital Staff Accounts

These accounts are used to log into the hospital portal at `/hospital/login`.

### 1. Hospital Administrator
- **Staff ID:** HOSP-00001
- **Password:** hospital123
- **Name:** Dr. Sarah Johnson
- **Email:** admin@citygeneral.com
- **Role:** ADMIN
- **Department:** Administration
- **Position:** Chief of Staff

### 2. Emergency Physician
- **Staff ID:** HOSP-00002
- **Password:** hospital123
- **Name:** Dr. Michael Smith
- **Email:** dr.smith@citygeneral.com
- **Role:** DOCTOR
- **Department:** Emergency Medicine
- **Position:** ER Physician

### 3. ER Nurse
- **Staff ID:** HOSP-00003
- **Password:** hospital123
- **Name:** Nurse Emily Davis
- **Email:** nurse.davis@citygeneral.com
- **Role:** NURSE
- **Department:** Emergency Department
- **Position:** ER Nurse

### 4. Medical Assistant
- **Staff ID:** HOSP-00004
- **Password:** hospital123
- **Name:** John Wilson
- **Email:** staff.wilson@citygeneral.com
- **Role:** STAFF
- **Department:** Emergency Department
- **Position:** Medical Assistant

---

## 👥 Regular User Accounts

These accounts are used to log into the user portal at `/auth/signin`.

### 1. John Doe
- **Email:** john.doe@email.com
- **Password:** password123
- **Name:** John Doe
- **Role:** USER
- **Medical Profile:** Yes
  - **Date of Birth:** March 15, 1985
  - **Blood Type:** O+
  - **Allergies:** Penicillin
  - **Medications:** Lisinopril 10mg daily
  - **Emergency Contact:** Mary Doe - (555) 987-6543

### 2. Jane Smith
- **Email:** jane.smith@email.com
- **Password:** password123
- **Name:** Jane Smith
- **Role:** USER
- **Medical Profile:** Yes
  - **Date of Birth:** July 22, 1990
  - **Blood Type:** A-
  - **Allergies:** None
  - **Medications:** None
  - **Emergency Contact:** Robert Smith - (555) 456-7890

### 3. Mike Johnson
- **Email:** mike.johnson@email.com
- **Password:** password123
- **Name:** Mike Johnson
- **Role:** USER
- **Medical Profile:** No

---

## 🚨 Sample Incidents

The following incidents have been created for testing:

### 1. Resolved Incident (John Doe)
- **Status:** RESOLVED
- **Priority:** HIGH
- **Location:** 456 Oak Street, Springfield, IL
- **Description:** Chest pain and difficulty breathing
- **Notes:** Patient stabilized and discharged after treatment
- **Timeline:** Accepted 2 hours ago, Resolved 30 minutes ago

### 2. Assigned Critical Incident (Jane Smith)
- **Status:** ASSIGNED
- **Priority:** CRITICAL
- **Location:** 789 Pine Avenue, Springfield, IL
- **Description:** Severe allergic reaction - difficulty breathing
- **Notes:** Ambulance dispatched, patient conscious but distressed
- **Assigned To:** Dr. Michael Smith (HOSP-00002)
- **Timeline:** Accepted 15 minutes ago

### 3. Pending Incident (Mike Johnson)
- **Status:** PENDING
- **Priority:** MEDIUM
- **Location:** 321 Elm Drive, Springfield, IL
- **Description:** Possible broken arm after fall
- **Notes:** Awaiting triage assessment

---

## 🔐 Quick Login Reference

### Hospital Portal (`/hospital/login`)
```
HOSP-00001 / hospital123  (Admin)
HOSP-00002 / hospital123  (Doctor)
HOSP-00003 / hospital123  (Nurse)
HOSP-00004 / hospital123  (Staff)
```

### User Portal (`/auth/signin`)
```
john.doe@email.com     / password123
jane.smith@email.com   / password123
mike.johnson@email.com / password123
```

---

## 🛠️ Development Notes

- **Database:** SQLite (file: `./prisma/dev.db`)
- **Seeding Script:** `prisma/seed.ts`
- **Run Seeding:** `npm run db:seed`
- **Prisma Studio:** `npx prisma studio` (http://localhost:5555)
- **Development Server:** `npm run dev` (http://localhost:3000)

### Password Hashing
All passwords are hashed using bcrypt with 10 salt rounds for security.

### Data Relationships
- Users can have Medical Profiles
- Hospital Staff are linked via FacilityUser records
- Incidents can be assigned to FacilityUsers
- Incidents are created by Users and can be handled by Facilities

---

## 📞 Support

For questions about the seeded data or application functionality, refer to:
- `docs/Project_Requirements.md` - Project overview
- `docs/Coding_Guidelines.md` - Development standards
- `docs/Styling-in-Next-and-Tailwind-v4.md` - Styling guide

---

*This document was auto-generated during database seeding. Last updated: November 3, 2025*
