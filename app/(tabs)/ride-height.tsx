import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenContainer } from '@/components/screen-container'
import { SelectPicker } from '@/components/select-picker'
import { useSession } from '@/lib/session-context'
import { useState } from 'react'

const FRONT_RIDE_HEIGHT_OPTIONS = [
  'Low - Both spacers on bottom of spindle',
  'Standard - One spacer on top, one spacer on bottom',
  'High - Both spacers on top of spindle',
]

const REAR_RIDE_HEIGHT_OPTIONS = [
  'Low - Bolts in top slot',
  'Standard - Bolts in middle slot',
  'High - Bolts in bottom slot',
]

const FRONT_RIDE_HEIGHT_VALUES: Record<string, string> = {
  'Low - Both spacers on bottom of spindle': 'Low',
  'Standard - One spacer on top, one spacer on bottom': 'Standard',
  'High - Both spacers on top of spindle': 'High',
}

const REAR_RIDE_HEIGHT_VALUES: Record<string, string> = {
  'Low - Bolts in top slot': 'Low',
  'Standard - Bolts in middle slot': 'Standard',
  'High - Bolts in bottom slot': 'High',
}

export default function RideHeightScreen() {
  const router = useRouter()
  const { currentSession, updateCurrentSession, saveCurrentSessionAsFinal } = useSession()
  const [frontRideHeight, setFrontRideHeight] = useState(currentSession?.rideHeightSetup?.frontRideHeight || '')
  const [rearRideHeight, setRearRideHeight] = useState(currentSession?.rideHeightSetup?.rearRideHeight || '')

  const handleSaveAndFinish = async () => {
    if (!frontRideHeight || !rearRideHeight) {
      alert('Please select both front and rear ride height')
      return
    }

    await updateCurrentSession({
      rideHeightSetup: {
        frontRideHeight,
        rearRideHeight,
      },
    })

    // Navigate to engine setup
    router.push('/(tabs)/engine')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity onPress={handleBack} activeOpacity={0.6}>
              <Text className="text-2xl text-primary mb-2">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Chassis Setup 3</Text>
            <Text className="text-sm text-muted">Set front and rear ride height positions</Text>
          </View>

          {/* Front Ride Height Section */}
          <View className="gap-3 bg-surface rounded-lg p-4">
            <Text className="text-lg font-semibold text-foreground">Front Ride Height</Text>
            <Text className="text-xs text-muted mb-2">Select spacer position</Text>
            <SelectPicker
              label="Front Ride Height"
              options={FRONT_RIDE_HEIGHT_OPTIONS}
              selectedValue={Object.keys(FRONT_RIDE_HEIGHT_VALUES).find(
                (k) => FRONT_RIDE_HEIGHT_VALUES[k] === frontRideHeight
              ) || ''}
              onValueChange={(label) => setFrontRideHeight(FRONT_RIDE_HEIGHT_VALUES[label])}
            />
          </View>

          {/* Rear Ride Height Section */}
          <View className="gap-3 bg-surface rounded-lg p-4">
            <Text className="text-lg font-semibold text-foreground">Rear Ride Height</Text>
            <Text className="text-xs text-muted mb-2">Select bolt position</Text>
            <SelectPicker
              label="Rear Ride Height"
              options={REAR_RIDE_HEIGHT_OPTIONS}
              selectedValue={Object.keys(REAR_RIDE_HEIGHT_VALUES).find(
                (k) => REAR_RIDE_HEIGHT_VALUES[k] === rearRideHeight
              ) || ''}
              onValueChange={(label) => setRearRideHeight(REAR_RIDE_HEIGHT_VALUES[label])}
            />
          </View>

          {/* Navigation Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity
              onPress={handleSaveAndFinish}
              className="bg-success rounded-lg py-3 active:opacity-80"
            >
              <Text className="text-center text-background font-semibold">Continue to Engine</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBack} className="bg-surface rounded-lg py-3 active:opacity-80">
              <Text className="text-center text-foreground font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}
