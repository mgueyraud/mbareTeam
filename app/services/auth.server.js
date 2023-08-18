// file: app/services/auth.server.js

import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";

// Create an instance of the authenticator
// It will take session storage as an input parameter and creates the user session on successful authentication
export const authenticator = new Authenticator(sessionStorage);


// callback function that will be invoked upon successful authentication from social provider
  async function handleSocialAuthCallback({ profile }) {
    // create user in your db here
    // profile object contains all the user data like image, displayName, id
    console.log(profile);
    return profile;
  }
  
  // Configuring Google Strategy
  authenticator.use(new GoogleStrategy({
      clientID: "418956511863-sii4c4ufisod8e2ofd96iq4gqv9aomcr.apps.googleusercontent.com",
      clientSecret: "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",
      scope: "",
      callbackURL: `http://localhost:3000/auth/${SocialsProvider.GOOGLE}/callback`,
    },
    handleSocialAuthCallback
  ));