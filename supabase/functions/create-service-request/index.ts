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
      provider_id,
      pet_id,
      service_type,
      start_date,
      end_date,
      start_time,
      end_time,
      special_instructions,
      emergency_contact
    } = await req.json()

    // Validate required fields
    if (!provider_id || !pet_id || !service_type || !start_date) {
      throw new Error('Missing required fields')
    }

    // Verify pet ownership
    const { data: pet, error: petError } = await supabaseClient
      .from('pets')
      .select('id, owner_id')
      .eq('id', pet_id)
      .eq('owner_id', user.id)
      .single()

    if (petError || !pet) {
      throw new Error('Pet not found or access denied')
    }

    // Get provider details for pricing
    const { data: provider, error: providerError } = await supabaseClient
      .from('service_providers')
      .select('id, hourly_rate, profiles!service_providers_profile_id_fkey(full_name)')
      .eq('id', provider_id)
      .single()

    if (providerError || !provider) {
      throw new Error('Service provider not found')
    }

    // Calculate total hours and amount
    const startDateTime = new Date(`${start_date}T${start_time || '00:00'}`)
    const endDateTime = new Date(`${end_date}T${end_time || '23:59'}`)
    const totalHours = Math.max(1, (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60))
    const totalAmount = totalHours * (provider.hourly_rate || 0)

    // Create service request
    const { data: serviceRequest, error: createError } = await supabaseClient
      .from('service_requests')
      .insert({
        owner_id: user.id,
        provider_id,
        pet_id,
        service_type,
        start_date,
        end_date,
        start_time,
        end_time,
        hourly_rate: provider.hourly_rate,
        total_hours: totalHours,
        total_amount: totalAmount,
        special_instructions,
        emergency_contact,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Create notification for provider
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: provider.profiles.id,
        title: 'Nova Solicitação de Serviço',
        message: `Você recebeu uma nova solicitação de ${service_type}`,
        notification_type: 'new_request',
        request_id: serviceRequest.id,
        action_data: { request_id: serviceRequest.id }
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: serviceRequest,
        message: 'Solicitação criada com sucesso'
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