import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

type SignupInput = {
  email: string;
  password: string;
  name?: string;
};

type SigninInput = {
  email: string;
  password: string;
};

const isSignupInput = (body: unknown): body is SignupInput => {
  if (!body || typeof body !== "object") {
    return false;
  }
  const data = body as { email?: unknown; password?: unknown; name?: unknown };
  return (
    typeof data.email === "string" &&
    typeof data.password === "string" &&
    (data.name === undefined || typeof data.name === "string")
  );
};

const isSigninInput = (body: unknown): body is SigninInput => {
  if (!body || typeof body !== "object") {
    return false;
  }
  const data = body as { email?: unknown; password?: unknown };
  return typeof data.email === "string" && typeof data.password === "string";
};

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
        PRISMA_ACCELERATE_URL: string;
    }
}>();

userRouter.post('/signup', async (c) => {
    try {
      const body = await c.req.json();
      if (!isSignupInput(body)) {
          c.status(411);
          return c.json({
              message: "Inputs not correct"
          })
      }
      const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
      }).$extends(withAccelerate())

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name
        }
      })
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
  
      return c.text(jwt)
    } catch(e) {
      console.log(e);
      c.status(411);
      return c.text('Invalid')
    }
  })
  
  
  userRouter.post('/signin', async (c) => {
    try {
      const body = await c.req.json();
      if (!isSigninInput(body)) {
          c.status(411);
          return c.json({
              message: "Inputs not correct"
          })
      }

      const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
      }).$extends(withAccelerate())

      const user = await prisma.user.findFirst({
        where: {
          email: body.email,
          password: body.password,
        }
      })
      if (!user) {
        c.status(403);
        return c.json({
          message: "Incorrect creds"
        })
      }
      const jwt = await sign({
        id: user.id
      }, c.env.JWT_SECRET);
  
      return c.text(jwt)
    } catch(e) {
      console.log(e);
      c.status(411);
      return c.text('Invalid')
    }
  })