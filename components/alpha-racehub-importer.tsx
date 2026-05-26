import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAlphaRacehubCSVImport, useFormatLapTime } from '@/hooks/use-alpha-racehub';
import { AlphaRacehubEventCreator } from '@/lib/services/alpha-racehub';
import type { AlphaRacehubEvent, AlphaRacehubLapTime } from '@/lib/services/alpha-racehub';
import { cn } from '@/lib/utils';

interface AlphaRacehubImporterProps {
  onImportComplete: (event: AlphaRacehubEvent, lapTimes: AlphaRacehubLapTime[]) => void;
  participantId: string;
  participantName: string;
}

/**
 * Alpha Racehub CSV Importer Component
 * 
 * Allows users to:
 * 1. Import lap times from Alpha Racehub CSV export
 * 2. Create manual event and add lap times
 * 3. Review imported data before saving
 */
export function AlphaRacehubImporter({
  onImportComplete,
  participantId,
  participantName,
}: AlphaRacehubImporterProps) {
  const [showModal, setShowModal] = useState(false);
  const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
  const [manualEvent, setManualEvent] = useState<AlphaRacehubEvent | null>(null);
  const [manualLapTimes, setManualLapTimes] = useState<AlphaRacehubLapTime[]>([]);

  // Manual event form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventLocation, setEventLocation] = useState('');
  const [trackLayout, setTrackLayout] = useState('');

  // Manual lap entry state
  const [lapNumber, setLapNumber] = useState('');
  const [lapTimeStr, setLapTimeStr] = useState('');
  const [lapNotes, setLapNotes] = useState('');

  // CSV import hook
  const csvImport = useAlphaRacehubCSVImport({
    eventId: `alpha-${Date.now()}`,
    participantId,
    participantName,
  });

  const handleCSVImport = async () => {
    await csvImport.importCSV();
  };

  const handleCreateManualEvent = () => {
    if (!eventName || !eventDate || !eventLocation) {
      alert('Please fill in all required fields');
      return;
    }

    const event = AlphaRacehubEventCreator.createManualEvent(
      eventName,
      eventDate,
      eventLocation,
      trackLayout
    );

    setManualEvent(event);
    setImportMode('manual');
  };

  const handleAddManualLapTime = () => {
    if (!lapNumber || !lapTimeStr) {
      alert('Please enter lap number and time');
      return;
    }

    try {
      const lapNumberInt = parseInt(lapNumber);
      const lapTimeMs = parseFloat(lapTimeStr) * 1000; // Assume input is in seconds

      if (isNaN(lapNumberInt) || isNaN(lapTimeMs)) {
        alert('Invalid lap number or time');
        return;
      }

      const lapTime = AlphaRacehubEventCreator.createManualLapTime(
        manualEvent?.id || '',
        participantId,
        participantName,
        lapNumberInt,
        Math.round(lapTimeMs),
        lapNotes || undefined
      );

      setManualLapTimes((prev) => [...prev, lapTime]);
      setLapNumber('');
      setLapTimeStr('');
      setLapNotes('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add lap time');
    }
  };

  const handleCompleteImport = () => {
    if (csvImport.result?.success && csvImport.result.event && csvImport.result.lapTimes) {
      onImportComplete(csvImport.result.event, csvImport.result.lapTimes);
      setShowModal(false);
      csvImport.reset();
    } else if (manualEvent && manualLapTimes.length > 0) {
      onImportComplete(manualEvent, manualLapTimes);
      setShowModal(false);
      setManualEvent(null);
      setManualLapTimes([]);
    } else {
      alert('No data to import');
    }
  };

  const handleReset = () => {
    csvImport.reset();
    setImportMode('csv');
    setManualEvent(null);
    setManualLapTimes([]);
    setEventName('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventLocation('');
    setTrackLayout('');
    setLapNumber('');
    setLapTimeStr('');
    setLapNotes('');
  };

  const hasData =
    (csvImport.result?.success && csvImport.result.lapTimes && csvImport.result.lapTimes.length > 0) ||
    manualLapTimes.length > 0;

  return (
    <View className="gap-2">
      <Text className="text-xs text-muted">Alpha Racehub Lap Times</Text>

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-background border border-border rounded-lg px-3 py-3 flex-row justify-between items-center"
      >
        <Text className="text-muted flex-1">Import lap times...</Text>
        <Text className="text-muted text-lg">›</Text>
      </TouchableOpacity>

      {/* Import Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl max-h-4/5 flex-1">
            {/* Header */}
            <View className="p-4 border-b border-border flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                {importMode === 'csv' && !csvImport.result?.success
                  ? 'Import from CSV'
                  : importMode === 'csv'
                    ? 'Review Import'
                    : 'Add Lap Times'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-primary font-semibold">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Mode Tabs */}
            {!csvImport.result?.success && !manualEvent && (
              <View className="flex-row border-b border-border">
                <TouchableOpacity
                  onPress={() => setImportMode('csv')}
                  className={cn(
                    'flex-1 p-3 border-b-2',
                    importMode === 'csv'
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                >
                  <Text
                    className={cn(
                      'text-center font-semibold',
                      importMode === 'csv' ? 'text-primary' : 'text-muted'
                    )}
                  >
                    CSV Import
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setImportMode('manual')}
                  className={cn(
                    'flex-1 p-3 border-b-2',
                    importMode === 'manual'
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                >
                  <Text
                    className={cn(
                      'text-center font-semibold',
                      importMode === 'manual' ? 'text-primary' : 'text-muted'
                    )}
                  >
                    Manual Entry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView className="flex-1 p-4">
              {/* CSV Import Mode */}
              {importMode === 'csv' && !csvImport.result?.success && (
                <View className="gap-4">
                  <View>
                    <Text className="text-sm text-muted mb-2">
                      Export lap times from Alpha Racehub as CSV and select the file to import.
                    </Text>
                  </View>

                  {csvImport.error && (
                    <View className="bg-error/10 border border-error rounded-lg p-3">
                      <Text className="text-error text-sm">{csvImport.error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={handleCSVImport}
                    disabled={csvImport.loading}
                    className="bg-primary rounded-lg p-4 items-center"
                  >
                    {csvImport.loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-background font-semibold">
                        Select CSV File
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* CSV Review Mode */}
              {csvImport.result?.success && csvImport.result.lapTimes && (
                <View className="gap-4">
                  {csvImport.result.event && (
                    <View className="bg-primary/10 border border-primary rounded-lg p-3 gap-2">
                      <Text className="font-semibold text-foreground">
                        {csvImport.result.event.name}
                      </Text>
                      <Text className="text-xs text-muted">
                        {csvImport.result.event.location} •{' '}
                        {new Date(csvImport.result.event.date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text className="text-sm font-semibold text-foreground mb-2">
                      Lap Times ({csvImport.result.lapTimes.length})
                    </Text>
                    <FlatList
                      data={csvImport.result.lapTimes}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <View className="bg-background rounded p-2 mb-1 flex-row justify-between">
                          <Text className="text-xs font-semibold text-foreground">
                            Lap {item.lapNumber}
                          </Text>
                          <Text className="text-xs text-primary font-bold">
                            {useFormatLapTime(item.lapTime)}
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  {csvImport.result.warnings.length > 0 && (
                    <View className="bg-warning/10 border border-warning rounded-lg p-3">
                      <Text className="text-warning text-xs font-semibold mb-1">
                        Warnings
                      </Text>
                      {csvImport.result.warnings.map((warning, idx) => (
                        <Text key={idx} className="text-warning text-xs">
                          • {warning}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Manual Entry Mode - Event Creation */}
              {importMode === 'manual' && !manualEvent && (
                <View className="gap-3">
                  <View>
                    <Text className="text-xs text-muted mb-1">Event Name *</Text>
                    <TextInput
                      placeholder="e.g., Saturday Practice"
                      placeholderTextColor="#9BA1A6"
                      value={eventName}
                      onChangeText={setEventName}
                      className="bg-background text-foreground px-3 py-2 rounded border border-border"
                    />
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Date *</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9BA1A6"
                      value={eventDate}
                      onChangeText={setEventDate}
                      className="bg-background text-foreground px-3 py-2 rounded border border-border"
                    />
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Location *</Text>
                    <TextInput
                      placeholder="e.g., Norway Motorsports"
                      placeholderTextColor="#9BA1A6"
                      value={eventLocation}
                      onChangeText={setEventLocation}
                      className="bg-background text-foreground px-3 py-2 rounded border border-border"
                    />
                  </View>

                  <View>
                    <Text className="text-xs text-muted mb-1">Track Layout</Text>
                    <TextInput
                      placeholder="e.g., Lawson"
                      placeholderTextColor="#9BA1A6"
                      value={trackLayout}
                      onChangeText={setTrackLayout}
                      className="bg-background text-foreground px-3 py-2 rounded border border-border"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleCreateManualEvent}
                    className="bg-primary rounded-lg p-3 items-center mt-2"
                  >
                    <Text className="text-background font-semibold">
                      Create Event
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Manual Entry Mode - Lap Times */}
              {importMode === 'manual' && manualEvent && (
                <View className="gap-3">
                  <View className="bg-primary/10 border border-primary rounded-lg p-3 gap-1">
                    <Text className="font-semibold text-foreground">
                      {manualEvent.name}
                    </Text>
                    <Text className="text-xs text-muted">
                      {manualEvent.location}
                    </Text>
                  </View>

                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="text-xs text-muted mb-1">Lap #</Text>
                        <TextInput
                          placeholder="1"
                          placeholderTextColor="#9BA1A6"
                          value={lapNumber}
                          onChangeText={setLapNumber}
                          keyboardType="number-pad"
                          className="bg-background text-foreground px-3 py-2 rounded border border-border"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted mb-1">Time (sec)</Text>
                        <TextInput
                          placeholder="65.432"
                          placeholderTextColor="#9BA1A6"
                          value={lapTimeStr}
                          onChangeText={setLapTimeStr}
                          keyboardType="decimal-pad"
                          className="bg-background text-foreground px-3 py-2 rounded border border-border"
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-xs text-muted mb-1">Notes</Text>
                      <TextInput
                        placeholder="Optional notes"
                        placeholderTextColor="#9BA1A6"
                        value={lapNotes}
                        onChangeText={setLapNotes}
                        className="bg-background text-foreground px-3 py-2 rounded border border-border"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleAddManualLapTime}
                      className="bg-primary rounded-lg p-2 items-center"
                    >
                      <Text className="text-background font-semibold text-sm">
                        Add Lap Time
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {manualLapTimes.length > 0 && (
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">
                        Added Lap Times ({manualLapTimes.length})
                      </Text>
                      <FlatList
                        data={manualLapTimes}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View className="bg-background rounded p-2 mb-1 flex-row justify-between items-center">
                            <View>
                              <Text className="text-xs font-semibold text-foreground">
                                Lap {item.lapNumber}
                              </Text>
                              {item.notes && (
                                <Text className="text-xs text-muted">
                                  {item.notes}
                                </Text>
                              )}
                            </View>
                            <Text className="text-xs text-primary font-bold">
                              {useFormatLapTime(item.lapTime)}
                            </Text>
                          </View>
                        )}
                      />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            {hasData && (
              <View className="p-4 border-t border-border flex-row gap-2">
                <TouchableOpacity
                  onPress={handleReset}
                  className="flex-1 bg-background border border-border rounded-lg p-3 items-center"
                >
                  <Text className="text-foreground font-semibold">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCompleteImport}
                  className="flex-1 bg-primary rounded-lg p-3 items-center"
                >
                  <Text className="text-background font-semibold">Import</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
