import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "@/app/components/hooks/verifyToken/verifyGoogleToken";
import { loginWithGoogle } from "@/libs/firebase/service";

export const authOption: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account?.provider === "google") {
        await verifyGoogleToken(account.access_token);
        const data = {
          email: profile.email,
          name: profile.name,
          type: "GOOGLE",
        };
        const result = await loginWithGoogle(data);
        if (result.status && result.user) {
          token.id = result.user.id;
          token.email = result.user.email;
          token.role = result.user.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if ("id" in token) {
        session.user.id = token.id;
      }
      if ("email" in token) {
        session.user.email = token.email;
      }
      if ("name" in token) {
        session.user.name = token.name;
      }
      if ("role" in token) {
        session.user.role = token.role;
      }
      const accessToken = jwt.sign(token, process.env.NEXTAUTH_SECRET!, {
        algorithm: "HS256",
      });
      session.accessToken = accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
