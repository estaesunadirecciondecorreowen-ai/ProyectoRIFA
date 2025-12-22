import type { NextAuthOptions } from "next-auth";
import type { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // OBLIGATORIO en producción
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
        // 1) Validación de credenciales
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        // 2) Trae SOLO lo necesario para construir un "User" válido
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            nombre: true, // si tu campo se llama distinto, cámbialo
            // passwordHash: true, // si tienes hash, aquí lo seleccionarías
          },
        });

        if (!dbUser) return null;

        // 3) Aquí debería ir la validación real del password (bcrypt)
        //    Ejemplo:
        //    const ok = await bcrypt.compare(password, dbUser.passwordHash);
        //    if (!ok) return null;

        // 4) Regresa un User con el shape de NextAuth (NO el objeto Prisma completo)
        const user: User = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.nombre ?? dbUser.email ?? "Usuario",
          image: null,
        };

        return user;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
};
