import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // Corrected import path
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        staffId: { label: "Staff ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error("Password is required");
        }

        let user;

        // Check if it's a hospital staff login (staffId provided)
        if (credentials.staffId) {
          if (!credentials.staffId.match(/^HOSP-\d{5}$/)) {
            throw new Error("Invalid Staff ID format");
          }

          // Find user by staffId through FacilityUser relation
          const facilityUser = await prisma.facilityUser.findUnique({
            where: { staffId: credentials.staffId },
            include: { user: true },
          });

          if (facilityUser) {
            user = facilityUser.user;
          }
        } else if (credentials.email) {
          // Regular user login
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        }

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  }

  interface User {
    // @ts-ignore
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // @ts-ignore
    role?: string;
  }
}