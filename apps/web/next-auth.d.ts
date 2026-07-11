import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      tenantId?: string;
      tenantName?: string | null;
      jwt?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    tenantId?: string;
    tenantName?: string | null;
    jwt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    tenantId?: string;
    tenantName?: string | null;
    jwt?: string;
  }
}
