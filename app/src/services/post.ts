import { request } from "./request";

export interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  content?: string;
  published?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
}

export async function getPosts(): Promise<Post[]> {
  const res = await request.get<Post[]>("/api/posts");
  return res.data;
}

export async function getPost(id: number): Promise<Post> {
  const res = await request.get<Post>(`/api/posts/${id}`);
  return res.data;
}

export async function createPost(data: CreatePostInput): Promise<Post> {
  const res = await request.post<Post>("/api/posts", data);
  return res.data;
}

export async function updatePost(id: number, data: UpdatePostInput): Promise<Post> {
  const res = await request.put<Post>(`/api/posts/${id}`, data);
  return res.data;
}

export async function deletePost(id: number): Promise<void> {
  await request.delete(`/api/posts/${id}`);
}
