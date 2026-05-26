# Karting Setup Pro - Project TODO

## Core Features

- [x] Weather integration (fetch current conditions and forecast)
- [x] Location/track search functionality
- [x] Tire setup screen (type, pressure, rim brand, rim metallurgy)
- [x] Chassis setup screen (type, caster, camber, toe, axle details)
- [x] Engine setup screen (type, serial number)
- [x] Weight distribution screen (tire percentages, cross-weight)
- [x] Setup history/sessions list
- [x] Save and persist setups locally
- [x] View session details
- [x] Delete sessions
- [ ] Edit existing sessions
- [ ] Settings screen (units, preferences)

## UI/UX Tasks

- [x] Design and implement app branding (logo, colors)
- [x] Create tab navigation structure
- [x] Implement responsive layouts for all screens
- [x] Add form validation and error handling
- [x] Create loading states for API calls
- [ ] Add haptic feedback for interactions
- [x] Implement dark mode (default)

## Technical Tasks

- [x] Set up weather API integration (Open-Meteo)
- [x] Configure local data storage (AsyncStorage)
- [x] Create data models/types for setups
- [x] Implement data persistence layer
- [ ] Add unit conversion (metric/imperial)
- [x] Set up error handling and logging
- [x] Create session context for state management
- [x] Create custom SelectPicker component

## Testing & Polish

- [x] Unit tests for data types and calculations
- [ ] Test weather API integration end-to-end
- [ ] Test data persistence
- [ ] Verify all user flows work end-to-end
- [ ] Test on iOS and Android
- [ ] Performance optimization
- [ ] Accessibility review

## New Features - Phase 2

- [ ] Add USA kart tracks database with coordinates
- [ ] Create track selection dropdown
- [ ] Auto-populate weather based on selected track
- [ ] Create settings screen for unit preferences
- [ ] Implement unit conversion system (mph/kmh, F/C, inches/mm)
- [ ] Update weather display to use selected units
- [ ] Update all measurement inputs to use selected units
- [ ] Persist user unit preferences


## App Renaming & Data Sharing - Phase 3

- [x] Rename app to "FDR Kart Setup Data"
- [x] Update app.config.ts with new name
- [x] Create data export/import service
- [x] Create shareable setup format (JSON with metadata)
- [x] Create share code generation for direct user-to-user sharing
- [x] Add import setup from file/share functionality
- [x] Add Settings screen with customizable units
- [x] Add Import screen for loading shared setups
- [x] Create ShareSetupModal component
- [ ] Add share button to session detail view
- [ ] Add QR code generation for setup sharing
- [ ] Test data sharing end-to-end


## Track Database Update - Phase 4

- [x] Delete all existing tracks from tracks.ts
- [x] Add Norway Motorsports Park (Sheridan, IL)
- [x] Add New Castle Motorsports Park (Spiceland, IN)
- [x] Add Gateway Kartplex (Madison, IL)
- [x] Add Mid-State Kart Club (Springfield, IL)
- [x] Add Badger Kart Club (Dousman, WI)
- [x] Add Road America Kartplex (Elkhart Lake, WI)
- [x] Add K1 Circuit Whiteland (Whiteland, IN)
- [x] Test weather auto-population for each track


## Engine & Chassis Updates - Phase 5

- [x] Change axle type to axle stiffness
- [x] Add axle stiffness dropdown with options: S, M1, M2, M3, H1, H2
- [x] Change engine type to dropdown menu
- [x] Add engine type options: B+S LO206, IAME Micro-Swift, IAME Mini-Swift, IAME KA100 Jr, IAME KA100 Sr
- [x] Add chassis serial number field to chassis screen
- [x] Update KartingSession type to include axle stiffness and chassis serial number
- [x] Test all new dropdown fields and validation


## Field Updates - Phase 6

- [x] Remove tire weight distribution from TireSetup interface
- [x] Add TB Kart to CHASSIS_TYPES
- [x] Rename geometry section to "Front End"
- [x] Remove horsepower field from engine setup
- [x] Change tire weights to weight distribution in tire screen
- [x] Update TireSetup type to remove tireWeightDistribution
- [x] Update tire screen UI to reflect new layout
- [x] Test all changes compile and work correctly


## UI & Field Updates - Phase 7

- [x] Update SelectPicker to show arrow on right side
- [x] Rename "Engine Setup" to "Engine" in tab bar (already correct)
- [x] Add kart number field to weather/track selection screen
- [x] Add track layout dropdown (Lawson, National, Coyote)
- [x] Update tire types: MG Orange, MG Red, Vega Red
- [x] Change tire pressures to individual PSI fields (FL, FR, RL, RR)
- [x] Update TireSetup type to reflect new pressure structure
- [x] Update KartingSession type with kartNumber and trackLayout
- [x] Test all dropdown styling and functionality


## Remove Tire Weights - Phase 8

- [x] Remove tire weight distribution section from tires.tsx screen
- [x] Remove weightDistribution from TireSetup display
- [x] Test tire setup screen renders correctly


## Chassis & Tire Configuration Updates - Phase 9

