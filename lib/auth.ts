// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        // Devolver el objeto user
        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol, // <- aquí queda como "role"
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role; // ADMIN, USER, etc.
        // compat opcional
        (token as any).rol = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role;
        // compat opcional
        (session.user as any).rol = (token as any).role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
