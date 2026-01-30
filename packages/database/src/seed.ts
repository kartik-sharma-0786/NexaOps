import "dotenv/config";
import { db } from "./index";
import { tenantMembers, tenants, users } from "./schema";

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
      name: "Alice Admin",
      email: "alice@acme.com",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$SECRET_HASH_PLACEHOLDER",
    })
    .returning();

  // 3. Link User to Tenant
  await db.insert(tenantMembers).values({
    tenantId: tenant.id,
    userId: admin.id,
    role: "ADMIN",
  });

  console.log(`✅ Created User: ${admin.email} (ADMIN)`);
  console.log("🌱 Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
