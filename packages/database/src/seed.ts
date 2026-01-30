import "dotenv/config";
import { db } from "./index";
import { tenants, users } from "./schema";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a Tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Acme Corp",
      slug: "acme",
    })
    .returning();

  console.log(`✅ Created Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Create an Admin User
  // Note: In real app, password should be hashed. Using "secret" for dev.
  const [admin] = await db
    .insert(users)
    .values({
      tenantId: tenant.id,
      name: "Alice Admin",
      email: "alice@acme.com",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$SECRET_HASH_PLACEHOLDER",
      role: "ADMIN",
    })
    .returning();

  console.log(`✅ Created User: ${admin.email} (${admin.role})`);

  console.log("🌱 Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
