export interface Post {
    id: number;
    authorId: number;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreatePostRequest {
    title: string;
    content: string;
    category: string;
  }
  
  export interface UpdatePostRequest {
    title?: string;
    content?: string;
    category?: string;
  }
  
  export interface PostsResponse {
    success: boolean;
    data: Post[];
  }
  
  export interface SinglePostResponse {
    success: boolean;
    data: Post;
  }
  
