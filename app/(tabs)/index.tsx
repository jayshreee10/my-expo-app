import { DeviceMotionMeasurement } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  DeviceMotion,
  Dimensions,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Water Drop Component with proper tilt-based movement
const WaterDrop: React.FC<{
  x: number;
  y: number;
  size: number;
  animatedValue: Animated.Value;
  tiltX: number;
  tiltY: number;
}> = ({ x, y, size, animatedValue, tiltX, tiltY }) => {
  
  // Calculate how far the drop should move based on tilt
  const maxMovement = 150; // Maximum pixels to move
  const tiltOffsetX = (tiltX / 100) * maxMovement; // Convert tilt to pixel movement
  const tiltOffsetY = (tiltY / 100) * maxMovement;
  
  const animatedStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, tiltOffsetX], // Move based on tilt direction
        }),
      },
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, tiltOffsetY], // Move based on tilt direction
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 1], // Slight scaling effect
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0.8],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.waterDrop,
        {
          left: x,
          top: y,
          width: size,
          height: size * 1.2,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.dropInner, { width: size, height: size * 1.2 }]} />
    </Animated.View>
  );
};

// Main Water Motion Component
const WaterMotion: React.FC = () => {
  // State
  const [touchCount, setTouchCount] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [motionAvailable, setMotionAvailable] = useState(false);
  const [lastTouchPosition, setLastTouchPosition] = useState({ x: 0, y: 0 });

  // Create multiple water drops
  const waterDrops = useRef(
    Array.from({ length: 15 }, (_, index) => ({
      id: index,
      x: Math.random() * (width - 50),
      y: Math.random() * (height - 100) + 100,
      size: 20 + Math.random() * 30,
      animatedValue: new Animated.Value(0),
    }))
  ).current;

  // Device motion detection with extensive debugging
  useEffect(() => {
    let subscription: any;

    const startMotionDetection = async () => {
      console.log('🚀 Starting motion detection...');
      
      try {
        // Check availability
        const isAvailable = await DeviceMotion.isAvailableAsync();
        console.log('📱 DeviceMotion available:', isAvailable);
        
        if (!isAvailable) {
          console.log('❌ Device motion not available on this device');
          setMotionAvailable(false);
          return;
        }

        // Request permissions
        console.log('🔑 Requesting motion permissions...');
        const { status } = await DeviceMotion.requestPermissionsAsync();
        console.log('🔑 Permission status:', status);
        
        if (status !== 'granted') {
          console.log('❌ Motion permission denied');
          setMotionAvailable(false);
          return;
        }

        console.log('✅ Motion permissions granted');
        setMotionAvailable(true);
        
        // Start listening
        console.log('👂 Starting to listen for motion data...');
        subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
          // Log all available data for debugging
          console.log('📊 Motion data received:', {
            acceleration: data.acceleration,
            rotation: data.rotation,
            accelerationIncludingGravity: data.accelerationIncludingGravity
          });
          
          // Try acceleration first (most reliable)
          if (data.acceleration) {
            const { x, y, z } = data.acceleration;
            console.log(`🏃 Acceleration - X: ${x?.toFixed(2)}, Y: ${y?.toFixed(2)}, Z: ${z?.toFixed(2)}`);
            
            // Use acceleration for tilt (simpler approach)
            if (x !== null && y !== null) {
              const tiltXValue = x * 100; // Amplify
              const tiltYValue = y * 100;
              
              setTiltX(tiltXValue);
              setTiltY(tiltYValue);
              
              // Trigger animation on any movement
              if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                console.log('🌊 Triggering drop animation due to motion');
                animateDropsToTilt();
              }
            }
          }
          
          // Also try rotation data
          if (data.rotation && data.rotation.gamma !== null && data.rotation.beta !== null) {
            const gamma = data.rotation.gamma * (180 / Math.PI);
            const beta = data.rotation.beta * (180 / Math.PI);
            console.log(`🔄 Rotation - Gamma: ${gamma.toFixed(1)}°, Beta: ${beta.toFixed(1)}°`);
            
            // Use rotation as backup
            setTiltX(gamma * 2);
            setTiltY(beta * 2);
            
            if (Math.abs(gamma) > 10 || Math.abs(beta) > 10) {
              console.log('🌊 Triggering drop animation due to rotation');
              animateDropsToTilt();
            }
          }
        });
        
        // Set update interval
        await DeviceMotion.setUpdateInterval(100); // 10 FPS
        console.log('✅ Motion detection started successfully');
        
      } catch (error) {
        console.error('💥 Motion setup failed:', error);
        setMotionAvailable(false);
      }
    };

    startMotionDetection();

    return () => {
      if (subscription) {
        subscription.remove();
        console.log('🛑 Motion subscription removed');
      }
    };
  }, []);

  // Animate drops based on tilt (immediate response)
  const animateDropsToTilt = () => {
    console.log(`🌊 Animating drops for tilt: X=${tiltX.toFixed(1)}, Y=${tiltY.toFixed(1)}`);
    
    waterDrops.forEach((drop, index) => {
      // Animate ALL drops, not just inactive ones
      setTimeout(() => {
        // Reset to 0 first, then animate to 1 for smooth movement
        drop.animatedValue.setValue(0);
        
        Animated.timing(drop.animatedValue, {
          toValue: 1,
          duration: 800 + Math.random() * 400, // Smooth animation
          useNativeDriver: true,
        }).start();
      }, index * 20); // Quick stagger
    });
  };

  // Continuous tilt response - animate drops whenever tilt changes significantly
  useEffect(() => {
    if (Math.abs(tiltX) > 5 || Math.abs(tiltY) > 5) {
      console.log(`📱 Significant tilt detected: X=${tiltX.toFixed(1)}, Y=${tiltY.toFixed(1)}`);
      animateDropsToTilt();
    }
  }, [tiltX, tiltY]); // React to tilt changes

  // Touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setLastTouchPosition({ x: locationX, y: locationY });
        createDropAtPosition(locationX, locationY);
        setTouchCount(prev => prev + 1);
      },
      
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setLastTouchPosition({ x: locationX, y: locationY });
        createDropAtPosition(locationX, locationY);
      },
    })
  ).current;

  // Create drop at touch position
  const createDropAtPosition = (touchX: number, touchY: number) => {
    // Find available drop - use _value safely
    const availableDrop = waterDrops.find(drop => (drop.animatedValue as any)._value === 0);
    
    if (availableDrop) {
      // Update position
      availableDrop.x = touchX - availableDrop.size / 2;
      availableDrop.y = touchY - availableDrop.size / 2;
      
      // Animate
      Animated.sequence([
        Animated.timing(availableDrop.animatedValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(availableDrop.animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Create random drops function
  const createRandomDrops = () => {
    console.log('Creating random drops');
    waterDrops.forEach((drop, index) => {
      setTimeout(() => {
        // Randomize positions
        drop.x = Math.random() * (width - 50);
        drop.y = Math.random() * (height - 200) + 100;
        
        Animated.timing(drop.animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          drop.animatedValue.setValue(0);
        });
      }, index * 100);
    });
    setTouchCount(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Water surface with touch handling */}
      <View 
        style={styles.waterContainer}
        {...panResponder.panHandlers}
      >
        
        {/* Render all water drops */}
        {waterDrops.map((drop) => (
          <WaterDrop
            key={drop.id}
            x={drop.x}
            y={drop.y}
            size={drop.size}
            animatedValue={drop.animatedValue}
            tiltX={tiltX}
            tiltY={tiltY}
          />
        ))}

        {/* Tilt indicator with better visual feedback */}
        <Animated.View style={[styles.tiltIndicator, { 
          transform: [
            { translateX: (tiltX / 100) * 50 }, // Visual indicator of tilt
            { translateY: (tiltY / 100) * 50 }
          ] 
        }]}>
          <Text style={styles.indicatorText}>📱</Text>
        </Animated.View>

        {/* Direction indicators */}
        {Math.abs(tiltX) > 10 && (
          <View style={[styles.directionIndicator, {
            left: tiltX > 0 ? width - 80 : 20,
          }]}>
            <Text style={styles.directionText}>
              {tiltX > 0 ? '💧➡️' : '⬅️💧'}
            </Text>
          </View>
        )}
      </View>

      {/* UI Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.title}>Water Motion</Text>
        <Text style={styles.subtitle}>
          💧 Touch to create drops • 📱 Tilt to move water
        </Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.tiltText}>
            Tilt X: {tiltX.toFixed(1)}° Y: {tiltY.toFixed(1)}°
          </Text>
          <Text style={styles.motionStatus}>
            Sensors: {motionAvailable ? '✅ Active' : '❌ Inactive'}
          </Text>
          <Text style={styles.touchCounter}>
            Touches: {touchCount}
          </Text>
          <Text style={styles.instructionText}>
            🔄 {motionAvailable ? 'Tilt your device to move water drops' : 'Enable motion permissions'}
          </Text>
        </View>

        <TouchableOpacity style={styles.waveButton} onPress={createRandomDrops}>
          <Text style={styles.waveButtonText}>💧 Create Drops</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001133',
  },
  waterContainer: {
    flex: 1,
    backgroundColor: 'linear-gradient(180deg, #001133 0%, #003366 100%)',
    overflow: 'hidden',
    position: 'relative',
  },
  waterDrop: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropInner: {
    backgroundColor: 'rgba(100, 200, 255, 0.8)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  tiltIndicator: {
    position: 'absolute',
    top: height / 2,
    left: width / 2 - 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorText: {
    fontSize: 20,
    textAlign: 'center',
  },
  directionIndicator: {
    position: 'absolute',
    top: height / 2 - 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  directionText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0E0E6',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  tiltText: {
    color: '#00BFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  motionStatus: {
    color: '#00FF7F',
    fontSize: 12,
    marginBottom: 5,
  },
  touchCounter: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#B0E0E6',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  waveButton: {
    backgroundColor: 'rgba(0, 119, 190, 0.8)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
  waveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WaterMotion;