- [x] Set MG Orange as default tire type
- [x] Split Front End into Front Left and Front Right sections
- [x] Add separate caster, camber, toe fields for Front Left
- [x] Add separate caster, camber, toe fields for Front Right
- [x] Convert engine type to arrow dropdown
- [x] Convert chassis type to arrow dropdown
- [x] Convert axle stiffness to arrow dropdown
- [x] Set M2 as default axle stiffness selection
- [x] Test all new dropdown configurations


## Bug Fixes - Phase 10

- [x] Fix chassis screen frontLeft/frontRight initialization error


## Engine Maintenance Fields - Phase 11

- [x] Remove displacement field from engine screen
- [x] Add spark plug dropdown with options: AR50, AR51, AR3910X, BR10EG
- [x] Add date/time field for last spark plug change
- [x] Add last oil change date field
- [x] Update EngineSetup type with spark plug and maintenance fields
- [x] Update history screen to display new engine fields
- [x] Update sharing service to include spark plug and maintenance data


## UI Layout & Date/Time Picker Updates - Phase 12

- [x] Change tire weight measurements from kg to lbs
- [x] Update weight distribution display to show lbs
- [x] Reorganize chassis setup into left/right columns (not stacked)
- [x] Create date picker component with calendar and manual mm/dd/yyyy entry
- [x] Create time picker component with 12-hour hh:mm format
- [x] Integrate date picker into spark plug change date field
- [x] Integrate date picker into oil change date field
- [x] Integrate time picker into spark plug change time field
- [x] Test date/time picker functionality


## Bug Fixes & UI Improvements - Phase 13

- [x] Fix tire type default display to show "MG Orange" instead of "Medium"
- [x] Add back arrow navigation to all screens (tires, chassis, engine, weight)
- [x] Fix calendar display in date picker for mobile
- [x] Fix time picker modal size for mobile screens
- [x] Ensure date picker calendar is responsive and fits mobile viewport


## Critical Bug Fixes - Phase 14

- [x] Fix tire type SelectPicker to display "MG Orange" as default value (normalize legacy tire types)
- [x] Fix date picker calendar to display correctly and validate dates properly (rewrote with proper month/year navigation)
- [x] Fix time picker modal to fit mobile screen (reduced height, compact layout, bottom sheet positioning)
- [x] Test all three fixes on actual mobile device/preview


## Remaining Bug Fixes - Phase 15

- [x] Fix invalid date validation in date picker (added try-catch and proper date parsing)
- [x] Narrow time picker width (reduced padding, optimized spacing, max-width constraint)


## Time Picker Refinements - Phase 16

- [x] Fix time picker modal width overflow (reduced padding, added flex-wrap, constrained max-width)
- [x] Improve AM/PM selector visibility and functionality (converted to prominent toggle button)


## Time Picker Spinner Size - Phase 17

- [x] Increase time picker spinner size slightly for better readability (w-7, text-sm) while keeping side-by-side layout


## Cloud Sync & UI Improvements - Phase 18

- [ ] Add Kart Circuit Autobahn (Joliet, IL) to tracks database
- [ ] Fix dropdown menu overlap with bottom navigation (add z-index and padding)
- [ ] Implement cloud database backend for data sync
- [ ] Create user authentication system
- [ ] Implement cloud sync service for setups
- [ ] Add cloud sync toggle in settings
- [ ] Test multi-device data sync


## UI/UX Improvements - Phase 19

- [x] Hide bottom tab widgets (notifications, reports, analytics, dashboard-settings) for non-admin users
- [x] Integrate asphalt temperature from device temperature sensors when available
- [x] Fix back button navigation to use history stack instead of resetting to home
- [x] Add gearing tab after engine details and before weight distribution
- [x] Update engine details button text to "Continue to Gearing"
- [ ] Test all changes on mobile device


## Dropdown Overlap Fix - Phase 20

- [x] Update SelectPicker component with z-index and modal positioning
- [x] Add bottom padding to screens with dropdowns
- [ ] Test dropdown visibility on all setup screens


## ThingSpeak Integration Debug - Phase 21

- [x] Check ThingSpeak API configuration and credentials
- [x] Review weather screen data fetching logic
- [x] Test ThingSpeak API endpoints
- [x] Fix data parsing and error handling


## Critical Fixes - Phase 22

- [x] Debug and fix Norway Motorsports Park ThingSpeak data fetching
- [x] Hide admin tabs for non-admin users
- [x] Create login page for user authentication
- [x] Verify gearing tab placement in features


## Admin Tab Visibility & Authentication - Phase 23

- [ ] Completely hide admin tabs for non-admin users
- [ ] Add admin user management screen to grant/revoke admin access
- [ ] Fix authentication error when saving setup data


## Email/Password Authentication - Phase 24

- [x] Add email/password authentication endpoints to backend
- [x] Create signup and login screens with email/password forms
- [x] Update auth context to use new authentication
- [x] Add password validation and security features
- [ ] Test authentication flow end-to-end


## Email/Password Authentication Testing - Phase 25

