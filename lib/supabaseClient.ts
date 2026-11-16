// Compatibility shim redirecting legacy Supabase imports to custom backend
import { backend } from '@/lib/backend';

export function createClient() {
  return {
    auth: {
      async getUser() {
        try {
          const { payload } = await backend.getMe();
          const custom = (payload.custom as Record<string, any>) || {};
          return {
            data: {
              user: {
                id: payload.sub as string,
                email: (custom.email as string) || '',
                user_metadata: custom,
              },
            },
            error: null,
          };
        } catch (err: any) {
          return { data: { user: null }, error: err };
        }
      },
      async getSession() {
        const res = await this.getUser();
        return {
          data: { session: res.data.user ? { user: res.data.user } : null },
          error: res.error,
        };
      },
      async signOut() {
        await backend.logout();
        return { error: null };
      },
    },
    from(collection: string) {
      return {
        async select() {
          try {
            const records = await backend.list<any>(collection);
            return {
              data: records.map((r) => ({ id: r.id, created_at: r.created_at, ...(r.data || r) })),
              error: null,
            };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
        async insert(payload: any) {
          try {
            const item = Array.isArray(payload) ? payload[0] : payload;
            const created = await backend.create<any>(collection, item);
            return { data: { id: created.id, ...(created.data || created) }, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        },
      };
    },
  };
}

export const supabase = createClient();
