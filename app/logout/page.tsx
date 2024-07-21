'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function logout() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error during logout:', error)
    redirect('/error')
  }

  // Clear all cookies
  const cookieStore = cookies()
  cookieStore.getAll().forEach(cookie => {
    cookieStore.delete(cookie.name)
  })

  // Force revalidation of all pages
  revalidatePath('/', 'layout')

  // Redirect to login page
  redirect('/login')
}