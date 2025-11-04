/*
  Warnings:

  - Added the required column `staff_id` to the `facility_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medical_profiles" ADD COLUMN "emergency_contacts" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_facility_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facility_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "department" TEXT,
    "position" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "facility_users_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "facility_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_facility_users" ("created_at", "department", "facility_id", "id", "is_active", "position", "role", "updated_at", "user_id") SELECT "created_at", "department", "facility_id", "id", "is_active", "position", "role", "updated_at", "user_id" FROM "facility_users";
DROP TABLE "facility_users";
ALTER TABLE "new_facility_users" RENAME TO "facility_users";
CREATE UNIQUE INDEX "facility_users_user_id_key" ON "facility_users"("user_id");
CREATE UNIQUE INDEX "facility_users_staff_id_key" ON "facility_users"("staff_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
