import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

type CreateBlogInput = {
    title: string;
    content: string;
};

type UpdateBlogInput = {
    id: string;
    title?: string;
    content?: string;
    published?: boolean;
};

const isCreateBlogInput = (body: unknown): body is CreateBlogInput => {
    if (!body || typeof body !== "object") {
        return false;
    }
    const data = body as { title?: unknown; content?: unknown };
    return typeof data.title === "string" && typeof data.content === "string";
};

const isUpdateBlogInput = (body: unknown): body is UpdateBlogInput => {
    if (!body || typeof body !== "object") {
        return false;
    }
    const data = body as {
        id?: unknown;
        title?: unknown;
        content?: unknown;
        published?: unknown;
    };
    return (
        typeof data.id === "string" &&
        (data.title === undefined || typeof data.title === "string") &&
        (data.content === undefined || typeof data.content === "string") &&
        (data.published === undefined || typeof data.published === "boolean")
    );
};

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
        PRISMA_ACCELERATE_URL: string;
    }, 
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;
    if (!token) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        });
    }
    try {
        const user = await verify(token, c.env.JWT_SECRET, "HS256");
        const userId = (user as { id?: string }).id;
        if (userId) {
            c.set("userId", userId);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    if (!isCreateBlogInput(body)) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId
        }
    })

    return c.json({
        id: blog.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    if (!isUpdateBlogInput(body)) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.post.update({
        where: {
            id: body.id
        }, 
        data: {
            title: body.title,
            content: body.content
        }
    })

    return c.json({
        id: blog.id
    })
})

// Todo: add pagination
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.post.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
    
        return c.json({
            blog
        });
    } catch(e) {
        c.status(411); // 4
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg4M2QyODQ3LTg1ZWItNDljMy04NWE4LWMxYWQzNzJiZTM1OCJ9.ECYErFXtT5McPl4Dkbx58wHnnFpMV7PdRRKEvzWsaHA