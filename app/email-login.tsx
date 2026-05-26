import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { trpc } from "@/lib/trpc";

export default function EmailLoginScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create mutations
  const signupMutation = trpc.auth.emailSignup.useMutation();
  const loginMutation = trpc.auth.emailLogin.useMutation();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Call emailSignup mutation
        const result = await signupMutation.mutateAsync({
          email,
          password,
          name: name || undefined,
        });

        if (!result.success) {
          setError(result.error || "Signup failed");
          setLoading(false);
          return;
        }
      } else {
        // Call emailLogin mutation
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });

        if (!result.success) {
          setError(result.error || "Login failed");
          setLoading(false);
          return;
        }
      }

      // Success - redirect to home
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="gap-2 items-center mb-4">
            <Text className="text-3xl font-bold text-foreground">
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
            <Text className="text-sm text-muted text-center">
              {isSignUp ? "Get started with Karting Setup Pro" : "Welcome back to Karting Setup Pro"}
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="gap-4">
            {isSignUp && (
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholderTextColor="#687076"
                />
              </View>
            )}

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
              <TextInput
                placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#687076"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !email || !password || (isSignUp && !name)}
            className={`px-6 py-4 rounded-lg items-center ${
              loading || !email || !password || (isSignUp && !name)
                ? "bg-primary/50"
                : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-bold text-lg">
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Sign Up / Sign In */}
          <View className="flex-row justify-center gap-2">
            <Text className="text-sm text-muted">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading}>
              <Text className="text-sm text-primary font-semibold">
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} disabled={loading}>
            <Text className="text-center text-sm text-muted">← Back to login options</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
