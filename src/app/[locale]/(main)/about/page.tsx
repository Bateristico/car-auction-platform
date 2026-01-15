import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Award, TrendingUp, Clock, Globe } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })

  return {
    title: `${t("title")} | Samochody.be`,
    description: t("subtitle"),
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("about")

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">{t("ourStory")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Samochody.be was founded in 2019 by Rafal Noga, a visionary entrepreneur who saw
              an opportunity to revolutionize the way vehicles are bought and sold in Poland. After
              years of experience in the automotive industry, Rafal recognized that the traditional
              car auction model was ripe for digital transformation.
            </p>
            <p>
              What started as a small operation in Warsaw has grown into Poland's most trusted
              online vehicle auction platform. Today, we facilitate thousands of transactions
              annually, helping buyers find their perfect vehicles at competitive prices while
              providing sellers with a transparent and efficient marketplace.
            </p>
            <p>
              Our partnership with major insurance companies, fleet management firms, and authorized
              dealers ensures a steady supply of quality vehicles, from everyday commuters to
              premium sports cars and commercial vehicles.
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">{t("ourMission")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              At Samochody.be, we believe everyone deserves access to quality vehicles at
              fair prices. Our mission is to democratize the car buying experience by providing
              a transparent, secure, and user-friendly auction platform.
            </p>
            <p>
              We are committed to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Providing complete transparency in every listing</li>
              <li>Ensuring secure transactions for all parties</li>
              <li>Offering detailed vehicle histories and condition reports</li>
              <li>Delivering exceptional customer support</li>
              <li>Continuously innovating our platform</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/30 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t("ourImpact")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">15,000+</p>
            <p className="text-muted-foreground">{t("vehiclesSold")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">50,000+</p>
            <p className="text-muted-foreground">{t("registeredUsers")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">98%</p>
            <p className="text-muted-foreground">{t("satisfaction")}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">5+</p>
            <p className="text-muted-foreground">{t("yearsExcellence")}</p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t("ourValues")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("trust")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("trustDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("customerFirst")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("customerFirstDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("quality")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("qualityDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t("whyChoose")}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t("competitive")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("competitiveDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t("access")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("accessDesc")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t("delivery")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("deliveryDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("leadership")}</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          "Our vision is to make quality vehicles accessible to everyone. At Samochody.be,
          we're not just selling cars - we're building trust and transforming the automotive
          marketplace for the better."
        </p>
        <p className="font-semibold">Rafal Noga</p>
        <p className="text-sm opacity-80">{t("founder")}</p>
      </div>
    </div>
  )
}
