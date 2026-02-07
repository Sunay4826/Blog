import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "sunay-common";

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
    const parsed = createBlogInput.safeParse(body);
    if (!parsed.success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const data = parsed.data;

    const authorId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    const blog = await prisma.post.create({
        data: {
            title: data.title,
            content: data.content,
            authorId,
            tags: data.tags ?? []
        }
    })

    return c.json({
        id: blog.id
    })
})

blogRouter.put('/:id', async (c) => {
    const body = await c.req.json();
    const id = c.req.param("id");
    const parsed = updateBlogInput.safeParse({ ...body, id });
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

    const authorId = c.get("userId");
    const blog = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
    });
    if (!blog || blog.authorId !== authorId) {
        c.status(403);
        return c.json({ message: "Not allowed" });
    }

    const updateData: Record<string, unknown> = {
        title: data.title,
        content: data.content,
        published: body.published
    };
    if (data.tags) {
        updateData.tags = data.tags;
    }

    const updated = await prisma.post.update({
        where: { id },
        data: updateData
    })

    return c.json({
        id: updated.id
    })
})

blogRouter.delete('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    const authorId = c.get("userId");
    const blog = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
    });
    if (!blog || blog.authorId !== authorId) {
        c.status(403);
        return c.json({ message: "Not allowed" });
    }

    await prisma.post.delete({ where: { id } });

    return c.json({ id });
})

// Todo: add pagination
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any
    const userId = c.get("userId");
    const search = c.req.query("search")?.trim();
    const author = c.req.query("author")?.trim();
    const tagsRaw = c.req.query("tags")?.trim();
    const sort = c.req.query("sort")?.trim();
    const tags = tagsRaw
        ? tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

    const where: Record<string, unknown> = {};
    if (search) {
        where.title = { contains: search, mode: "insensitive" };
    }
    if (author) {
        where.author = { name: { contains: author, mode: "insensitive" } };
    }
    if (tags.length) {
        where.tags = { hasSome: tags };
    }

    const blogs = await prisma.post.findMany({
        where,
        orderBy:
            sort === "popular"
                ? { likes: { _count: "desc" } }
                : { createdAt: "desc" },
        select: {
            content: true,
            title: true,
            id: true,
            authorId: true,
            createdAt: true,
            tags: true,
            author: {
                select: {
                    name: true
                }
            },
            likes: {
                where: { userId },
                select: { id: true }
            },
            bookmarks: {
                where: { userId },
                select: { id: true }
            },
            _count: {
                select: { likes: true, bookmarks: true }
            }
        }
    }) as any[];

    return c.json({
        blogs: blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            authorId: blog.authorId,
            createdAt: blog.createdAt,
            tags: blog.tags,
            author: blog.author,
            likesCount: blog._count.likes,
            likedByMe: blog.likes.length > 0,
            bookmarksCount: blog._count.bookmarks,
            bookmarkedByMe: blog.bookmarks.length > 0
        }))
    })
})

blogRouter.get('/my', async (c) => {
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any
    const authorId = c.get("userId");
    const blogs = await prisma.post.findMany({
        where: { authorId },
        orderBy: { createdAt: "desc" },
        select: {
            content: true,
            title: true,
            id: true,
            authorId: true,
            createdAt: true,
            tags: true,
            author: {
                select: {
                    name: true
                }
            },
            likes: {
                where: { userId: authorId },
                select: { id: true }
            },
            bookmarks: {
                where: { userId: authorId },
                select: { id: true }
            },
            _count: {
                select: { likes: true, bookmarks: true }
            }
        }
    }) as any[];

    return c.json({
        blogs: blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            authorId: blog.authorId,
            createdAt: blog.createdAt,
            tags: blog.tags,
            author: blog.author,
            likesCount: blog._count.likes,
            likedByMe: blog.likes.length > 0,
            bookmarksCount: blog._count.bookmarks,
            bookmarkedByMe: blog.bookmarks.length > 0
        }))
    });
})

