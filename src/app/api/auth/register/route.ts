import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Polish PESEL validation
function validatePesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  let sum = 0

  for (let i = 0; i < 10; i++) {
    sum += parseInt(pesel[i]) * weights[i]
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(pesel[10])
}

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  pesel: z.string().refine(validatePesel, "Invalid PESEL number"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, pesel, phone, address, city, postalCode } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { pesel },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        )
      }
      if (existingUser.pesel === pesel) {
        return NextResponse.json(
          { error: "An account with this PESEL already exists" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        pesel,
        phone,
        address,
        city,
        postalCode,
        country: "Poland",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    return NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}
