import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useState, useEffect } from "react";

interface TimePickerProps {
  value?: string; // HH:MM format (24-hour internally, display as 12-hour)
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [manualInput, setManualInput] = useState("");

  // Parse HH:MM to hour/minute/period
  const parseTime = (timeStr: string | undefined) => {
    if (!timeStr || !timeStr.trim()) return { hour: 12, minute: 0, period: "AM" };
    const parts = timeStr.split(":");
    if (parts.length !== 2) return { hour: 12, minute: 0, period: "AM" };
    
    let hour24 = parseInt(parts[0]);
    const minute = parseInt(parts[1]);
    
    if (isNaN(hour24) || isNaN(minute)) return { hour: 12, minute: 0, period: "AM" };
    
    const period = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    
    return { hour: hour12, minute, period };
  };

  const formatTime = (hour: number, minute: number, period: string) => {
    let hour24 = hour;
    if (period === "PM" && hour !== 12) hour24 += 12;
    if (period === "AM" && hour === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  // Update when value changes
  useEffect(() => {
    const newParsed = parseTime(value);
    setHour(newParsed.hour);
    setMinute(newParsed.minute);
    setPeriod(newParsed.period);
  }, [value]);

  const handleTimeSelect = () => {
    const timeStr = formatTime(hour, minute, period);
    onChange(timeStr);
    setShowModal(false);
  };

  const handleManualInput = () => {
    const parts = manualInput.split("/");
    if (parts.length === 2) {
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const p = parts[2]?.toUpperCase() || "AM";

      if (h > 0 && h <= 12 && m >= 0 && m < 60 && (p === "AM" || p === "PM")) {
        const timeStr = formatTime(h, m, p);
        onChange(timeStr);
        setManualInput("");
        setShowModal(false);
      }
    }
  };

  const displayTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;

  return (
    <View className="gap-2">
      {label && <Text className="text-xs text-muted">{label}</Text>}

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-background border border-border rounded-lg px-3 py-2 flex-row justify-between items-center"
      >
        <Text className="text-foreground flex-shrink" numberOfLines={1}>
          {displayTime}
        </Text>
        <Text className="text-muted">🕐</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end items-center pb-8">
          <View className="bg-surface rounded-t-3xl p-3 gap-2 w-11/12 self-center">
            {/* Header */}
            <Text className="text-sm font-semibold text-foreground">Select Time</Text>

            {/* Time Spinner */}
            <View className="flex-row gap-1 items-center justify-center py-2">
              {/* Hour */}
              <View className="items-center gap-0">
                <TouchableOpacity
                  onPress={() => setHour(hour === 12 ? 1 : hour + 1)}
                  className="bg-primary px-1 py-1 rounded"
                >
                  <Text className="text-background font-bold text-sm">▲</Text>
                </TouchableOpacity>

                <TextInput
                  value={String(hour).padStart(2, "0")}
                  onChangeText={(text) => {
                    const h = parseInt(text) || 0;
                    if (h > 0 && h <= 12) setHour(h);
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="bg-background text-foreground text-center text-base font-bold px-1 py-2 rounded border border-border w-12"
                />

                <TouchableOpacity
                  onPress={() => setHour(hour === 1 ? 12 : hour - 1)}
                  className="bg-primary px-1 py-1 rounded"
                >
                  <Text className="text-background font-bold text-sm">▼</Text>
                </TouchableOpacity>
              </View>

              {/* Separator */}
              <Text className="text-lg font-bold text-foreground">:</Text>

              {/* Minute */}
              <View className="items-center gap-0">
                <TouchableOpacity
                  onPress={() => setMinute(minute === 59 ? 0 : minute + 1)}
                  className="bg-primary px-1 py-1 rounded"
                >
                  <Text className="text-background font-bold text-sm">▲</Text>
                </TouchableOpacity>

                <TextInput
                  value={String(minute).padStart(2, "0")}
                  onChangeText={(text) => {
                    const m = parseInt(text) || 0;
                    if (m >= 0 && m < 60) setMinute(m);
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="bg-background text-foreground text-center text-base font-bold px-1 py-2 rounded border border-border w-12"
                />

                <TouchableOpacity
                  onPress={() => setMinute(minute === 0 ? 59 : minute - 1)}
                  className="bg-primary px-1 py-1 rounded"
                >
                  <Text className="text-background font-bold text-sm">▼</Text>
                </TouchableOpacity>
              </View>

              {/* Period - AM/PM Toggle */}
              <TouchableOpacity
                onPress={() => setPeriod(period === "AM" ? "PM" : "AM")}
                className="bg-primary px-2 py-1 rounded ml-1"
              >
                <Text className="text-background font-bold text-sm">{period}</Text>
              </TouchableOpacity>
            </View>

            {/* Manual Input */}
            <View className="gap-0.5 border-t border-border pt-1">
              <Text className="text-xs text-muted">Or enter (hh/mm/AM|PM)</Text>
              <View className="flex-row gap-0.5 flex-wrap">
                <TextInput
                  placeholder="hh/mm/AM"
                  placeholderTextColor="#9BA1A6"
                  value={manualInput}
                  onChangeText={setManualInput}
                  className="flex-1 min-w-24 bg-background text-foreground px-1 py-0.5 rounded text-xs border border-border"
                />
                <TouchableOpacity
                  onPress={handleManualInput}
                  className="bg-primary px-1.5 py-0.5 rounded items-center justify-center"
                >
                  <Text className="text-background font-semibold text-xs">Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-0.5 pt-0.5">
              <TouchableOpacity
                onPress={handleTimeSelect}
                className="flex-1 bg-success rounded py-1 items-center"
              >
                <Text className="text-background font-semibold text-xs">Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="flex-1 bg-background border border-border rounded py-1 items-center"
              >
                <Text className="text-foreground font-semibold text-xs">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
