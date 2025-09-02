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

    const { 
      latitude, 
      longitude, 
      radius = 10, 
      service_type, 
      pet_type, 
      pet_size,
      min_rating = 0,
      max_rate = 1000,
      available_date 
    } = await req.json()

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required')
    }

    // Base query to find service providers within radius
    let query = supabaseClient
      .from('service_providers')
      .select(`
        *,
        profiles!service_providers_profile_id_fkey (
          id,
          full_name,
          avatar_url,
          city,
          state,
          latitude,
          longitude
        )
      `)
      .eq('is_active', true)
      .gte('average_rating', min_rating)
      .lte('hourly_rate', max_rate)

    // Add service type filter
    if (service_type) {
      query = query.contains('services', [service_type])
    }

    // Add pet type filter
    if (pet_type) {
      query = query.contains('pet_types', [pet_type])
    }

    // Add pet size filter
    if (pet_size) {
      query = query.contains('pet_sizes', [pet_size])
    }

    const { data: providers, error } = await query

    if (error) {
      throw error
    }

    // Calculate distance and filter by radius
    const providersWithDistance = providers
      ?.map(provider => {
        const profile = provider.profiles
        if (!profile?.latitude || !profile?.longitude) {
          return null
        }

        // Calculate distance using Haversine formula
        const R = 6371 // Earth's radius in km
        const dLat = (profile.latitude - latitude) * Math.PI / 180
        const dLon = (profile.longitude - longitude) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latitude * Math.PI / 180) * Math.cos(profile.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c

        return {
          ...provider,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          profile
        }
      })
      .filter(provider => provider && provider.distance <= radius)
      .sort((a, b) => a.distance - b.distance) // Sort by distance

    return new Response(
      JSON.stringify({
        success: true,
        data: providersWithDistance,
        count: providersWithDistance?.length || 0
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