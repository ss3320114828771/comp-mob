import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

// Validation schemas
const emailSchema = z.object({
  to: z.string().email('Invalid recipient email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  name: z.string().optional(),
  phone: z.string().optional(),
  orderId: z.string().optional(),
})

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const orderConfirmationSchema = z.object({
  email: z.string().email('Invalid email address'),
  orderId: z.string().min(1, 'Order ID is required'),
  total: z.number().positive('Total must be positive'),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
})

// Email transporter configuration
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  // Check for required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email credentials not configured')
    return null
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    pool: true, // Use connection pooling for better performance
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second between messages
    rateLimit: 5, // Max 5 messages per second
  })

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter verification failed:', error)
    } else {
      console.log('Email transporter ready')
    }
  })

  return transporter
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Handle different email types
    switch (type) {
      case 'contact':
        return handleContactForm(request)
      case 'order-confirmation':
        return handleOrderConfirmation(request)
      case 'welcome':
        return handleWelcomeEmail(request)
      case 'password-reset':
        return handlePasswordReset(request)
      case 'newsletter':
        return handleNewsletter(request)
      default:
        return handleGeneralEmail(request)
    }
  } catch (error) {
    console.error('Email API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle general email sending
async function handleGeneralEmail(request: NextRequest) {
  try {
    // Verify authentication (optional - can be removed for public endpoints)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production' && !authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = emailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { to, subject, message, name, phone, orderId } = validation.data

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Create HTML email template
    const html = createEmailTemplate({
      title: subject,
      message,
      name,
      phone,
      orderId,
      isAdmin: false,
    })

    const mailOptions = {
      from: `"TechShop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: message, // Plain text version for email clients that don't support HTML
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Handle contact form submissions
async function handleContactForm(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = contactFormSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validation.data

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Send email to admin
    const adminHtml = createAdminNotificationTemplate({
      name,
      email,
      subject,
      message,
      type: 'contact',
    })

    const adminMailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: adminHtml,
      replyTo: email,
    }

    // Send confirmation email to user
    const userHtml = createUserConfirmationTemplate({
      name,
      email,
      subject,
      message,
    })

    const userMailOptions = {
      from: `"TechShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting TechShop`,
      html: userHtml,
    }

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ])

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// Handle order confirmation emails
async function handleOrderConfirmation(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = orderConfirmationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, orderId, total, items } = validation.data

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const orderHtml = createOrderConfirmationTemplate({
      orderId,
      total,
      items,
      date: new Date().toISOString(),
    })

    const mailOptions = {
      from: `"TechShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: orderHtml,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Order confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to send order confirmation' },
      { status: 500 }
    )
  }
}

// Handle welcome emails for new users
async function handleWelcomeEmail(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const welcomeHtml = createWelcomeTemplate(name || email.split('@')[0])

    const mailOptions = {
      from: `"TechShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to TechShop!',
      html: welcomeHtml,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}

// Handle password reset emails
async function handlePasswordReset(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, resetToken, resetUrl } = body

    if (!email || !resetToken) {
      return NextResponse.json(
        { error: 'Email and reset token are required' },
        { status: 400 }
      )
    }

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const resetHtml = createPasswordResetTemplate(resetUrl || `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)

    const mailOptions = {
      from: `"TechShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: resetHtml,
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Password reset email error:', error)
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    )
  }
}

