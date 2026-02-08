import { createServerClient } from '@supabase/ssr'

// Load environment variables (Use process.env or specific server env loader)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

/**
 * Creates a Supabase client for Server-Side Rendering (SSR) or Server Actions.
 *
 * @param {Object} context - The context containing cookies or request headers.
 * @param {Object} context.cookies - Cookie storage interface { get, set, remove } or similar depending on framework.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export const createClient = (context) => {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return context.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    context.cookies.set(name, value, options)
                )
            },
        },
    })
}

/**
 * Creates a Supabase Service Role client for admin tasks.
 * NEVER expose this client to the browser.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export const createAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin client')
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
            getAll() { return [] },
            setAll() { }
        }
    })
}
