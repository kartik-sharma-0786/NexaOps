import "dotenv/config";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { tenantMembers, tenants, users } from "./schema";

const SEED_PASSWORD = "secret";

async function main() {
  console.log("🌱 Seeding database...");

  const existing = await db.query.users.findFirst({
    where: eq(users.email, "alice@acme.com"),
  });
  if (existing) {
    console.log("⏭️  Seed data already exists (alice@acme.com). Skipping.");
    process.exit(0);
  }

  const passwordHash = await argon2.hash(SEED_PASSWORD);

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Acme Corp",
      slug: "acme",
    })
    .returning();

  console.log(`✅ Created Tenant: ${tenant.name} (${tenant.id})`);

  const [admin] = await db
    .insert(users)
    .values({
      name: "Alice Admin",
      email: "alice@acme.com",
      passwordHash,
    })
    .returning();

  await db.insert(tenantMembers).values({
    tenantId: tenant.id,
    userId: admin.id,
    role: "ADMIN",
  });

  console.log(`✅ Created User: ${admin.email} (ADMIN)`);
  console.log(`🔑 Login with password: ${SEED_PASSWORD}`);
  console.log("🌱 Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