// Handle newsletter emails
async function handleNewsletter(request: NextRequest) {
  try {
    const body = await request.json()
    const { emails, subject, content } = body

    if (!emails || !emails.length || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transporter = getTransporter()
    if (!transporter) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    const results = []

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchPromises = batch.map(async (email: string) => {
        try {
          const mailOptions = {
            from: `"TechShop Newsletter" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: createNewsletterTemplate(content),
          }
          return await transporter.sendMail(mailOptions)
        } catch (error) {
          console.error(`Failed to send to ${email}:`, error)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter(r => r !== null))
      
      // Wait between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      total: emails.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}

// Helper function to create email templates
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function createEmailTemplate({ title, message, name, phone, orderId, isAdmin }: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bismillah {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
        }
        .content {
          padding: 20px 0;
        }
        .message {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechShop</div>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <div class="content">
          ${name ? `<h2>Dear ${name},</h2>` : '<h2>Dear Customer,</h2>'}
          
          <div class="message">
            <strong>${title}</strong><br/><br/>
            ${message.replace(/\n/g, '<br/>')}
          </div>
          
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>
          <strong>Hafiz Sajid Syed</strong><br/>
          TechShop Administrator</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TechShop. All rights reserved.</p>
          <p>This email was sent to you as a valued customer of TechShop.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createOrderConfirmationTemplate({ orderId, total, items, date }: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation #${orderId}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bismillah {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
        }
        .order-info {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 2px solid #e5e7eb;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechShop</div>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <div class="order-info">
          <h2>Thank you for your order!</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(date).toLocaleString()}</p>
          
          <h3>Order Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Grand Total: $${total.toFixed(2)}
          </div>
          
          <p>We'll notify you once your order ships. You can track your order status in your account dashboard.</p>
          
          <p>Best regards,<br/>
          <strong>Hafiz Sajid Syed</strong><br/>
          TechShop Administrator</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TechShop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function createWelcomeTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to TechShop</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bismillah {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
        }
        .welcome-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin: 20px 0;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .feature {
          text-align: center;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechShop</div>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <div class="welcome-box">
          <h1>Welcome to TechShop, ${name}! 🎉</h1>
          <p>We're thrilled to have you join our community of tech enthusiasts.</p>
        </div>
        
        <div class="content">
          <h2>What you can do:</h2>
          <div class="features">
            <div class="feature">
              <strong>🛍️ Shop</strong>
              <p>Browse our premium collection</p>
            </div>
            <div class="feature">
              <strong>📦 Track Orders</strong>
              <p>Real-time order tracking</p>
            </div>
            <div class="feature">
              <strong>⭐ Reviews</strong>
              <p>Share your experience</p>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}" class="button">Start Shopping</a>
          </div>
          
          <p>As a welcome gift, use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          
          <p>Best regards,<br/>
          <strong>Hafiz Sajid Syed</strong><br/>
          TechShop Administrator</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TechShop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function createPasswordResetTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bismillah {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
        }
        .reset-box {
          background-color: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .warning {
          font-size: 12px;
          color: #666;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechShop</div>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div class="reset-box">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            ⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </div>
          
          <p>Best regards,<br/>
          <strong>Hafiz Sajid Syed</strong><br/>
          TechShop Administrator</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TechShop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function createNewsletterTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TechShop Newsletter</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bismillah {
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 18px;
          font-family: 'Traditional Arabic', 'Amiri', serif;
        }
        .content {
          padding: 20px 0;
        }
        .unsubscribe {
          text-align: center;
          font-size: 11px;
          color: #999;
          margin-top: 30px;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          border-top: 2px solid #f0f0f0;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TechShop</div>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <div class="content">
          ${content}
          
          <p>Best regards,<br/>
          <strong>Hafiz Sajid Syed</strong><br/>
          TechShop Administrator</p>
        </div>
        
        <div class="unsubscribe">
          If you wish to unsubscribe from our newsletter, <a href="#">click here</a>.
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TechShop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createAdminNotificationTemplate({ name, email, subject, message, type }: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New ${type} Message</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px -20px;
        }
        .field {
          margin-bottom: 15px;
        }
        .label {
          font-weight: bold;
          color: #4b5563;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New ${type.charAt(0).toUpperCase() + type.slice(1)} Message</h2>
        </div>
        
        <div class="field">
          <div class="label">Name:</div>
          <div>${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div>${email}</div>
        </div>
        
        <div class="field">
          <div class="label">Subject:</div>
          <div>${subject}</div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div style="background-color: #f9fafb; padding: 10px; border-radius: 4px;">${message.replace(/\n/g, '<br/>')}</div>
        </div>
        
        <p>Sent from TechShop Contact Form</p>
      </div>
    </body>
    </html>
  `
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function createUserConfirmationTemplate({ name, email, subject, message }: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for contacting us</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px -20px;
        }
        .bismillah {
          text-align: center;
          padding: 10px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Thank You for Contacting Us</h2>
        </div>
        
        <div class="bismillah">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for reaching out to TechShop. We have received your message and will get back to you within 24 hours.</p>
        
        <h3>Your Message Summary:</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <strong>Subject:</strong> ${subject}<br/>
          <strong>Message:</strong><br/>
          ${message.replace(/\n/g, '<br/>')}
        </div>
        
        <p>If you have any urgent questions, please don't hesitate to contact us directly at ${process.env.EMAIL_USER}</p>
        
        <p>Best regards,<br/>
        <strong>Hafiz Sajid Syed</strong><br/>
        TechShop Administrator</p>
      </div>
    </body>
    </html>
  `
}

// Handle GET request for testing
export async function GET() {
  return NextResponse.json({
    status: 'Email API is running',
    endpoints: {
      'POST ?type=contact': 'Send contact form',
      'POST ?type=order-confirmation': 'Send order confirmation',
      'POST ?type=welcome': 'Send welcome email',
      'POST ?type=password-reset': 'Send password reset email',
      'POST ?type=newsletter': 'Send newsletter',
      'POST (default)': 'Send general email',
    },
    admin: 'Hafiz Sajid Syed',
    email: 'hafiz.sajid.syed@gmail.com',
  })
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}