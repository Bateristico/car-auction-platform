import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your platform settings</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure general platform settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="CarAuction" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteEmail">Contact Email</Label>
              <Input id="siteEmail" type="email" defaultValue="info@carauction.pl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sitePhone">Contact Phone</Label>
              <Input id="sitePhone" defaultValue="+48 123 456 789" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Auction Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Settings</CardTitle>
            <CardDescription>
              Configure auction behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="minBidIncrement">Minimum Bid Increment (PLN)</Label>
              <Input id="minBidIncrement" type="number" defaultValue="100" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="defaultDuration">Default Auction Duration (days)</Label>
              <Input id="defaultDuration" type="number" defaultValue="7" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-extend Auctions</Label>
                <p className="text-sm text-muted-foreground">
                  Extend auction time if bid placed in last 2 minutes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input id="notificationEmail" type="email" defaultValue="camilo.saa@gmail.com" />
              <p className="text-sm text-muted-foreground">
                Receive bid notifications at this email
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email on New Bid</Label>
                <p className="text-sm text-muted-foreground">
                  Send email when a new bid is placed
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email on Auction End</Label>
                <p className="text-sm text-muted-foreground">
                  Send email when an auction ends
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
