// file: app/services/auth.server.js

import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { GoogleStrategy, SocialsProvider, type GoogleProfile } from "remix-auth-socials";
import { prisma } from "~/utils/db.server";

// Create an instance of the authenticator
// It will take session storage as an input parameter and creates the user session on successful authentication
export const authenticator = new Authenticator(sessionStorage);

// callback function that will be invoked upon successful authentication from social provider
  async function handleSocialAuthCallback({ profile }:{ profile: GoogleProfile }) {
    const userExisted = await prisma.user.findUnique({
      where: {
        googleId: profile.id
      }
    });

    if(userExisted) return userExisted;


    const user = await prisma.user.create({
      data: {
        googleId: profile.id,
        name: profile.name.familyName,
        email: profile.emails[0].value,
        picture: profile._json.picture
      }
    })

    return user;
  }
  
  // Configuring Google Strategy
  authenticator.use(new GoogleStrategy({
      clientID: "418956511863-sii4c4ufisod8e2ofd96iq4gqv9aomcr.apps.googleusercontent.com",
      clientSecret: "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",
      scope: "",
      callbackURL: `/auth/${SocialsProvider.GOOGLE}/callback`,
    },
    handleSocialAuthCallback
  ));