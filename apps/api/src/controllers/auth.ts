import { RequestHandler } from "express";

export const signUp: RequestHandler = async (req, res) => {
  res.send("Sign up route");
};

export const signIn: RequestHandler = async (req, res) => {
  res.send("Sign in route");
};
