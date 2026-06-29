'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Nuevos datos del cliente
  const nombres = formData.get('nombres') as string
  const apellidos = formData.get('apellidos') as string
  const dni = formData.get('dni') as string
  const celular = formData.get('celular') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string
  const direccion = formData.get('direccion') as string

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        nombres,
        apellidos,
        dni,
        celular,
        fecha_nacimiento,
        direccion
      })
    });

    const result = await res.json();

    if (!result.success) {
      return redirect('/registro?error=' + encodeURIComponent(result.message || 'Error en el registro'));
    }

  } catch (error: any) {
    return redirect('/registro?error=' + encodeURIComponent(error?.message || 'Error de conexión con el servidor'));
  }

  revalidatePath('/login', 'layout')
  redirect('/login')
}
