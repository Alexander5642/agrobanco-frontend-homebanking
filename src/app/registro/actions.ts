'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'

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

  try {
    // Verificar si el usuario ya existe
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR dni = $2', [email, dni]);
    if (rows.length > 0) {
      return redirect('/registro?error=' + encodeURIComponent('El correo o DNI ya están registrados'));
    }

    // Generar IDs únicos (mismo formato que el backend)
    const userId = 'usr-' + Date.now();
    const cuentaId = 'cta-' + Date.now();
    const numCuenta = '191-' + Math.floor(10000000 + Math.random() * 90000000);

    // Insertar usuario con ID generado
    await pool.query(
      `INSERT INTO usuarios (id, nombres, apellidos, email, password, dni, celular, direccion, rol) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CLIENTE')`,
      [userId, nombres, apellidos, email, password, dni, celular, direccion]
    );

    // Crear cuenta bancaria automáticamente para el nuevo usuario
    await pool.query(
      'INSERT INTO cuentas (id, user_id, numero_cuenta, saldo, trea, tem) VALUES ($1, $2, $3, $4, $5, $6)',
      [cuentaId, userId, numCuenta, 0.00, 1.5, 0.1241]
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    const msg = error?.message || 'Error al registrar la cuenta';
    return redirect('/registro?error=' + encodeURIComponent(msg));
  }

  revalidatePath('/login', 'layout')
  redirect('/login?success=' + encodeURIComponent('¡Cuenta creada exitosamente! Inicia sesión con tus credenciales.'))
}