- [ ] Test email/password signup flow as non-admin user
- [ ] Verify admin tabs are hidden for non-admin users
- [ ] Test setup creation and cloud sync for non-admin user
- [ ] Test logout and re-login functionality
- [ ] Write vitest tests for emailSignup and emailLogin mutations
- [ ] Write vitest tests for password hashing and verification
- [ ] Write vitest tests for error handling (duplicate email, invalid password)
- [ ] Run all tests and ensure they pass


## Ride Height & Width Configuration - Phase 26

- [x] Create width page with front spacer dropdown (5mm-50mm increments)
- [x] Create width page with rear width measurement input (mm/inches toggle)
- [x] Create ride height page with front spacer dropdown (Low/Standard/High)
- [x] Create ride height page with rear bolt position dropdown (Low/Standard/High)
- [x] Add width page after axle stiffness in setup form sequence
- [x] Add ride height page after width page in setup form sequence
- [x] Update KartingSession type to include width and ride height data
- [x] Update setup form navigation to include new pages
- [x] Test all new pages and data persistence


## ThingSpeak Integration - Phase 27

- [x] Add ThingSpeak API integration for Norway Motorsports Park (Channel 3318650)
- [x] Update weather screen to fetch and display track temperature from ThingSpeak
- [x] Test ThingSpeak data fetching and display
- [x] Verify track temperature updates correctly on weather screen


## Axle Settings & Page Reorganization - Phase 28

- [x] Add axle width (mm) input field to axle settings
- [x] Add axle brand dropdown (OTK, PKT, RR, ItalKart, Birel, CRG, IPK, PMC, Coyote, MGM, Margay, Factory Kart, Other)
- [x] Add custom brand input when "Other" is selected
- [x] Remove number labels from rear width input field
- [x] Add chassis brand options (Coyote, Margay, Kart Republic, Factory Kart)
- [x] Rename width page to "Chassis Setup 2"
- [x] Rename ride height page to "Chassis Setup 3"
- [x] Update page navigation sequence: Chassis Setup → Chassis Setup 2 → Chassis Setup 3


## Button Styling & Weight Page Navigation - Phase 29

- [x] Standardize all continue buttons to matching shade of green across all setup pages
- [x] Fix weight distribution page to end setup (save and return to home) instead of navigating back to chassis setup 2


## Cloud Sync & Live Timing Navigation - Phase 30

- [x] Update weight page to sync all setup data to cloud before navigation
- [x] Navigate to live timing section after successful cloud save
- [x] Add error handling for failed cloud sync


## Weather Data Retrieval Bug - Phase 31

- [x] Debug weather service API calls
- [x] Fix weather data retrieval failure
- [x] Verify ThingSpeak data fetching works correctly
- [x] Test weather display on weather screen


## Weather & ThingSpeak Debugging - Phase 32

- [x] Debug Open-Meteo API calls in browser network inspector
- [x] Debug ThingSpeak API calls for Norway Motorsports Park
- [x] Check for CORS or API endpoint errors
- [x] Fix weather data retrieval
- [x] Fix ThingSpeak asphalt temperature retrieval (updated channel ID and API key)
- [x] Test both APIs end-to-end


## Weather API Integration with wttr.in - Phase 33

- [x] Replace Open-Meteo API with wttr.in API (more reliable from sandbox)
- [x] Implement backend tRPC proxy to avoid CORS issues
- [x] Fix superjson encoding for tRPC GET requests
- [x] Verify real weather data displays (32°F, Overcast, 81% humidity, 12 mph wind)
- [x] Verify ThingSpeak track temperature displays (67°F from channel 3318650)
- [x] Test complete flow: kart number → track selection → real weather display → tire setup
- [x] Verify weather data is REAL and ACCURATE (not fallback/mock data)


## Setup History with Weather Context & Performance Analysis - Phase 34

- [x] Add lap time tracking fields to KartingSession type (bestLapTime, averageLapTime, lapCount)
- [x] Add performance notes field to KartingSession for user observations
- [x] Update history screen to display lap times and performance metrics
- [x] Create performance analysis view showing weather/setup correlation
- [ ] Add lap time input fields to a new "Performance" screen after weight distribution
- [ ] Implement lap time storage and retrieval
- [ ] Create comparison view to show multiple setups side-by-side with weather and lap times
- [x] Add weather condition summary to history list (temp, humidity, wind)
- [x] Test lap time tracking and performance analysis end-to-end


## Expanded Tracks Database - Phase 35

- [x] Add Gateway Kartplex (Madison, IL) to tracks database
- [x] Add Mid-State Kart Club (Springfield, IL) to tracks database
- [x] Verify weather auto-population for all new tracks
- [x] Test weather fetching for each new track location
- [ ] Ensure ThingSpeak integration available for tracks with sensors
- [x] Update tracks list UI to show all available tracks
- [x] Test track selection and weather display for all new tracks

## Unit Tests - Phase 36

- [x] Create comprehensive unit tests for setup history with weather context
- [x] Test lap time formatting and calculations
- [x] Test weather summary generation
- [x] Test performance analysis from session data
- [x] Test correlation score calculation
- [x] Test weather context storage
- [x] Test new tracks database validation
- [x] All 11 tests passing
