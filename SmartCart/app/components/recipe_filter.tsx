import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecipeFilterProps {
  onFilterChange: (filters: {
    price_range?: string;
    max_ready_time?: number;
    meal_type?: string;
  }) => void;
  currentFilters: {
    price_range?: string;
    max_ready_time?: number;
    meal_type?: string;
  };
}

const RecipeFilter: React.FC<RecipeFilterProps> = ({ onFilterChange, currentFilters }) => {
  const priceRanges = [
    { id: 'low', label: 'Budget', icon: 'wallet-outline' },
    { id: 'mid', label: 'Mid-Range', icon: 'cash-outline' },
    { id: 'expensive', label: 'Premium', icon: 'diamond-outline' },
  ];

  const timeOptions = [
    { id: 'quick', label: 'Quick (<15m)', icon: 'flash-outline' },
    { id: 'medium', label: 'Medium (15–30m)', icon: 'time-outline' },
    { id: 'long', label: 'Long (>30m)', icon: 'hourglass-outline' },
  ];
  
  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
    { id: 'main course', label: 'Lunch', icon: 'time-outline' },
    { id: 'main course', label: 'Dinner', icon: 'moon-outline' },
    { id: 'main course', label: 'Main Course', icon: 'restaurant-outline' },
    { id: 'appetizer', label: 'Appetizer', icon: 'pizza-outline' },
    { id: 'dessert', label: 'Dessert', icon: 'ice-cream-outline' },
  ];

  const handleFilterPress = (
    filterKey: 'price_range' | 'time_range' | 'meal_type',
    itemId: string | number
  ) => {
    if (currentFilters[filterKey] === itemId) {
      onFilterChange({
        ...currentFilters,
        [filterKey]: undefined,
      });
    } else {
      onFilterChange({
        ...currentFilters,
        [filterKey]: itemId,
      });
    }
  };

  const FilterSection = ({
    title,
    items,
    filterKey,
  }: {
    title: string;
    items: Array<{ id: string | number; label: string; icon: string }>;
    filterKey: 'price_range' | 'max_ready_time' | 'meal_type';
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {items.map((item, index) => {
          const isActive = currentFilters[filterKey] === item.id;

          return (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => handleFilterPress(filterKey, item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isActive ? '#fff' : '#666'}
              />
              <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FilterSection title="Price Range" items={priceRanges} filterKey="price_range" />
      <FilterSection title="Time Range" items={timeOptions} filterKey="time_range" />
      <FilterSection title="Meal Type" items={mealTypes} filterKey="meal_type" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});

export default RecipeFilter;
