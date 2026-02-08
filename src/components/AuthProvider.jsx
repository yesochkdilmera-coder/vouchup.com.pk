import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isBanned, setIsBanned] = useState(false)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('SESSION:', session?.user?.email || 'none')
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('AUTH CHANGE:', _event, session?.user?.email || 'none')
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setIsBanned(false)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        console.log('FETCH PROFILE start:', userId)
        setError(null)

        try {
            console.log('SELECTING PROFILE FIELDS...')
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, agency_name, status, moderation_status')
                .eq('id', userId)
                .maybeSingle()

            if (fetchError) {
                console.error('PROFILE FETCH ERROR:', {
                    message: fetchError?.message,
                    details: fetchError?.details,
                    hint: fetchError?.hint,
                    code: fetchError?.code
                })
                setError(fetchError)
                setProfile(null)
                setLoading(false)
                return
            }

            if (!data) {
                // Profile doesn't exist - CREATE IT
                console.log('PROFILE MISSING - Creating default profile')
                const currentUser = (await supabase.auth.getUser()).data.user

                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: currentUser?.email || '',
                        role: 'agency',
                        full_name: currentUser?.user_metadata?.full_name || '',
                        status: 'active'
                    })
                    .select()
                    .single()

                if (createError) {
                    console.error('PROFILE CREATE ERROR:', {
                        message: createError?.message,
                        details: createError?.details,
                        hint: createError?.hint,
                        code: createError?.code
                    })
                    setError(createError)
                    setProfile(null)
                } else {
                    console.log('PROFILE CREATED:', newProfile)
                    setProfile(newProfile)
                    setIsBanned(false)
                }
            } else {
                console.log('PROFILE OK:', data)
                console.log('ROLE RESOLVED:', data.role || 'none')
                console.log('MODERATION STATUS:', data.moderation_status || 'none')

                // Check if banned - user status or moderation_status can both trigger this
                if (data.status === 'banned' || data.moderation_status === 'banned') {
                    console.warn('USER IS BANNED')
                    setIsBanned(true)
                } else {
                    setIsBanned(false)
                }

                setProfile(data)
            }
        } catch (err) {
            console.error('PROFILE EXCEPTION:', err)
            setError(err)
            setProfile(null)
        } finally {
            setLoading(false)
            console.log('LOADING ENDED')
        }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setError(null)
        setIsBanned(false)
    }

    const value = {
        user,
        profile,
        role: profile?.role || null,
        status: profile?.status || 'active',
        loading,
        error,
        isBanned,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
