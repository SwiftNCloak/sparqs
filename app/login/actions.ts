'use server'

import { createClient } from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, message: `Login error: ${error.message}` }
  }

  return { success: true, message: "Login successful" }
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const firstname = formData.get('firstName') as string
  const lastname = formData.get('lastName') as string
  const middlename = formData.get('middleName') as string
  const contact = formData.get('contactNumber') as string
  const username = formData.get('username') as string

  const { data: authData, error: signUpError } = await supabase.auth.signUp(data)

  if (signUpError) {
    return { success: false, message: `Signup error: ${signUpError.message}` }
  }

  if (authData.user) {
    const userId = uuidv4()
    const { error: insertError } = await supabase
      .from('users')
      .insert({ 
        id: userId,
        firstname,
        lastname,
        middlename,
        email: data.email,
        contact: parseInt(contact),
        username,
        is_premium: false,
      })

    if (insertError) {
      console.error('Error inserting user data:', insertError)
      return { success: false, message: `Error inserting user data: ${insertError.message}` }
    }
  }

  return { success: true, message: "Signup successful" }
}