import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: "user" | "manager" | "admin";
  createdAt?: Date;
}

export default function UserManagementScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const getAllUsersQuery = trpc.users.getAll.useQuery(undefined, {
    enabled: (user as any)?.role === "admin",
  });

  const updateRoleMutation = trpc.users.updateRole.useMutation();

  useEffect(() => {
    const data = getAllUsersQuery.data as any;
    if (data?.success && data?.data) {
      setUsers(data.data as User[]);
      setLoading(false);
    }
  }, [getAllUsersQuery.data]);

  const handleRoleChange = async (userId: number, newRole: "user" | "manager" | "admin") => {
    setUpdatingUserId(userId);
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#ef4444"; // Red
      case "manager":
        return "#f59e0b"; // Amber
      default:
        return "#10b981"; // Green
    }
  };

  const userRole = (user as any)?.role;
  if (loading || userRole !== "admin") {
    if (userRole !== "admin") {
      return (
        <ScreenContainer className="flex items-center justify-center">
          <Text className="text-center text-muted">Admin access required</Text>
        </ScreenContainer>
      );
    }
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }



  return (
    <ScreenContainer className="pb-20">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">User Management</Text>
          <Text className="text-sm text-muted">Grant or revoke admin and manager roles</Text>

          {users.length === 0 ? (
            <Text className="text-center text-muted mt-8">No users found</Text>
          ) : (
            <View className="gap-3">
              {users.map((u) => (
                <View
                  key={u.id}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {u.name}
                      </Text>
                      <Text className="text-xs text-muted">{u.email}</Text>
                      {u.phone && u.phone !== "N/A" && (
                        <Text className="text-xs text-muted">{u.phone}</Text>
                      )}
                    </View>
                    <View
                      style={{ backgroundColor: getRoleColor(u.role || "user") }}
                      className="px-2 py-1 rounded"
                    >
                      <Text className="text-white text-xs font-semibold capitalize">
                        {u.role}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    {["user", "manager", "admin"].map((role) => (
                      <TouchableOpacity
                        key={role}
                        disabled={updatingUserId === u.id}
                        onPress={() =>
                          handleRoleChange(u.id, (role || "user") as "user" | "manager" | "admin")
                        }
                        className={`flex-1 py-2 px-3 rounded ${
                          (u.role || "") === role
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                        style={{
                          opacity: updatingUserId === u.id ? 0.6 : 1,
                        }}
                      >
                        {updatingUserId === u.id ? (
                          <ActivityIndicator size="small" color={colors.foreground} />
                        ) : (
                          <Text
                            className={`text-center text-xs font-semibold capitalize ${
                              (u.role || "") === role
                                ? "text-background"
                                : "text-foreground"
                            }`}
                          >
                            {role}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
