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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        }
      }
    )

    // Create the complete database schema
    const schemaSQL = `
      -- Enable necessary extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "postgis";

      -- Create custom types
      DO $$ BEGIN
        CREATE TYPE user_type AS ENUM ('owner', 'provider', 'both');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'fish', 'hamster', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large', 'extra_large');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE service_type AS ENUM ('pet_sitting', 'dog_walking', 'pet_boarding', 'grooming', 'training', 'veterinary_care');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('new_request', 'request_accepted', 'request_completed', 'new_message', 'reminder');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Profiles table (extends auth.users)
      CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          phone TEXT,
          avatar_url TEXT,
          user_type user_type DEFAULT 'owner',
          
          -- Address and location
          address TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          location GEOGRAPHY(POINT),
          
          -- Profile completion
          profile_completed BOOLEAN DEFAULT FALSE,
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Service providers table
      CREATE TABLE IF NOT EXISTS public.service_providers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          
          -- Professional info
          business_name TEXT,
          description TEXT,
          experience_years INTEGER DEFAULT 0,
          hourly_rate DECIMAL(8,2),
          
          -- Services offered
          services service_type[] DEFAULT '{}',
          pet_types pet_type[] DEFAULT '{}',
          pet_sizes pet_size[] DEFAULT '{}',
          
          -- Availability
          available_weekdays INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
          available_hours_start TIME DEFAULT '08:00',
          available_hours_end TIME DEFAULT '18:00',
          
          -- Service area (radius in km)
          service_radius INTEGER DEFAULT 10,
          
          -- Verification and ratings
          background_check_verified BOOLEAN DEFAULT FALSE,
          insurance_verified BOOLEAN DEFAULT FALSE,
          average_rating DECIMAL(3,2) DEFAULT 0.0,
          total_reviews INTEGER DEFAULT 0,
          total_bookings INTEGER DEFAULT 0,
          
          -- Status
          is_active BOOLEAN DEFAULT TRUE,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create remaining tables...
      CREATE TABLE IF NOT EXISTS public.pets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          
          name TEXT NOT NULL,
          pet_type pet_type NOT NULL,
          breed TEXT,
          size pet_size,
          weight DECIMAL(5,2),
          age INTEGER,
          gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
          
          description TEXT,
          medical_conditions TEXT,
          medications TEXT,
          dietary_restrictions TEXT,
          behavioral_notes TEXT,
          emergency_contact TEXT,
          veterinarian_contact TEXT,
          
          is_active BOOLEAN DEFAULT TRUE,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

      -- Create basic policies
      DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;
      CREATE POLICY "Users can view all public profiles" ON public.profiles FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
      CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

      -- Create function to handle new user registration
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.profiles (id, email, full_name, email_verified)
          VALUES (
              NEW.id,
              NEW.email,
              COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
              CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
          );
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger for new user registration
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

      -- Create RPC function for incrementing provider bookings
      CREATE OR REPLACE FUNCTION public.increment_provider_bookings(provider_id UUID)
      RETURNS void AS $$
      BEGIN
          UPDATE service_providers 
          SET total_bookings = total_bookings + 1
          WHERE id = provider_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error } = await supabaseClient.rpc('exec', { query: schemaSQL })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database schema created successfully'
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