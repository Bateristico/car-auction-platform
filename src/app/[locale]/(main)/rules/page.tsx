import { getTranslations, setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Gavel,
  Shield,
  Truck,
  UserCheck,
  XCircle
} from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "rules" })

  return {
    title: `${t("title")} | CarAuction`,
    description: t("subtitle"),
  }
}

export default async function RulesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("rules")

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Notice</h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                All bids are legally binding. Once you place a bid, you are committed to purchasing the vehicle
                if you are the winning bidder. Please ensure you have reviewed all vehicle information and have
                the necessary funds available before bidding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Sections */}
      <div className="space-y-8">
        {/* Registration Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              1. Registration Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To participate in auctions, users must complete the registration process and meet the following criteria:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Be at least 18 years of age</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Provide a valid PESEL number (for Polish residents)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Provide accurate personal information and contact details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Verify email address before placing bids</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Agree to these auction rules and our Terms of Service</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Bidding Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              2. Bidding Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Bid Increments</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Up to 10,000 PLN: 100 PLN minimum increment</li>
                  <li>10,001 - 50,000 PLN: 250 PLN minimum increment</li>
                  <li>50,001 - 100,000 PLN: 500 PLN minimum increment</li>
                  <li>Above 100,000 PLN: 1,000 PLN minimum increment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Bid Extension</h4>
                <p className="text-sm text-muted-foreground">
                  If a bid is placed within the last 5 minutes of an auction, the auction
                  will be automatically extended by 5 minutes to allow other bidders to respond.
                </p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Important Bidding Guidelines</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>All bids are final and cannot be retracted once placed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>You will receive email notifications when outbid</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>The highest bid at auction close wins, subject to reserve price</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <span>Shill bidding (bidding on your own items) is strictly prohibited</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Auction Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              3. Auction Duration & Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Standard auctions run for 7-14 days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>All auction times are displayed in Central European Time (CET)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Countdown timers show exact time remaining</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>NovaDrive Motors reserves the right to extend or cancel auctions</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              4. Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Winning bidders must complete payment within the specified timeframe:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Payment Deadline</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Deposit (10% of final price): Within 24 hours</li>
                  <li>Full payment: Within 5 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Accepted Payment Methods</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Bank transfer (preferred)</li>
                  <li>Escrow service</li>
                  <li>Financing (through approved partners)</li>
                </ul>
              </div>
            </div>
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Warning:</strong> Failure to complete payment within the specified timeframe may result
                in forfeiture of deposit, account suspension, and potential legal action.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Pickup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              5. Vehicle Pickup & Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Vehicles must be collected within 10 business days of full payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Pickup locations are specified in each auction listing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Transport services available for additional fee (starting at 500 PLN)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Storage fees apply after 10 days (50 PLN per day)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Vehicle Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              6. Vehicle Condition & Inspection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              All vehicles are sold "as-is" based on the condition described in the listing. We strongly encourage:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Reviewing all photos and condition reports carefully</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Scheduling a pre-auction inspection when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Checking the vehicle history report (VIN provided after verification)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Reading damage descriptions for salvage/damaged vehicles</span>
              </li>
            </ul>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> While we strive for accuracy, NovaDrive Motors is not responsible for
                undisclosed defects or conditions not visible during standard inspection.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              7. Buyer Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              NovaDrive Motors offers buyer protection for eligible purchases:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Guaranteed title transfer and documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Mileage verification (where odometer is functional)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Fraud protection for payments made through our platform</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Dispute resolution assistance</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              8. Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The following activities are strictly prohibited and may result in account termination:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <span>Shill bidding or bid manipulation</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <span>Creating multiple accounts to circumvent bans</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <span>Providing false or misleading information</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <span>Harassment of other users or staff</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <span>Attempting to complete transactions outside the platform</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          These rules were last updated on January 1, 2025. NovaDrive Motors reserves the right
          to modify these rules at any time. Users will be notified of significant changes.
        </p>
        <p className="mt-2">
          For questions about these rules, please contact our support team at{" "}
          <a href="mailto:support@novadrivemotors.pl" className="text-primary hover:underline">
            support@novadrivemotors.pl
          </a>
        </p>
      </div>
    </div>
  )
}
