
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Check your .env file.')
}

// Create the standard client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Helper to get session from local storage
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

// Helper to handle authentication state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback)
}
