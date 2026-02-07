import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

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

const getUserIdFromAuth = async (c: { req: { header: (name: string) => string | undefined }, env: { JWT_SECRET: string } }) => {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  if (!token) return null;
  try {
    const user = await verify(token, c.env.JWT_SECRET, "HS256");
    return (user as { id?: string }).id ?? null;
  } catch {
    return null;
  }
};

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
      }).$extends(withAccelerate()) as any

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
      }).$extends(withAccelerate()) as any

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

userRouter.get('/profile', async (c) => {
  const userId = await getUserIdFromAuth(c);
  if (!userId) {
    c.status(403);
    return c.json({ message: "You are not logged in" });
  }

  const prisma = new PrismaClient({
    accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
  }).$extends(withAccelerate()) as any

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      _count: { select: { posts: true } }
    }
  })

  if (!user) {
    c.status(404);
    return c.json({ message: "User not found" });
  }

  const likesReceived = await prisma.like.count({
    where: {
      post: { authorId: userId }
    }
  });

  return c.json({
    username: user.name ?? user.email,
    bio: user.bio ?? "",
    totalBlogs: user._count.posts,
    likesReceived
  });
})