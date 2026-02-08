
import { supabase } from './supabaseClient'

export const logAdminAction = async ({ actionType, targetType, targetId, metadata = {} }) => {
    try {
        const { error } = await supabase.rpc('log_admin_action', {
            p_action_type: actionType,
            p_target_type: target_type,
            p_target_id: targetId,
            p_metadata: metadata
        })
        if (error) console.error('Audit Logging Error:', error)
    } catch (err) {
        console.error('Audit Logging Failed:', err)
    }
}
