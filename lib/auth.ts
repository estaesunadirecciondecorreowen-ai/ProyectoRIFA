import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        // IMPORTANTÍSIMO: USA await (NO return directo de prisma.user.findUnique)
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            nombre: true, // si tu campo no se llama "nombre", cámbialo por el real
            // passwordHash: true, // si tienes hash, aquí lo usarías
          },
        });

        if (!dbUser) return null;

        // Aquí debería ir la validación real del password (bcrypt)
        // if (!ok) return null;

        // Regresa un objeto tipo "User" de NextAuth (solo campos válidos)
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.nombre ?? dbUser.email ?? "Usuario",
          image: null,
        };
      },
    }),
  ],
};
