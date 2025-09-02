import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { request_id, action, provider_notes } = await req.json()

    // Validate action
    if (!['accept', 'reject'].includes(action)) {
      throw new Error('Action must be either "accept" or "reject"')
    }

    // Get the service request and verify provider ownership
    const { data: serviceRequest, error: requestError } = await supabaseClient
      .from('service_requests')
      .select(`
        *,
        service_providers!service_requests_provider_id_fkey (
          profile_id
        ),
        profiles!service_requests_owner_id_fkey (
          full_name
        )
      `)
      .eq('id', request_id)
      .single()

    if (requestError || !serviceRequest) {
      throw new Error('Service request not found')
    }

    // Verify the current user is the provider
    if (serviceRequest.service_providers.profile_id !== user.id) {
      throw new Error('Access denied')
    }

    // Check if request is still pending
    if (serviceRequest.status !== 'pending') {
      throw new Error('Request is no longer pending')
    }

    // Update the service request
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'
    const updateData: any = {
      status: newStatus,
      provider_notes
    }

    if (action === 'accept') {
      updateData.accepted_at = new Date().toISOString()
    }

    const { data: updatedRequest, error: updateError } = await supabaseClient
      .from('service_requests')
      .update(updateData)
      .eq('id', request_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Create notification for pet owner
    const notificationTitle = action === 'accept' 
      ? 'Solicitação Aceita!' 
      : 'Solicitação Rejeitada'
    
    const notificationMessage = action === 'accept'
      ? `Sua solicitação de ${serviceRequest.service_type} foi aceita`
      : `Sua solicitação de ${serviceRequest.service_type} foi rejeitada`

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: serviceRequest.owner_id,
        title: notificationTitle,
        message: notificationMessage,
        notification_type: 'request_accepted',
        request_id: serviceRequest.id,
        action_data: { 
          request_id: serviceRequest.id, 
          status: newStatus,
          provider_notes 
        }
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    // If accepted, update provider's total bookings
    if (action === 'accept') {
      const { error: providerUpdateError } = await supabaseClient
        .rpc('increment_provider_bookings', { provider_id: serviceRequest.provider_id })

      if (providerUpdateError) {
        console.error('Failed to update provider bookings:', providerUpdateError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedRequest,
        message: `Solicitação ${action === 'accept' ? 'aceita' : 'rejeitada'} com sucesso`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})