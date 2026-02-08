
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get env from parent dir .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    console.log('Ensure you have a .env.local file in the project root with these variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const email = process.argv[2]

if (!email) {
    console.error('Usage: node scripts/create-admin.js <email>')
    process.exit(1)
}

async function promoteToAdmin() {
    console.log(`Promoting ${email} to admin...`)

    // 1. Get user from Auth (optional, primarily we update Public Profile)
    // But we need the ID from Public Profiles because auth.users is not accessible directly via simple query?
    // Wait, service role CAN access auth.users. But we store role in PUBLIC.PROFILES.

    const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)

    if (findError) {
        console.error('Error finding user:', findError)
        return
    }

    if (!profiles || profiles.length === 0) {
        console.error(`User with email ${email} not found in profiles table.`)
        console.log('The user must sign up first.')
        return
    }

    const user = profiles[0]

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .match({ id: user.id })

    if (updateError) {
        console.error('Failed to update role:', updateError)
    } else {
        console.log(`Success! User ${email} (ID: ${user.id}) is now an ADMIN.`)
    }
}

promoteToAdmin()
