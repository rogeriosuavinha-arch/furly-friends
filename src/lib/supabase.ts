import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  user_type: 'owner' | 'provider' | 'both'
  address?: string
  city?: string
  state?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  profile_completed: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface ServiceProvider {
  id: string
  profile_id: string
  business_name?: string
  description?: string
  experience_years: number
  hourly_rate?: number
  services: string[]
  pet_types: string[]
  pet_sizes: string[]
  available_weekdays: number[]
  available_hours_start: string
  available_hours_end: string
  service_radius: number
  background_check_verified: boolean
  insurance_verified: boolean
  average_rating: number
  total_reviews: number
  total_bookings: number
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  pet_type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'hamster' | 'other'
  breed?: string
  size?: 'small' | 'medium' | 'large' | 'extra_large'
  weight?: number
  age?: number
  gender?: 'male' | 'female' | 'unknown'
  description?: string
  medical_conditions?: string
  medications?: string
  dietary_restrictions?: string
  behavioral_notes?: string
  emergency_contact?: string
  veterinarian_contact?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceRequest {
  id: string
  owner_id: string
  provider_id: string
  pet_id: string
  service_type: 'pet_sitting' | 'dog_walking' | 'pet_boarding' | 'grooming' | 'training' | 'veterinary_care'
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  hourly_rate?: number
  total_hours?: number
  total_amount?: number
  special_instructions?: string
  emergency_contact?: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  requested_at: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  provider_notes?: string
  owner_notes?: string
  created_at: string
  updated_at: string
}

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Pet helpers
export const getUserPets = async (userId: string) => {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createPet = async (pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single()
  return { data, error }
}

// Service provider helpers
export const searchProviders = async (searchParams: {
  latitude: number
  longitude: number
  radius?: number
  service_type?: string
  pet_type?: string
  pet_size?: string
  min_rating?: number
  max_rate?: number
}) => {
  const { data, error } = await supabase.functions.invoke('search-providers', {
    body: searchParams
  })
  return { data, error }
}

export const createServiceProvider = async (provider: Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('service_providers')
    .insert(provider)
    .select()
    .single()
  return { data, error }
}