"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  Users,
  Headphones,
  FileQuestion
} from "lucide-react"

export default function ContactPage() {
  const t = useTranslations("contact")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Samochody.be</CardTitle>
                  <CardDescription>Sp. z o.o.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-sm text-muted-foreground">
                    ul. Motoryzacyjna 42<br />
                    02-495 Warsaw<br />
                    Poland
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@samochody.be" className="text-sm text-primary hover:underline">
                    info@samochody.be
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+48221234567" className="text-sm text-primary hover:underline">
                    +48 22 123 45 67
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 8:00 - 18:00<br />
                    Saturday: 9:00 - 14:00<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NIP:</span>
                <span className="font-mono">527-123-45-67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">REGON:</span>
                <span className="font-mono">384756123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KRS:</span>
                <span className="font-mono">0000789456</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-muted-foreground">CEO & Founder</p>
                <p className="font-semibold">Rafal Noga</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="mailto:support@samochody.be"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Headphones className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Customer Support</p>
                  <p className="text-xs text-muted-foreground">support@samochody.be</p>
                </div>
              </a>
              <a
                href="mailto:sales@samochody.be"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Sales Inquiries</p>
                  <p className="text-xs text-muted-foreground">sales@samochody.be</p>
                </div>
              </a>
              <a
                href="mailto:legal@samochody.be"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <FileQuestion className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Legal & Compliance</p>
                  <p className="text-xs text-muted-foreground">legal@samochody.be</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond within 24 business hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for contacting Samochody.be. Our team will review your message
                    and get back to you within 24 business hours.
                  </p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("name")} *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Jan Kowalski"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("email")} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jan@example.pl"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("subject")} *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder={t("subjectPlaceholder")}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("message")} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t("messagePlaceholder")}
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                      {isSubmitting ? (
                        t("sending")
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {t("send")}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      * {t("requiredFields")}
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="mt-6">
            <CardContent className="p-0">
              <div className="aspect-[2/1] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    ul. Motoryzacyjna 42, 02-495 Warsaw, Poland
                  </p>
                  <a
                    href="https://maps.google.com/?q=Warsaw+Poland"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Before reaching out, you might find your answer in our comprehensive FAQ section
          or auction rules.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <a href="/rules">View Auction Rules</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/about">Learn About Us</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
