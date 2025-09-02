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

    const { 
      request_id, 
      recipient_id, 
      content, 
      message_type = 'text',
      attachment_url 
    } = await req.json()

    // Validate required fields
    if (!request_id || !recipient_id || !content) {
      throw new Error('Missing required fields')
    }

    // Verify the user has access to this service request
    const { data: serviceRequest, error: requestError } = await supabaseClient
      .from('service_requests')
      .select(`
        id,
        owner_id,
        service_providers!service_requests_provider_id_fkey (
          profile_id
        )
      `)
      .eq('id', request_id)
      .single()

    if (requestError || !serviceRequest) {
      throw new Error('Service request not found')
    }

    // Check if user is either the owner or the provider
    const isOwner = serviceRequest.owner_id === user.id
    const isProvider = serviceRequest.service_providers.profile_id === user.id

    if (!isOwner && !isProvider) {
      throw new Error('Access denied')
    }

    // Verify recipient is the other party in the request
    const expectedRecipient = isOwner 
      ? serviceRequest.service_providers.profile_id 
      : serviceRequest.owner_id

    if (recipient_id !== expectedRecipient) {
      throw new Error('Invalid recipient')
    }

    // Create the message
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        request_id,
        sender_id: user.id,
        recipient_id,
        content,
        message_type,
        attachment_url
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        recipient:profiles!messages_recipient_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (messageError) {
      throw messageError
    }

    // Create notification for recipient
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: recipient_id,
        title: 'Nova Mensagem',
        message: `Você recebeu uma nova mensagem de ${message.sender.full_name}`,
        notification_type: 'new_message',
        request_id,
        message_id: message.id,
        action_data: { 
          request_id, 
          message_id: message.id,
          sender_name: message.sender.full_name
        }
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    // Broadcast the message via Supabase Realtime (optional)
    const channel = supabaseClient.channel(`request_${request_id}`)
    channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: message,
        message: 'Mensagem enviada com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
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