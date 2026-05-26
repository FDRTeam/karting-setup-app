import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useState, useEffect } from "react";

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [manualInput, setManualInput] = useState("");
  
  // Parse value safely without timezone issues
  const parseLocalDate = (dateStr: string | undefined) => {
    if (!dateStr || !dateStr.trim()) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return { year, month, day };
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const parsed = parseLocalDate(value);
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(parsed?.month ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(parsed?.year ?? today.getFullYear());

  // Update month/year when value changes
  useEffect(() => {
    const newParsed = parseLocalDate(value);
    if (newParsed) {
      setCurrentMonth(newParsed.month);
      setCurrentYear(newParsed.year);
    }
  }, [value]);

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    onChange(dateStr);
    setShowModal(false);
  };

  const handleManualInput = () => {
    const parts = manualInput.split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);

      if (month >= 0 && month < 12 && day > 0 && day <= 31 && year > 1900) {
        const dateStr = formatDateString(year, month, day);
        onChange(dateStr);
        setManualInput("");
        setShowModal(false);
      }
    }
  };

  const displayDate = parsed
    ? `${String(parsed.month + 1).padStart(2, "0")}/${String(parsed.day).padStart(2, "0")}/${parsed.year}`
    : "Not set";

  const daysArray = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }, (_, i) => i);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < emptyDays.length; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth(currentMonth, currentYear); i++) {
    calendarDays.push(i);
  }

  return (
    <View className="gap-2">
      {label && <Text className="text-xs text-muted">{label}</Text>}

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-background border border-border rounded-lg px-3 py-2 flex-row justify-between items-center"
      >
        <Text className="text-foreground">{displayDate}</Text>
        <Text className="text-muted">📅</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl p-4 gap-3">
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                <Text className="text-2xl text-primary font-bold">‹</Text>
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-foreground">{monthName}</Text>

              <TouchableOpacity
                onPress={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                <Text className="text-2xl text-primary font-bold">›</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View className="gap-2">
              {/* Day headers */}
              <View className="flex-row justify-between gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <Text key={day} className="flex-1 text-center text-xs text-muted font-semibold">
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar weeks */}
              <View>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, week) => (
                  <View key={week} className="flex-row justify-between gap-1 mb-1">
                    {Array.from({ length: 7 }).map((_, dayOfWeek) => {
                      const dayNumber = calendarDays[week * 7 + dayOfWeek];
                      const isSelected = dayNumber && parsed && parsed.year === currentYear && parsed.month === currentMonth && parsed.day === dayNumber;

                      return (
                        <TouchableOpacity
                          key={`${week}-${dayOfWeek}`}
                          disabled={!dayNumber}
                          onPress={() => dayNumber && handleDateSelect(dayNumber)}
                          className={`flex-1 aspect-square rounded-lg items-center justify-center ${
                            dayNumber
                              ? isSelected
                                ? "bg-primary"
                                : "bg-background border border-border"
                              : "bg-transparent"
                          }`}
                        >
                          {dayNumber && (
                            <Text
                              className={`text-sm font-semibold ${
                                isSelected ? "text-background" : "text-foreground"
                              }`}
                            >
                              {dayNumber}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Manual Input */}
            <View className="gap-2 border-t border-border pt-3">
              <Text className="text-xs text-muted">Or enter manually (mm/dd/yyyy)</Text>
              <View className="flex-row gap-2">
                <TextInput
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor="#9BA1A6"
                  value={manualInput}
                  onChangeText={setManualInput}
                  keyboardType="numeric"
                  className="flex-1 bg-background text-foreground px-3 py-2 rounded-lg border border-border"
                />
                <TouchableOpacity
                  onPress={handleManualInput}
                  className="bg-primary px-4 py-2 rounded-lg items-center justify-center"
                >
                  <Text className="text-background font-semibold text-sm">Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="bg-background border border-border rounded-lg py-2 items-center"
            >
              <Text className="text-foreground font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
