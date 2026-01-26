/**
 * Tests unitaires pour lib/auth.ts
 * 
 * Couvre :
 * - Hashage de mots de passe (bcrypt)
 * - Vérification de mots de passe
 * - Création de JWT
 * - Vérification de JWT
 */

import { hashPassword, verifyPassword, createToken, verifyToken } from '@/lib/auth'

describe('lib/auth.ts - Hashage et vérification de mots de passe', () => {
  describe('hashPassword()', () => {
    it('devrait générer un hash bcrypt valide', async () => {
      const password = 'password123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(50) // Les hash bcrypt font ~60 chars
    })

    it('devrait commencer par $2b$10$ (bcrypt avec 10 rounds)', async () => {
      const password = 'test'
      const hash = await hashPassword(password)
      
      expect(hash).toMatch(/^\$2b\$10\$/)
    })

    it('devrait générer des hash différents pour le même mot de passe (salt aléatoire)', async () => {
      const password = 'samePassword'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2) // Salt aléatoire = hash différent
    })

    it('devrait gérer les mots de passe complexes', async () => {
      const complexPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await hashPassword(complexPassword)
      
      expect(hash).toBeDefined()
      expect(hash.length).toBeGreaterThan(50)
    })
  })

  describe('verifyPassword()', () => {
    it('devrait valider un mot de passe correct', async () => {
      const password = 'correctPassword'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('devrait rejeter un mot de passe incorrect', async () => {
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })

    it('devrait rejeter un hash invalide', async () => {
      const password = 'test'
      const invalidHash = 'invalid_hash_format'
      
      const isValid = await verifyPassword(password, invalidHash)
      
      expect(isValid).toBe(false)
    })

    it('devrait gérer les cas sensibles à la casse', async () => {
      const password = 'Password123'
      const hash = await hashPassword(password)
      
      const validLowerCase = await verifyPassword('password123', hash)
      const validUpperCase = await verifyPassword('PASSWORD123', hash)
      
      expect(validLowerCase).toBe(false)
      expect(validUpperCase).toBe(false)
    })
  })
})

describe('lib/auth.ts - JWT (JSON Web Tokens)', () => {
  const mockPayload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@jirafe.local',
  }

  describe('createToken()', () => {
    it('devrait créer un JWT valide', async () => {
      const token = await createToken(mockPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT = 3 parties séparées par .
    })

    it('devrait créer des tokens différents à chaque appel', async () => {
      const token1 = await createToken(mockPayload)
      // Petit délai pour s'assurer que le timestamp change
      await new Promise(resolve => setTimeout(resolve, 2))
      const token2 = await createToken(mockPayload)
      
      // Les tokens sont différents car ils contiennent un timestamp
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken()', () => {
    it('devrait décoder et valider un token valide', async () => {
      const token = await createToken(mockPayload)
      
      const decoded = await verifyToken(token)
      
      expect(decoded).toBeDefined()
      expect(decoded?.userId).toBe(mockPayload.userId)
      expect(decoded?.email).toBe(mockPayload.email)
    })

    it('devrait rejeter un token invalide', async () => {
      const invalidToken = 'invalid.token.here'
      
      const decoded = await verifyToken(invalidToken)
      
      expect(decoded).toBeNull()
    })

    it('devrait rejeter un token avec mauvaise signature', async () => {
      const token = await createToken(mockPayload)
      // Remplace la signature par quelque chose qui n'est pas valide
      const parts = token.split('.')
      parts[2] = Buffer.from('invalid-signature').toString('base64')
      const tamperedToken = parts.join('.')
      
      const decoded = await verifyToken(tamperedToken)
      
      expect(decoded).toBeNull()
    })

    it('devrait rejeter un token vide', async () => {
      const decoded = await verifyToken('')
      
      expect(decoded).toBeNull()
    })

    it('le token devrait contenir les bonnes données', async () => {
      const payload = {
        userId: 'user-abc-123',
        email: 'alice@jirafe.local',
      }
      
      const token = await createToken(payload)
      const decoded = await verifyToken(token)
      
      expect(decoded?.userId).toBe(payload.userId)
      expect(decoded?.email).toBe(payload.email)
    })
  })

  describe('JWT - Intégration hashPassword + createToken', () => {
    it('devrait créer un flow auth complet', async () => {
      // 1. Hash du mot de passe
      const password = 'userPassword123'
      const hash = await hashPassword(password)
      
      // 2. Vérification du mot de passe
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
      
      // 3. Création du token après validation
      const token = await createToken({
        userId: 'user-123',
        email: 'user@test.com',
      })
      
      // 4. Vérification du token
      const decoded = await verifyToken(token)
      expect(decoded?.userId).toBe('user-123')
    })
  })
})

