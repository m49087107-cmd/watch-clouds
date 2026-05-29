import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useListUsers, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { Loader2, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function UsersContent() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  
  const { data: usersData, isLoading, refetch } = useListUsers({
    page,
    limit: 20
  });

  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleRoleChange = (id: string, role: string) => {
    updateMutation.mutate(
      { id, data: { role: role as any } },
      {
        onSuccess: () => {
          toast({ description: "User role updated successfully" });
          refetch();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ description: "User deleted successfully" });
            refetch();
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Manage Users</h1>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : usersData?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">
                    No users found.
                  </td>
                </tr>
              ) : (
                usersData?.users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-white/70">{user.email}</td>
                    <td className="p-4">
                      <Select 
                        defaultValue={user.role} 
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className="w-[120px] h-8 bg-black/40 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card/95 border-white/10">
                          <SelectItem value="user">
                            <div className="flex items-center"><UserIcon className="w-3 h-3 mr-2" /> User</div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center text-primary"><Shield className="w-3 h-3 mr-2" /> Admin</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {usersData && usersData.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4 bg-black/20">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-white/60">Page {page} of {usersData.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white"
              disabled={page === usersData.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminUsers() {
  return <ProtectedRoute component={UsersContent} requireAdmin />;
}
