import { ScrollView, View, Text, Pressable, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { ScreenContainer } from '@/components/screen-container'
import { SelectPicker } from '@/components/select-picker'
import { useSession } from '@/lib/session-context'
import { useState } from 'react'

const FRONT_WIDTH_OPTIONS = [
  '5mm - One small spacer',
  '10mm - One large spacer',
  '15mm - One small, one large spacer',
  '20mm - Two large spacers',
  '25mm - One small, two large spacers',
  '30mm - Three large spacers',
  '35mm - One small, three large spacers',
  '40mm - Four large spacers',
  '45mm - One small, four large spacers',
  '50mm - Five large spacers',
]

const REAR_WIDTH_UNIT_OPTIONS = [
  'Millimeters (mm)',
  'Inches (in)',
]

const FRONT_WIDTH_VALUES: Record<string, string> = {
  '5mm - One small spacer': '5mm',
  '10mm - One large spacer': '10mm',
  '15mm - One small, one large spacer': '15mm',
  '20mm - Two large spacers': '20mm',
  '25mm - One small, two large spacers': '25mm',
  '30mm - Three large spacers': '30mm',
  '35mm - One small, three large spacers': '35mm',
  '40mm - Four large spacers': '40mm',
  '45mm - One small, four large spacers': '45mm',
  '50mm - Five large spacers': '50mm',
}

const REAR_WIDTH_UNIT_VALUES: Record<string, string> = {
  'Millimeters (mm)': 'mm',
  'Inches (in)': 'inches',
}

export default function WidthScreen() {
  const router = useRouter()
  const { currentSession, updateCurrentSession } = useSession()
  const [frontWidth, setFrontWidth] = useState(currentSession?.widthSetup?.frontWidth || '')
  const [rearWidth, setRearWidth] = useState(currentSession?.widthSetup?.rearWidth?.toString() || '')
  const [rearWidthUnit, setRearWidthUnit] = useState(currentSession?.widthSetup?.rearWidthUnit || 'mm')

  const handleContinue = async () => {
    if (!frontWidth || !rearWidth) {
      alert('Please fill in all width fields')
      return
    }

    await updateCurrentSession({
      widthSetup: {
        frontWidth,
        rearWidth: parseFloat(rearWidth),
        rearWidthUnit,
      },
    })

    router.push('/(tabs)/ride-height')
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
            <Text className="text-2xl font-bold text-foreground">Chassis Setup 2</Text>
            <Text className="text-sm text-muted">Set front and rear width measurements</Text>
          </View>

          {/* Front Width Section */}
          <View className="gap-3 bg-surface rounded-lg p-4">
            <Text className="text-lg font-semibold text-foreground">Front Width</Text>
            <Text className="text-xs text-muted mb-2">Select spacer configuration</Text>
            <SelectPicker
              label="Front Width"
              options={FRONT_WIDTH_OPTIONS}
              selectedValue={Object.keys(FRONT_WIDTH_VALUES).find(k => FRONT_WIDTH_VALUES[k] === frontWidth) || ''}
              onValueChange={(label) => setFrontWidth(FRONT_WIDTH_VALUES[label])}
            />
          </View>

          {/* Rear Width Section */}
          <View className="gap-3 bg-surface rounded-lg p-4">
            <Text className="text-lg font-semibold text-foreground">Rear Width</Text>
            <Text className="text-xs text-muted mb-2">Measure from outer edge of rim to outer edge of rim</Text>

            {/* Unit Selector */}
            <View className="gap-2 mb-3">
              <Text className="text-sm text-muted">Unit</Text>
              <SelectPicker
                label="Unit"
                options={REAR_WIDTH_UNIT_OPTIONS}
                selectedValue={Object.keys(REAR_WIDTH_UNIT_VALUES).find(k => REAR_WIDTH_UNIT_VALUES[k] === rearWidthUnit) || ''}
                onValueChange={(label) => setRearWidthUnit(REAR_WIDTH_UNIT_VALUES[label])}
              />
            </View>

            {/* Rear Width Input */}
            <View className="gap-2">
              <Text className="text-sm text-muted">
                Measurement ({rearWidthUnit === 'mm' ? 'mm' : 'inches'})
              </Text>
              <View className="border border-border rounded-lg bg-background">
                <input
                  type="number"
                  placeholder={`Enter ${rearWidthUnit === 'mm' ? 'mm' : 'inches'}`}
                  value={rearWidth}
                  onChange={(e) => setRearWidth(e.target.value)}
                  className="w-full px-3 py-2 text-foreground bg-background rounded-lg border-0"
                  style={{ outline: 'none' }}
                />
              </View>
            </View>
          </View>

            {/* Navigation Buttons */}
          <View className="gap-3 mt-6">
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-success rounded-lg py-3 active:opacity-80"
            >
              <Text className="text-center text-background font-semibold">Continue to Chassis Setup 3</Text>
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
