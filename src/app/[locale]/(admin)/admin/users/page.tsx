import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bids: true } },
    },
  })
}

const roleColors: Record<string, string> = {
  ADMIN: "destructive",
  USER: "secondary",
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Bids</th>
                    <th className="text-left py-3 px-4 font-medium">Joined</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.city && (
                            <p className="text-sm text-muted-foreground">
                              {user.city}, {user.country}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{user.email}</p>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Verified
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{user.phone || "-"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            roleColors[user.role] as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{user._count.bids}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users registered yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