blogRouter.get('/saved', async (c) => {
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any
    const userId = c.get("userId");

    const blogs = await prisma.post.findMany({
        where: {
            bookmarks: { some: { userId } }
        },
        orderBy: { createdAt: "desc" },
        select: {
            content: true,
            title: true,
            id: true,
            authorId: true,
            createdAt: true,
            tags: true,
            author: {
                select: {
                    name: true
                }
            },
            likes: {
                where: { userId },
                select: { id: true }
            },
            bookmarks: {
                where: { userId },
                select: { id: true }
            },
            _count: {
                select: { likes: true, bookmarks: true }
            }
        }
    }) as any[];

    return c.json({
        blogs: blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            authorId: blog.authorId,
            createdAt: blog.createdAt,
            tags: blog.tags,
            author: blog.author,
            likesCount: blog._count.likes,
            likedByMe: blog.likes.length > 0,
            bookmarksCount: blog._count.bookmarks,
            bookmarkedByMe: blog.bookmarks.length > 0
        }))
    });
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    try {
        const userId = c.get("userId");
        const blog = await prisma.post.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                content: true,
                authorId: true,
                createdAt: true,
                tags: true,
                author: {
                    select: {
                        name: true
                    }
                },
                likes: {
                    where: { userId },
                    select: { id: true }
                },
                bookmarks: {
                    where: { userId },
                    select: { id: true }
                },
                _count: {
                    select: { likes: true, bookmarks: true }
                }
            }
        })
    
        return c.json({
            blog: blog
                ? {
                    id: blog.id,
                    title: blog.title,
                    content: blog.content,
                    authorId: blog.authorId,
                    createdAt: blog.createdAt,
                    tags: blog.tags,
                    author: blog.author,
                    likesCount: blog._count.likes,
                    likedByMe: blog.likes.length > 0,
                    bookmarksCount: blog._count.bookmarks,
                    bookmarkedByMe: blog.bookmarks.length > 0
                }
                : null
        });
    } catch(e) {
        c.status(411); // 4
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})

blogRouter.get('/:id/comments', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    const comments = await prisma.comment.findMany({
        where: { postId: id },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
                select: { name: true }
            }
        }
    });

    return c.json({ comments });
})

blogRouter.post('/:id/like', async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    await prisma.like.upsert({
        where: {
            userId_postId: { userId, postId }
        },
        update: {},
        create: { userId, postId }
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    return c.json({ likesCount, likedByMe: true });
})

blogRouter.delete('/:id/like', async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    await prisma.like.deleteMany({
        where: { userId, postId }
    });

    const likesCount = await prisma.like.count({ where: { postId } });

    return c.json({ likesCount, likedByMe: false });
})

blogRouter.post('/:id/bookmark', async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    await prisma.bookmark.upsert({
        where: {
            userId_postId: { userId, postId }
        },
        update: {},
        create: { userId, postId }
    });

    const bookmarksCount = await prisma.bookmark.count({ where: { postId } });

    return c.json({ bookmarksCount, bookmarkedByMe: true });
})

blogRouter.delete('/:id/bookmark', async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate()) as any

    await prisma.bookmark.deleteMany({
        where: { userId, postId }
    });

    const bookmarksCount = await prisma.bookmark.count({ where: { postId } });

    return c.json({ bookmarksCount, bookmarkedByMe: false });
})

blogRouter.post('/:id/comments', async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    if (!body || typeof body.content !== "string" || body.content.trim().length === 0) {
        c.status(411);
        return c.json({ message: "Inputs not correct" });
    }

    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())
    const userId = c.get("userId");

    const comment = await prisma.comment.create({
        data: {
            content: body.content,
            userId,
            postId: id
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { name: true } }
        }
    });

    return c.json({ comment });
})

blogRouter.delete('/comments/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.PRISMA_ACCELERATE_URL,
    }).$extends(withAccelerate())
    const userId = c.get("userId");

    const comment = await prisma.comment.findUnique({
        where: { id },
        select: { userId: true }
    });
    if (!comment || comment.userId !== userId) {
        c.status(403);
        return c.json({ message: "Not allowed" });
    }

    await prisma.comment.delete({ where: { id } });
    return c.json({ id });
})
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg4M2QyODQ3LTg1ZWItNDljMy04NWE4LWMxYWQzNzJiZTM1OCJ9.ECYErFXtT5McPl4Dkbx58wHnnFpMV7PdRRKEvzWsaHA