import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSpeedhiveEvents, useSpeedhiveLocations, useSpeedhiveSearch } from '@/hooks/use-speedhive';
import { SpeedhiveClient } from '@/lib/services/speedhive';
import type { SpeedhiveEvent } from '@/lib/services/speedhive';
import { cn } from '@/lib/utils';

interface SpeedhiveEventBrowserProps {
  onSelectEvent: (event: SpeedhiveEvent) => void;
  selectedEventId?: string;
}

/**
 * Speedhive Event Browser Component
 * 
 * Allows users to:
 * - Browse all available Speedhive events
 * - Filter by location
 * - Search for events
 * - Select an event to link to their setup
 */
export function SpeedhiveEventBrowser({
  onSelectEvent,
  selectedEventId,
}: SpeedhiveEventBrowserProps) {
  const [showModal, setShowModal] = useState(false);
  const [filterByLocation, setFilterByLocation] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'search'>('list');

  // Fetch events and locations
  const { events, loading: eventsLoading, error: eventsError } = useSpeedhiveEvents({
    locationId: filterByLocation,
    autoFetch: true,
  });

  const { locations, loading: locationsLoading } = useSpeedhiveLocations({
    autoFetch: true,
  });

  const { query, setQuery, results: searchResults, loading: searchLoading } =
    useSpeedhiveSearch({ type: 'events' });

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const displayEvents = viewMode === 'search' ? (searchResults as SpeedhiveEvent[]) : events;

  const handleSelectEvent = (event: SpeedhiveEvent) => {
    onSelectEvent(event);
    setShowModal(false);
  };

  const formatEventDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-success/10 border-success';
      case 'completed':
        return 'bg-primary/10 border-primary';
      case 'scheduled':
        return 'bg-warning/10 border-warning';
      default:
        return 'bg-border/10 border-border';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View className="gap-2">
      <Text className="text-xs text-muted">Speedhive Event</Text>

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-background border border-border rounded-lg px-3 py-3 flex-row justify-between items-center"
      >
        <Text
          className={cn(
            'flex-1',
            selectedEvent ? 'text-foreground font-semibold' : 'text-muted'
          )}
          numberOfLines={1}
        >
          {selectedEvent ? selectedEvent.name : 'Select an event...'}
        </Text>
        <Text className="text-muted text-lg">›</Text>
      </TouchableOpacity>

      {selectedEvent && (
        <View className="bg-surface rounded-lg p-3 gap-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xs text-muted">Date</Text>
              <Text className="text-sm font-semibold text-foreground">
                {formatEventDate(selectedEvent.date)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted">Location</Text>
              <Text className="text-sm font-semibold text-foreground">
                {selectedEvent.location}
              </Text>
            </View>
          </View>
          {selectedEvent.participants && (
            <View>
              <Text className="text-xs text-muted">Participants</Text>
              <Text className="text-sm font-semibold text-foreground">
                {selectedEvent.participants}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Event Browser Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl max-h-4/5 flex-1">
            {/* Header */}
            <View className="p-4 border-b border-border flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">
                {viewMode === 'search' ? 'Search Events' : 'Browse Events'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            {/* View Mode Tabs */}
            <View className="flex-row border-b border-border">
              <TouchableOpacity
                onPress={() => {
                  setViewMode('list');
                  setQuery('');
                }}
                className={cn(
                  'flex-1 p-3 border-b-2',
                  viewMode === 'list'
                    ? 'border-primary'
                    : 'border-transparent'
                )}
              >
                <Text
                  className={cn(
                    'text-center font-semibold',
                    viewMode === 'list' ? 'text-primary' : 'text-muted'
                  )}
                >
                  All Events
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('search')}
                className={cn(
                  'flex-1 p-3 border-b-2',
                  viewMode === 'search'
                    ? 'border-primary'
                    : 'border-transparent'
                )}
              >
                <Text
                  className={cn(
                    'text-center font-semibold',
                    viewMode === 'search' ? 'text-primary' : 'text-muted'
                  )}
                >
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {viewMode === 'search' && (
              <View className="p-4 border-b border-border">
                <TextInput
                  placeholder="Search events..."
                  placeholderTextColor="#9BA1A6"
                  value={query}
                  onChangeText={setQuery}
                  className="bg-background text-foreground px-3 py-2 rounded border border-border"
                />
              </View>
            )}

            {/* Location Filter */}
            {viewMode === 'list' && !locationsLoading && locations.length > 0 && (
              <View className="p-4 border-b border-border">
                <Text className="text-xs text-muted mb-2">Filter by Location</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-2"
                >
                  <TouchableOpacity
                    onPress={() => setFilterByLocation(undefined)}
                    className={cn(
                      'px-3 py-1 rounded-full border',
                      !filterByLocation
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        !filterByLocation ? 'text-background' : 'text-foreground'
                      )}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {locations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      onPress={() => setFilterByLocation(location.id)}
                      className={cn(
                        'px-3 py-1 rounded-full border',
                        filterByLocation === location.id
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          filterByLocation === location.id
                            ? 'text-background'
                            : 'text-foreground'
                        )}
                      >
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Loading State */}
            {(eventsLoading || searchLoading) && (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0a7ea4" />
                <Text className="text-muted text-sm mt-2">Loading events...</Text>
              </View>
            )}

            {/* Error State */}
            {eventsError && !eventsLoading && (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-error text-center">{eventsError}</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="mt-4 bg-primary px-4 py-2 rounded"
                >
                  <Text className="text-background font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Events List */}
            {!eventsLoading && !searchLoading && displayEvents.length > 0 && (
              <FlatList
                data={displayEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectEvent(item)}
                    className={cn(
                      'p-4 border-b border-border',
                      selectedEventId === item.id && 'bg-primary/5'
                    )}
                  >
                    <View className="gap-2">
                      <View className="flex-row justify-between items-start gap-2">
                        <Text className="flex-1 text-sm font-semibold text-foreground">
                          {item.name}
                        </Text>
                        <View
                          className={cn(
                            'px-2 py-1 rounded border',
                            getStatusColor(item.status)
                          )}
                        >
                          <Text className="text-xs font-semibold text-foreground">
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between">
                        <View>
                          <Text className="text-xs text-muted">Date</Text>
                          <Text className="text-xs font-semibold text-foreground">
                            {formatEventDate(item.date)}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted">Location</Text>
                          <Text className="text-xs font-semibold text-foreground">
                            {item.location}
                          </Text>
                        </View>
                        {item.participants && (
                          <View>
                            <Text className="text-xs text-muted">Participants</Text>
                            <Text className="text-xs font-semibold text-foreground">
                              {item.participants}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Empty State */}
            {!eventsLoading && !searchLoading && displayEvents.length === 0 && (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-muted text-center">
                  {viewMode === 'search'
                    ? 'No events found. Try a different search.'
                    : 'No events available.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
