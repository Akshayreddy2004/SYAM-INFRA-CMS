import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError(null);
    // For now, this is just a dummy login that proceeds to dashboard
    // Once Supabase auth is fully configured, we uncomment this:
    /*
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    */
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4 shadow-lg">
            <Text className="text-white text-3xl font-bold">SI</Text>
          </View>
          <Text className="text-3xl font-bold text-slate-800">SYAM INFRA</Text>
          <Text className="text-slate-500 mt-2">Management System Login</Text>
        </View>

        {error && (
          <View className="bg-red-100 p-3 rounded-xl mb-4 border border-red-200">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        <View className="space-y-4">
          <View>
            <Text className="text-slate-700 font-medium mb-1.5 ml-1">Email Address</Text>
            <TextInput
              className="w-full bg-white px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 shadow-sm"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-slate-700 font-medium mb-1.5 ml-1 mt-4">Password</Text>
            <TextInput
              className="w-full bg-white px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 shadow-sm"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-md shadow-blue-300 mt-8"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
