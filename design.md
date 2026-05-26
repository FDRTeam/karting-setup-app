# Karting Setup Pro - App Design

## Overview
A mobile app for karting enthusiasts to track weather conditions, tire setup, chassis configuration, engine details, and weight distribution for optimal track performance.

## Screen List

1. **Home / Weather Screen** - Current track weather and conditions
2. **Tire Setup Screen** - Tire type, pressure, rim details
3. **Chassis Setup Screen** - Chassis type, caster, camber, toe, axle details
4. **Engine Setup Screen** - Engine type, serial number, specifications
5. **Weight Distribution Screen** - Tire weight distribution and cross-weight percentages
6. **Setup History / Sessions** - List of saved setups for different tracks
7. **Settings Screen** - App preferences, units (metric/imperial)

## Primary Content and Functionality

### Home / Weather Screen
- **Location Input**: Search or enter track name
- **Current Weather**: Temperature, humidity, wind speed, wind direction, track asphalt temperature
- **Weather Forecast**: 3-hour forecast for the track
- **Quick Stats**: Display key conditions affecting performance
- **Action**: "Start New Session" button to begin setup entry

### Tire Setup Screen
- **Tire Type**: Dropdown (soft, medium, hard, wet, etc.)
- **Tire Pressure**: Input field (PSI/bar)
- **Tire Rim Brand**: Text input
- **Tire Rim Metallurgy**: Dropdown (aluminum, magnesium, steel, etc.)
- **Tire Weight Distribution**: Percentage for each tire (FL, FR, RL, RR)

### Chassis Setup Screen
- **Chassis Type**: Dropdown (specific kart models)
- **Caster**: Input field (degrees)
- **Camber**: Input field (degrees)
- **Toe**: Input field (degrees)
- **Axle Brand**: Text input
- **Axle Type**: Dropdown (standard, adjustable, etc.)

### Engine Setup Screen
- **Engine Type**: Dropdown (2-stroke, 4-stroke, electric, etc.)
- **Engine Serial Number**: Text input
- **Engine Specifications**: Display key specs (displacement, power, etc.)

### Weight Distribution Screen
- **Tire Weight Distribution**: Visual representation (pie chart or bars)
  - Front Left (FL): Percentage
  - Front Right (FR): Percentage
  - Rear Left (RL): Percentage
  - Rear Right (RR): Percentage
- **Cross Weight**: Percentage (FL + RR vs FR + RL)
- **Balance Indicator**: Visual feedback on weight balance

### Setup History Screen
- **List of Sessions**: Chronological list of saved setups
- **Track Name**: Associated track
- **Date/Time**: When setup was created
- **Quick View**: Tap to see full setup details
- **Delete/Edit**: Options to manage setups

## Key User Flows

### Flow 1: Create New Session
1. User taps "Start New Session" on Home screen
2. Enters or selects track location
3. App fetches current weather for that location
4. User navigates through Tire, Chassis, Engine screens
5. Enters weight distribution data
6. Reviews summary and saves session
7. Session appears in Setup History

### Flow 2: View Session Details
1. User taps on a session in Setup History
2. App displays all setup parameters
3. User can view weather conditions from that session
4. Option to duplicate setup or edit

### Flow 3: Compare Sessions
1. User selects multiple sessions
2. App displays side-by-side comparison
3. Highlights differences in setup parameters

## Color Choices

- **Primary Brand Color**: Racing Red (#DC143C) - evokes speed and competition
- **Secondary Color**: Track Blue (#1E3A8A) - professional, trustworthy
- **Accent**: Neon Green (#00FF00) - highlights important data, performance metrics
- **Background**: Dark Charcoal (#1A1A1A) - reduces eye strain during outdoor use
- **Surface**: Darker Gray (#2D2D2D) - card backgrounds, elevated surfaces
- **Text Primary**: White (#FFFFFF) - maximum contrast on dark background
- **Text Secondary**: Light Gray (#CCCCCC) - secondary information
- **Success**: Bright Green (#22C55E) - optimal conditions, good setup
- **Warning**: Amber (#F59E0B) - conditions need attention
- **Error**: Red (#EF4444) - critical issues

## Design Principles

- **One-handed usage**: All interactive elements within thumb reach
- **Portrait orientation**: Optimized for 9:16 aspect ratio
- **iOS-first design**: Follows Apple Human Interface Guidelines
- **Dark mode default**: Reduces glare on sunny track days
- **Quick data entry**: Minimal typing, maximum dropdowns/selections
- **Visual feedback**: Clear indication of saved data and validation
