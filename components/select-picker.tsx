import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SelectPickerProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function SelectPicker({
  options,
  selectedValue,
  onValueChange,
  label,
}: SelectPickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="pb-4">
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-background border border-border rounded-lg px-3 py-3 flex-row justify-between items-center"
      >
        <Text className={cn("flex-1", selectedValue ? "text-foreground" : "text-muted")}>
          {selectedValue || label || "Select an option"}
        </Text>
        <Text className="text-muted text-lg">›</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          onPress={() => setVisible(false)}
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
        >
          <View className="bg-surface rounded-t-3xl max-h-96 pb-32">
            <View className="p-4 border-b border-border flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                {label || "Select an option"}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item);
                    setVisible(false);
                  }}
                  className={cn(
                    "p-4 border-b border-border",
                    selectedValue === item && "bg-primary/10"
                  )}
                >
                  <Text
                    className={cn(
                      "text-foreground",
                      selectedValue === item && "font-semibold text-primary"
                    )}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
