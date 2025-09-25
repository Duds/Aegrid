import { logAuditEvent } from "@/lib/audit";
import { verifyMFAToken } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuditAction, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mfaToken: z.string().optional(),
});

// Build providers array conditionally based on environment variables
const providers = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      mfaToken: { label: "MFA Token", type: "text" },
    },
    async authorize(credentials) {
      try {
        const { email, password, mfaToken } = loginSchema.parse(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organisation: true },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        // Check MFA if enabled
        if (user.mfaEnabled) {
          if (!mfaToken) {
            // Return a special object to indicate MFA is required
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              organisationId: user.organisationId,
              organisation: user.organisation,
              mfaRequired: true,
            };
          }

          // Verify MFA token
          const isValidMFA = await verifyMFAToken(user.id, mfaToken);
          if (!isValidMFA) {
            return null;
          }
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organisationId: user.organisationId,
          organisation: user.organisation,
        };
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
  }),
];

// Add OAuth providers only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    })
  );
  console.log("Google OAuth provider configured");
} else {
  console.log("Google OAuth provider not configured - missing credentials");
}

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    })
  );
}

// Debug: Log available providers
if (process.env.NODE_ENV === "development") {
  console.log("Available OAuth providers:", providers.map(p => p.name));
}

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    async createUser(user) {
      // Check if user already exists (OAuth users might be created multiple times)
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { organisation: true }
      });

      if (existingUser) {
        return existingUser;
      }

      // For OAuth users, try to assign them to an existing organisation
      // based on their email domain or create them without organisation (for onboarding)
      let organisationId = null;

      if (user.email) {
        const domain = user.email.split('@')[1];

        // Special case: Assign dalerogers.com.au users to Greenfield Shire Council
        if (domain === 'dalerogers.com.au') {
          const greenfieldOrg = await prisma.organisation.findFirst({
            where: { name: 'Greenfield Shire Council' },
            select: { id: true }
          });

          if (greenfieldOrg) {
            organisationId = greenfieldOrg.id;
            console.log(`Assigning OAuth user ${user.email} to Greenfield Shire Council`);
          }
        } else {
          // Check if there's an existing user with the same domain
          const existingOrgUser = await prisma.user.findFirst({
            where: {
              email: { endsWith: `@${domain}` },
              organisationId: { not: null }
            },
            select: { organisationId: true }
          });

          if (existingOrgUser?.organisationId) {
            organisationId = existingOrgUser.organisationId;
            console.log(`Assigning OAuth user ${user.email} to existing organisation`);
          }
        }
      }

      return await prisma.user.create({
        data: {
          ...user,
          organisationId,
        }
      });
    }
  },
  providers,
  session: {
    strategy: "jwt",
  },
  debug: false, // Set to true only when debugging auth issues
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Handle OAuth account logging
      if (account) {
        console.log("OAuth account:", account.provider, account.type);
      }

      // Initial sign in - user data is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organisationId = user.organisationId;
        token.organisation = user.organisation;
        token.mfaRequired = (user as any).mfaRequired || false;
        token.image = user.image;
        token.name = user.name;
        token.email = user.email;
        return token;
      }

      // Token refresh - fetch fresh user data from database
      if (token.id && trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { organisation: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.organisationId = dbUser.organisationId;
            token.organisation = dbUser.organisation;
            token.mfaRequired = dbUser.mfaEnabled;
            token.image = dbUser.image;
            token.name = dbUser.name;
            token.email = dbUser.email;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organisationId = token.organisationId as string;
        session.user.organisation = token.organisation as { id: string; name: string };
        session.user.mfaRequired = token.mfaRequired as boolean;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (user?.id) {
        // Log successful login
        await logAuditEvent(
          AuditAction.USER_LOGIN,
          user.id,
          user.organisationId || undefined,
          {
            provider: account?.provider || "credentials",
            timestamp: new Date().toISOString(),
          }
        );

        // For OAuth providers, update user profile with latest data
        if (account?.provider && profile) {
          try {
            const updateData: any = {
              lastLoginAt: new Date(),
            };

            // Update name if provided and different
            if (profile.name && profile.name !== user.name) {
              updateData.name = profile.name;
            }

            // Update image/avatar if provided and different
            if (profile.picture && profile.picture !== user.image) {
              updateData.image = profile.picture;
            }

            // Only update if there are changes
            if (Object.keys(updateData).length > 1) {
              await prisma.user.update({
                where: { id: user.id },
                data: updateData,
              });

              console.log(`Updated ${account.provider} profile for user ${user.id}`);
            }
          } catch (error) {
            console.error("Error updating OAuth profile:", error);
            // Don't fail the sign-in if profile update fails
          }
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;

      // Default redirect - will be handled by middleware to check for onboarding
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        // Log logout
        await logAuditEvent(
          AuditAction.USER_LOGOUT,
          token.sub,
          token.organisationId as string || undefined,
          {
            timestamp: new Date().toISOString(),
          }
        );
      }
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
