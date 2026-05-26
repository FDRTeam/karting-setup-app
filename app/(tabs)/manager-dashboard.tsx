import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface Issue {
  id: number;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  reportedByUserId: number;
  assignedToManagerId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ManagerDashboardScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [newIssuePriority, setNewIssuePriority] = useState<"low" | "medium" | "high">("medium");

  const userRole = (user as any)?.role;

  // Check if user is manager or admin
  useEffect(() => {
    if (!isAuthenticated || (userRole !== "manager" && userRole !== "admin")) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, userRole]);

  // Fetch all issues
  const { data: issuesData } = trpc.issues.getAll.useQuery(undefined, {
    enabled: userRole === "manager" || userRole === "admin",
  });

  // Create issue mutation
  const createIssueMutation = trpc.issues.create.useMutation();
  const updateStatusMutation = trpc.issues.updateStatus.useMutation();

  useEffect(() => {
    if (issuesData?.success && issuesData.data) {
      setIssues(issuesData.data as Issue[]);
      setLoading(false);
    }
  }, [issuesData]);

  const handleCreateIssue = async () => {
    if (!newIssueTitle.trim()) {
      Alert.alert("Error", "Please enter an issue title");
      return;
    }

    try {
      await createIssueMutation.mutateAsync({
        title: newIssueTitle,
        description: newIssueDescription || undefined,
        priority: newIssuePriority,
      });

      Alert.alert("Success", "Issue created successfully");
      setNewIssueTitle("");
      setNewIssueDescription("");
      setNewIssuePriority("medium");
      setShowNewIssueForm(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create issue");
    }
  };

  const handleUpdateStatus = async (issueId: number, newStatus: "open" | "in_progress" | "resolved" | "closed") => {
    try {
      await updateStatusMutation.mutateAsync({
        issueId,
        status: newStatus,
      });
      Alert.alert("Success", "Issue status updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update issue");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-error/10";
      case "medium":
        return "bg-warning/10";
      case "low":
        return "bg-success/10";
      default:
        return "bg-surface";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-error/10";
      case "in_progress":
        return "bg-warning/10";
      case "resolved":
        return "bg-success/10";
      case "closed":
        return "bg-muted/10";
      default:
        return "bg-surface";
    }
  };

  if (!isAuthenticated || (userRole !== "manager" && userRole !== "admin")) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <Text className="text-foreground">Access Denied</Text>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="mt-4 text-muted">Loading issues...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Manager Dashboard</Text>
            <Text className="text-sm text-muted">
              Total Issues: {issues.length}
            </Text>
          </View>

          {/* New Issue Button */}
          <TouchableOpacity
            onPress={() => setShowNewIssueForm(!showNewIssueForm)}
            className="bg-primary px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-background font-semibold">
              {showNewIssueForm ? "Cancel" : "Report New Issue"}
            </Text>
          </TouchableOpacity>

          {/* New Issue Form */}
          {showNewIssueForm && (
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <Text className="text-lg font-semibold text-foreground">Report Issue</Text>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Title *</Text>
                <TextInput
                  placeholder="Issue title"
                  value={newIssueTitle}
                  onChangeText={setNewIssueTitle}
                  className="border border-border rounded-lg px-3 py-2 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
                <TextInput
                  placeholder="Issue description"
                  value={newIssueDescription}
                  onChangeText={setNewIssueDescription}
                  multiline
                  numberOfLines={4}
                  className="border border-border rounded-lg px-3 py-2 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Priority</Text>
                <View className="flex-row gap-2">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewIssuePriority(priority)}
                      className={`flex-1 py-2 rounded-lg items-center ${
                        newIssuePriority === priority ? "bg-primary" : "bg-surface border border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          newIssuePriority === priority ? "text-background" : "text-foreground"
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreateIssue}
                className="bg-success px-4 py-3 rounded-lg items-center"
              >
                <Text className="text-background font-semibold">Create Issue</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Issues List */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">All Issues</Text>

            {issues.length === 0 ? (
              <View className="bg-surface rounded-lg p-4 border border-border items-center">
                <Text className="text-muted">No issues found</Text>
              </View>
            ) : (
              issues.map((issue) => (
                <View
                  key={issue.id}
                  className={`rounded-lg p-4 border border-border gap-3 ${getStatusColor(issue.status)}`}
                >
                  <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {issue.title}
                      </Text>
                      {issue.description && (
                        <Text className="text-xs text-muted mt-1">
                          {issue.description}
                        </Text>
                      )}
                    </View>
                    <View className={`px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                      <Text className="text-xs font-semibold text-foreground">
                        {issue.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Status Buttons */}
                  <View className="flex-row gap-2 flex-wrap">
                    {(["open", "in_progress", "resolved", "closed"] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => handleUpdateStatus(issue.id, status)}
                        className={`px-3 py-1 rounded ${
                          issue.status === status
                            ? "bg-primary"
                            : "bg-surface border border-border"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            issue.status === status ? "text-background" : "text-foreground"
                          }`}
                        >
                          {status.replace("_", " ").toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-xs text-muted">
                    Reported by User {issue.reportedByUserId} • {new Date(issue.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
