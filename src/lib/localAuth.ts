import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import pool from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'secreto_agrobanco_super_seguro_123'
);

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { user: null };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [payload.id]);
    
    if (rows.length > 0) {
      const user = rows[0];
      return { 
        user: { 
          id: user.id, 
          email: user.email, 
          rol: user.rol, 
          nombres: user.nombres, 
          apellidos: user.apellidos, 
          dni: user.dni 
        }, 
        token 
      };
    }
  } catch(e) {
    console.error("Error validando token:", e);
  }
  
  return { user: null };
}

export async function loginUser(email: string, password?: string) {
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1 OR dni = $1', [email]);
    
    if (rows.length === 0) {
      return { user: null, error: 'Credenciales inválidas' };
    }
    
    const user = rows[0];
    if (user.password !== password) {
      return { user: null, error: 'Credenciales inválidas' };
    }
    
    const token = await new SignJWT({ id: user.id, email: user.email, rol: user.rol })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(JWT_SECRET);
    
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    
    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        rol: user.rol, 
        nombres: user.nombres, 
        apellidos: user.apellidos, 
        dni: user.dni 
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error en loginDB:", error);
    return { user: null, error: 'Error de conexión con la base de datos' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
