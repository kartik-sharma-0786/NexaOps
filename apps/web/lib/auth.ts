import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  tenantId: string;
  jwt: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Call NestJS Backend
          const res = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const user = await res.json();

          if (res.ok && user && user.access_token) {
            // Return user object including the token to be saved in session
            return {
              id: String(user.user.id),
              name: user.user.email ?? null,
              email: user.user.email ?? null,
              role: String(user.user.role),
              tenantId: String(user.user.tenantId),
              jwt: String(user.access_token),
            };
          }
          return null;
        } catch (e) {
          console.error("Auth error", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.jwt = u.jwt;
        token.role = u.role;
        token.tenantId = u.tenantId;
        token.id = u.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as {
          id?: string;
          role?: string;
          tenantId?: string;
          jwt?: string;
        };
        session.user.id = t.id ?? "";
        session.user.role = t.role ?? "";
        session.user.tenantId = t.tenantId ?? "";
        session.user.jwt = t.jwt ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
