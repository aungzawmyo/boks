import type {
  AuthTokensDto,
  AuthorDto,
  BookDetailDto,
  BookListItemDto,
  CategoryDto,
  DashboardStatsDto,
  PaginatedResponse,
  PublisherDto,
  UserDto,
} from '@boks/shared-types';
import type {
  BookSearchInput,
  CreateBookInput,
  LoginInput,
  RegisterInput,
  UpdateBookInput,
} from '@boks/validation';

export type TokenGetter = () => string | null | Promise<string | null>;

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: TokenGetter;
}

async function request<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = options.getAccessToken
    ? await options.getAccessToken()
    : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function createApiClient(options: ApiClientOptions) {
  return {
    health: () => request<{ status: string }>(options, '/health'),

    auth: {
      register: (body: RegisterInput) =>
        request<AuthTokensDto>(options, '/auth/register', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      login: (body: LoginInput) =>
        request<AuthTokensDto>(options, '/auth/login', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      refresh: (refreshToken: string) =>
        request<AuthTokensDto>(options, '/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }),
      forgotPassword: (email: string) =>
        request<{ message: string; resetToken?: string }>(
          options,
          '/auth/forgot-password',
          { method: 'POST', body: JSON.stringify({ email }) },
        ),
      resetPassword: (token: string, password: string) =>
        request<{ message: string }>(options, '/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password }),
        }),
      me: () => request<UserDto>(options, '/auth/me'),
    },

    books: {
      list: (params: Partial<BookSearchInput> = {}) =>
        request<PaginatedResponse<BookListItemDto>>(
          options,
          `/books${toQuery(params)}`,
        ),
      get: (idOrSlug: string) =>
        request<BookDetailDto>(options, `/books/${encodeURIComponent(idOrSlug)}`),
    },

    authors: {
      list: () => request<AuthorDto[]>(options, '/authors'),
      get: (id: string) => request<AuthorDto>(options, `/authors/${id}`),
    },

    categories: {
      list: () => request<CategoryDto[]>(options, '/categories'),
    },

    publishers: {
      list: () => request<PublisherDto[]>(options, '/publishers'),
    },

    admin: {
      dashboard: () =>
        request<DashboardStatsDto>(options, '/admin/dashboard'),
      books: {
        list: (params: Partial<BookSearchInput> = {}) =>
          request<PaginatedResponse<BookListItemDto>>(
            options,
            `/admin/books${toQuery(params)}`,
          ),
        get: (id: string) =>
          request<BookDetailDto>(options, `/admin/books/${id}`),
        create: (body: CreateBookInput) =>
          request<BookDetailDto>(options, '/admin/books', {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        update: (id: string, body: UpdateBookInput) =>
          request<BookDetailDto>(options, `/admin/books/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          }),
        remove: (id: string) =>
          request<void>(options, `/admin/books/${id}`, { method: 'DELETE' }),
      },
      authors: {
        list: () => request<AuthorDto[]>(options, '/admin/authors'),
        create: (body: { name: string; slug?: string; bio?: string | null }) =>
          request<AuthorDto>(options, '/admin/authors', {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        update: (
          id: string,
          body: Partial<{ name: string; slug: string; bio: string | null }>,
        ) =>
          request<AuthorDto>(options, `/admin/authors/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          }),
        remove: (id: string) =>
          request<void>(options, `/admin/authors/${id}`, { method: 'DELETE' }),
      },
      categories: {
        list: () => request<CategoryDto[]>(options, '/admin/categories'),
        create: (body: {
          name: string;
          slug?: string;
          description?: string | null;
        }) =>
          request<CategoryDto>(options, '/admin/categories', {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        update: (
          id: string,
          body: Partial<{
            name: string;
            slug: string;
            description: string | null;
          }>,
        ) =>
          request<CategoryDto>(options, `/admin/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          }),
        remove: (id: string) =>
          request<void>(options, `/admin/categories/${id}`, {
            method: 'DELETE',
          }),
      },
      publishers: {
        list: () => request<PublisherDto[]>(options, '/admin/publishers'),
        create: (body: { name: string; slug?: string }) =>
          request<PublisherDto>(options, '/admin/publishers', {
            method: 'POST',
            body: JSON.stringify(body),
          }),
        update: (id: string, body: Partial<{ name: string; slug: string }>) =>
          request<PublisherDto>(options, `/admin/publishers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          }),
        remove: (id: string) =>
          request<void>(options, `/admin/publishers/${id}`, {
            method: 'DELETE',
          }),
      },
      uploadCover: async (file: Blob, filename: string) => {
        const form = new FormData();
        form.append('file', file, filename);
        return request<{ key: string; url: string }>(
          options,
          '/admin/uploads/cover',
          { method: 'POST', body: form },
        );
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
