import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const router = useRouter();

  function handleLogout() {
    // supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 flex-row justify-between items-center bg-white shadow-sm z-10">
        <Text className="text-2xl font-bold text-slate-800">Dashboard</Text>
        <TouchableOpacity 
          className="bg-slate-100 px-4 py-2 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-slate-600 font-medium">Log out</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="flex-row flex-wrap justify-between">
          
          {/* Stat Card 1 */}
          <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="w-10 h-10 bg-blue-100 rounded-full mb-3" />
            <Text className="text-slate-500 text-sm font-medium">Total Projects</Text>
            <Text className="text-2xl font-bold text-slate-800 mt-1">12</Text>
          </View>

          {/* Stat Card 2 */}
          <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="w-10 h-10 bg-green-100 rounded-full mb-3" />
            <Text className="text-slate-500 text-sm font-medium">Active Clients</Text>
            <Text className="text-2xl font-bold text-slate-800 mt-1">8</Text>
          </View>

          {/* Stat Card 3 */}
          <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="w-10 h-10 bg-purple-100 rounded-full mb-3" />
            <Text className="text-slate-500 text-sm font-medium">Pending Invoices</Text>
            <Text className="text-2xl font-bold text-slate-800 mt-1">3</Text>
          </View>

          {/* Stat Card 4 */}
          <View className="w-[48%] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-full mb-3" />
            <Text className="text-slate-500 text-sm font-medium">Total Value</Text>
            <Text className="text-2xl font-bold text-slate-800 mt-1">₹4.2M</Text>
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
