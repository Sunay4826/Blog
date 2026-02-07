import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, signinInput, updateProfileInput } from "sunay-common";

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
      const parsed = signupInput.safeParse(body);
      if (!parsed.success) {
          c.status(411);
          return c.json({
              message: "Inputs not correct"
          })
      }
      const data = parsed.data;
      const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
      }).$extends(withAccelerate()) as any

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          name: data.name
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
      const parsed = signinInput.safeParse(body);
      if (!parsed.success) {
          c.status(411);
          return c.json({
              message: "Inputs not correct"
          })
      }
      const data = parsed.data;

      const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
      }).$extends(withAccelerate()) as any

      const user = await prisma.user.findFirst({
        where: {
          email: data.email,
          password: data.password,
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

userRouter.put('/profile', async (c) => {
  const userId = await getUserIdFromAuth(c);
  if (!userId) {
    c.status(403);
    return c.json({ message: "You are not logged in" });
  }

  const body = await c.req.json();
  const parsed = updateProfileInput.safeParse(body);
  if (!parsed.success) {
    c.status(411);
    return c.json({ message: "Name is required" });
  }
  const name = parsed.data.name.trim();

  const prisma = new PrismaClient({
    accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
  }).$extends(withAccelerate()) as any

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name }
  })

  return c.json({ username: updated.name ?? "" });
})