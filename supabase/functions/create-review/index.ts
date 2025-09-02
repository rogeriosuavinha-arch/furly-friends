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
      rating, 
      title, 
      comment,
      is_public = true 
    } = await req.json()

    // Validate required fields
    if (!request_id || !rating) {
      throw new Error('Request ID and rating are required')
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    // Get the service request and verify user access
    const { data: serviceRequest, error: requestError } = await supabaseClient
      .from('service_requests')
      .select(`
        *,
        service_providers!service_requests_provider_id_fkey (
          profile_id
        )
      `)
      .eq('id', request_id)
      .single()

    if (requestError || !serviceRequest) {
      throw new Error('Service request not found')
    }

    // Check if request is completed
    if (serviceRequest.status !== 'completed') {
      throw new Error('Can only review completed services')
    }

    // Determine reviewer type and reviewed user
    let reviewerType: 'owner' | 'provider'
    let reviewedId: string

    if (serviceRequest.owner_id === user.id) {
      // Pet owner reviewing provider
      reviewerType = 'owner'
      reviewedId = serviceRequest.service_providers.profile_id
    } else if (serviceRequest.service_providers.profile_id === user.id) {
      // Provider reviewing pet owner
      reviewerType = 'provider'
      reviewedId = serviceRequest.owner_id
    } else {
      throw new Error('Access denied')
    }

    // Check if user already reviewed this request
    const { data: existingReview, error: checkError } = await supabaseClient
      .from('reviews')
      .select('id')
      .eq('request_id', request_id)
      .eq('reviewer_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingReview) {
      throw new Error('You have already reviewed this request')
    }

    // Create the review
    const { data: review, error: reviewError } = await supabaseClient
      .from('reviews')
      .insert({
        request_id,
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        rating,
        title,
        comment,
        reviewer_type: reviewerType,
        is_public
      })
      .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        reviewed:profiles!reviews_reviewed_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (reviewError) {
      throw reviewError
    }

    // Create notification for reviewed user
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: reviewedId,
        title: 'Nova Avaliação',
        message: `Você recebeu uma nova avaliação de ${review.reviewer.full_name}`,
        notification_type: 'new_message', // Using existing type
        request_id,
        action_data: { 
          request_id, 
          review_id: review.id,
          rating,
          reviewer_name: review.reviewer.full_name
        }
      })

    if (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: review,
        message: 'Avaliação criada com sucesso'
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