// src/pages/Login.jsx
import React, { useState } from 'react'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Sending login request with:', {
      email,
      password,
      tenantSubdomain: subdomain.trim()
    })

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        tenantSubdomain: subdomain.trim()
      })

      console.log('Login response:', response.data)

      const { token } = response.data.data
      localStorage.setItem('token', token)
      alert('Login successful! Redirecting...')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error:', err)

      if (err.response) {
        // Backend responded with status code outside 2xx
        setError(err.response.data?.message || 'Login failed. Check credentials.')
        console.log('Backend response:', err.response.data)
      } else if (err.request) {
        // Request made but no response (likely CORS/network)
        setError('No response from server. Check backend or CORS.')
        console.log('Request made but no response:', err.request)
      } else {
        // Something else
        setError('Login failed. Check console for details.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Login to Your Tenant</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@yourcompany.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">Tenant Subdomain</label>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="yourcompany"
              required
            />
            <p className="text-sm text-gray-500 mt-1">e.g., if your tenant is yourcompany.com, use "yourcompany"</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register a new tenant
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
