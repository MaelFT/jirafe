/**
 * Mock de jose pour les tests
 */

// Mock de SignJWT
export class SignJWT {
  private payload: any
  private header: any
  private expTime: string = ''

  constructor(payload: any) {
    this.payload = payload
  }

  setProtectedHeader(header: any) {
    this.header = header
    return this
  }

  setIssuedAt() {
    return this
  }

  setExpirationTime(time: string) {
    this.expTime = time
    return this
  }

  async sign(secret: any): Promise<string> {
    // Génère un faux JWT pour les tests avec timestamp unique
    const header = Buffer.from(JSON.stringify(this.header)).toString('base64')
    const payload = Buffer.from(JSON.stringify({ 
      ...this.payload, 
      iat: Date.now() / 1000, // issued at (unique à chaque appel)
      exp: Date.now() / 1000 + 604800 // 7 jours
    })).toString('base64')
    const signature = Buffer.from('fake-signature-' + Date.now()).toString('base64')
    return `${header}.${payload}.${signature}`
  }
}

// Mock de jwtVerify
export async function jwtVerify(token: string, secret: any) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    const signature = parts[2]
    
    // Vérifie la signature (doit commencer par 'fake-signature')
    const decodedSignature = Buffer.from(signature, 'base64').toString()
    if (!decodedSignature.startsWith('fake-signature')) {
      throw new Error('Invalid signature')
    }
    
    // Vérifie si le token est expiré
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired')
    }

    return { payload }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

