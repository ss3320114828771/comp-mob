
interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface OrderConfirmationData {
  email: string
  orderId: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

// Client-side email helper
export async function sendContactForm(data: ContactFormData) {
  const response = await fetch('/api/email?type=contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }

  return response.json()
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  const response = await fetch('/api/email?type=order-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send order confirmation')
  }

  return response.json()
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const response = await fetch('/api/email?type=welcome', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send welcome email')
  }

  return response.json()
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
  
  const response = await fetch('/api/email?type=password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, resetToken, resetUrl }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send password reset email')
  }

  return response.json()
}

// Server-side email helper
export async function sendEmailServer(options: EmailOptions) {
  // This would be called from server components or API routes
  // You can use nodemailer directly here if needed
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
    },
    body: JSON.stringify(options),
  })

  return response.json()
}