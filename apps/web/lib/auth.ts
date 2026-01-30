import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
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
              id: user.user.id,
              name: user.user.email,
              email: user.user.email,
              role: user.user.role,
              tenantId: user.user.tenantId,
              jwt: user.access_token,
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
        token.jwt = user.jwt;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.jwt = token.jwt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
