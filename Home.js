import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Home({ onLogout, userName = 'John Doe' }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [showDieline, setShowDieline] = useState(false);
  const [guide, setGuide] = useState('crease');
  const [showDetails, setShowDetails] = useState(false);
  // Inline web camera state/refs
  const [inlineCameraOpen, setInlineCameraOpen] = useState(false);
  const webVideoRef = useRef(null);
  const webStreamRef = useRef(null);

  // cleanup web stream on unmount or when inline camera closes
  useEffect(() => {
    return () => {
      if (webStreamRef.current) {
        try { webStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
        webStreamRef.current = null;
      }
    };
  }, []);

  // When inline camera opens on web, attach stream to video element and play
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (inlineCameraOpen && webStreamRef.current && webVideoRef.current) {
      try {
        webVideoRef.current.srcObject = webStreamRef.current;
        webVideoRef.current.play().catch(() => {});
      } catch (e) {
        console.warn('attach stream failed', e);
      }
    }
  }, [inlineCameraOpen]);
  
  // Sidebar and dropdown states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);

  // Animated values
  const sidebarAnim = useRef(new Animated.Value(-280)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  // Animate sidebar when state changes
  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? 0 : -280,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  // Animate profile dropdown when state changes
  useEffect(() => {
    if (profileDropdownOpen) {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [profileDropdownOpen]);

  const runSegmentation = () => {
    setRunning(true);
    setProcessed(false);
    setShowDieline(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 12) + 8;
        if (next >= 100) {
          clearInterval(interval);
          setProgress(100);
          setRunning(false);
          setProcessed(true);
        }
        return Math.min(next, 100);
      });
    }, 180);
  };

  const onCapture = () => {
    // Web inline camera flow: toggle start/capture
    if (Platform.OS === 'web') {
      // If camera not open, request stream and show preview
      if (!inlineCameraOpen) {
        if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
              webStreamRef.current = stream;
              if (webVideoRef.current) {
                webVideoRef.current.srcObject = stream;
                webVideoRef.current.play().catch(()=>{});
              }
              setInlineCameraOpen(true);
            })
            .catch(err => {
              console.warn('getUserMedia failed', err);
              Alert.alert('Camera error', 'Unable to access camera in browser.');
            });
        } else {
          Alert.alert('Camera not supported', 'Your browser does not support camera access.');
        }
        return;
      }

      // If camera is open, capture a frame
      try {
        const video = webVideoRef.current;
        if (!video) return;
        const w = video.videoWidth || 1920;
        const h = video.videoHeight || 1080;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCaptured({ uri: dataUrl });
        // save to server Desktop (server must be running at localhost:4000)
        try {
          saveCapturedToDesktop(dataUrl);
        } catch (e) {
          console.warn('save captured failed', e);
        }
      } catch (e) {
        console.warn('capture frame failed', e);
      } finally {
        // stop stream
        if (webStreamRef.current) {
          webStreamRef.current.getTracks().forEach(t => t.stop());
          webStreamRef.current = null;
        }
        setInlineCameraOpen(false);
      }
      return;
    }
  };

  const onConfirmDieline = () => {
    setShowDieline(true);
  };

  const onRedo = () => {
    // Reset processed state and captured image, then restart the capture flow.
    setProcessed(false);
    setProgress(0);
    setShowDieline(false);
    setShowDetails(false);
    setCaptured(null);

    // If a web stream exists, stop it before restarting
    if (Platform.OS === 'web') {
      try {
        if (webStreamRef.current) {
          webStreamRef.current.getTracks().forEach(t => t.stop());
          webStreamRef.current = null;
        }
      } catch (e) {
        console.warn('error stopping stream on redo', e);
      }
      // Start the camera preview again
      onCapture();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // POST captured image (data URL) to the Node API so the server can save it to Desktop
  const saveCapturedToDesktop = async (dataUrl) => {
    if (!dataUrl) return;
    try {
      const res = await fetch('http://localhost:4000/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const j = await res.json();
      if (j && j.status === 'ok') {
        // Notify user where the file was saved (inline banner + native alert)
        const msg = `Saved to Desktop: ${j.path}`;
        setSavedMessage(msg);
        // also show native alert for mobile/native apps
        Alert.alert('Saved', msg);
        // clear message after 4s
        setTimeout(() => setSavedMessage(null), 4000);
      } else {
        console.warn('save-image response', j);
        Alert.alert('Save failed', j && j.error ? j.error : 'Unknown error saving image');
      }
    } catch (e) {
      console.warn('saveCapturedToDesktop error', e);
      Alert.alert('Save error', e.message || String(e));
    }
  };

  return (
    <View style={styles.root}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      {/* Animated Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnim }],
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Image
            source={require('./assets/cartoniq.png')}
            style={styles.sidebarLogo}
          />
          <Text style={styles.sidebarTitle}>CartonIQ</Text>
        </View>

        <ScrollView style={styles.sidebarContent}>
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="home" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="camera" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="image" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="file-text-o" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Dielines</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="history" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>History</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="cog" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome name="question-circle" size={20} color="#1f2937" />
            <Text style={styles.menuItemText}>Help</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Main Content */}
      <LinearGradient
        colors={['#E8C76A', '#DACC96', '#999999']}
        locations={[0, 0.28, 1.0]}
        style={styles.mainContent}
      >
        {/* Enhanced Navbar with Gradient */}
        <LinearGradient
          colors={['#E8C76A']}
          locations={[0, 0.28, 1.0]}
          style={styles.nav}
        >
          <View style={styles.navContent}>
            <View style={styles.navLeft}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={toggleSidebar}
                activeOpacity={0.7}
              >
                <FontAwesome name="bars" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

              <View style={styles.profileDropdownContainer}>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={toggleProfileDropdown}
                  activeOpacity={0.8}
                >
                  <Image source={require('./assets/me.jpg')} style={styles.avatarImg} />
                  <View style={styles.profileNameContainer}>
                    <Text style={styles.profileNameText}>{userName}</Text>
                  </View>
                  <FontAwesome
                    name={profileDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color="#6b7280"
                  />
                </TouchableOpacity>

                {/* Animated Dropdown */}
                {profileDropdownOpen && (
                  <Animated.View
                    style={[
                      styles.dropdown,
                      {
                        opacity: dropdownOpacity,
                        transform: [
                          {
                            translateY: dropdownAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          },
                          {
                            scale: dropdownAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.95, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity style={styles.dropdownItem}>
                      <FontAwesome name="user" size={16} color="#1f2937" />
                      <Text style={styles.dropdownItemText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dropdownItem}>
                      <FontAwesome name="cog" size={16} color="#1f2937" />
                      <Text style={styles.dropdownItemText}>Account Settings</Text>
                    </TouchableOpacity>

                    <View style={styles.dropdownDivider} />

                    <TouchableOpacity
                      style={[styles.dropdownItem, styles.logoutItem]}
                      onPress={onLogout}
                    >
                      <FontAwesome name="sign-out" size={16} color="#dc2626" />
                      <Text style={[styles.dropdownItemText, { color: '#dc2626' }]}>Logout</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
          </View>
        </LinearGradient>

        {/* Panels */}
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.panels}>
            {/* Left panel: capture */}
            <View style={[styles.panel, styles.leftPanel]}>
              <Text style={styles.panelTitle}>Image Capture</Text>
              <View style={styles.photoCard}>
                {Platform.OS === 'web' && inlineCameraOpen ? (
                  <View style={{ width: '100%', aspectRatio: 2 / 3, borderRadius: 8, overflow: 'hidden' }}>
                    {React.createElement('video', {
                      ref: (el) => { webVideoRef.current = el; },
                      style: { width: '100%', height: '100%', objectFit: 'cover' },
                      playsInline: true,
                      muted: true,
                    })}
                  </View>
                ) : (
                  captured ? (
                    <Image source={captured} style={styles.photo} />
                  ) : (
                    <View style={styles.capturePlaceholder}>
                      <Text style={styles.capturePlaceholderText}>
                        {userName ? 'Click "Capture" to start the camera' : 'Sign in to enable camera capture'}
                      </Text>
                    </View>
                  )
                )}
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.captureBtn}
                    onPress={onCapture}
                    activeOpacity={0.85}
                    accessible={true}
                    accessibilityLabel="Capture photo"
                    accessibilityRole="button"
                  >
                    <FontAwesome name="camera" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.captureText}>Capture</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={onRedo}
                    activeOpacity={0.85}
                    accessible={true}
                    accessibilityLabel="Redo capture"
                    accessibilityRole="button"
                  >
                    <FontAwesome name="refresh" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Center panel: segmentation + confirm */}
            <View style={[styles.panel, styles.centerPanel, styles.centerElevated]}>
              <Text style={styles.panelTitle}>Segmentation</Text>
              <View style={styles.centerContent}>
                {running ? (
                  <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>Processing image...</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>
                ) : processed ? (
                  <View style={styles.resultWrap}>
                    <View style={styles.segCanvas}>
                      <View style={styles.segBox}>
                        <View style={styles.centerCrossV} />
                        <View style={styles.centerCrossH} />
                      </View>
                    </View>

                    <View style={styles.infoBox}>
                      <View style={styles.infoHeader}>
                        <Text style={styles.infoTitle}>
                          <FontAwesome name="check-circle" size={14} color="#10b981" /> Dimensions and Weight Detected
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowDetails(!showDetails)}
                          style={styles.detailsToggle}
                          accessible={true}
                          accessibilityLabel="Toggle dimension details"
                          accessibilityRole="button"
                        >
                          <Text style={styles.detailsToggleText}>
                            {showDetails ? 'Hide' : 'View'} Details
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {!showDetails && (
                        <Text style={styles.summaryText}>
                          180mm × 116mm × 108mm · 460g
                        </Text>
                      )}

                      {showDetails && (
                        <View style={styles.dimGrid}>
                          <View style={styles.dimCol}>
                            <Text style={styles.dimLabel}>Length</Text>
                            <Text style={styles.dimValue}>180 mm</Text>
                          </View>
                          <View style={styles.dimCol}>
                            <Text style={styles.dimLabel}>Width</Text>
                            <Text style={styles.dimValue}>116 mm</Text>
                          </View>
                          <View style={styles.dimCol}>
                            <Text style={styles.dimLabel}>Height</Text>
                            <Text style={styles.dimValue}>108 mm</Text>
                          </View>
                          <View style={styles.dimCol}>
                            <Text style={styles.dimLabel}>Weight</Text>
                            <Text style={styles.dimValue}>460 g</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {progress === 100 && (
                      <View style={styles.resultActions}>
                        <TouchableOpacity
                          style={styles.confirmBtn}
                          onPress={onConfirmDieline}
                          activeOpacity={0.85}
                          accessible={true}
                          accessibilityLabel="Confirm and generate dieline"
                          accessibilityRole="button"
                        >
                          <FontAwesome name="check" size={16} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.confirmText}>Generate Dieline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallBtn}
                          onPress={onRedo}
                          activeOpacity={0.85}
                          accessible={true}
                          accessibilityLabel="Redo"
                          accessibilityRole="button"
                        >
                          <FontAwesome name="refresh" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.runBtn}
                    onPress={runSegmentation}
                    activeOpacity={0.85}
                    accessible={true}
                    accessibilityLabel="Run segmentation model"
                    accessibilityRole="button"
                  >
                    <FontAwesome name="play" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.runText}>Run Segmentation</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Right panel: dieline preview */}
            <View style={[styles.panel, styles.rightPanel]}>
              <Text style={styles.panelTitle}>Dieline Preview</Text>
              {showDieline ? (
                <View style={styles.dielineWrap}>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      onPress={() => setGuide('cut')}
                      style={[styles.pillBtn, guide === 'cut' && styles.pillActive]}
                      activeOpacity={0.85}
                      accessible={true}
                      accessibilityLabel="Show cut lines"
                      accessibilityRole="button"
                    >
                      <Text
                        style={[styles.pillText, guide === 'cut' && styles.pillTextActive]}
                      >
                        — Cut Line
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setGuide('crease')}
                      style={[styles.pillBtn, guide === 'crease' && styles.pillActive]}
                      activeOpacity={0.85}
                      accessible={true}
                      accessibilityLabel="Show crease lines"
                      accessibilityRole="button"
                    >
                      <Text
                        style={[styles.pillText, guide === 'crease' && styles.pillTextActive]}
                      >
                        ····· Crease Line
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.gridOuter}>
                    <View style={styles.gridRow}>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellText}>Top L</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellText}>Front</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.cellText}>Top R</Text>
                      </View>
                    </View>
                    <View style={styles.gridRow}>
                      <View
                        style={[
                          styles.gridCell,
                          guide === 'crease' ? styles.creaseTop : styles.cutTop,
                        ]}
                      >
                        <Text style={styles.cellText}>Left</Text>
                      </View>
                      <View
                        style={[
                          styles.gridCell,
                          guide === 'crease' ? styles.creaseTop : styles.cutTop,
                        ]}
                      >
                        <Text style={styles.cellText}>Bottom</Text>
                      </View>
                      <View
                        style={[
                          styles.gridCell,
                          guide === 'crease' ? styles.creaseTop : styles.cutTop,
                        ]}
                      >
                        <Text style={styles.cellText}>Right</Text>
                      </View>
                    </View>
                    <View style={styles.bottomFlapRow}>
                      <View
                        style={[
                          styles.bottomFlap,
                          guide === 'crease' ? styles.creaseMid : styles.cutMid,
                        ]}
                      >
                        <Text style={styles.cellText}>Back</Text>
                      </View>
                    </View>
                    <Text style={styles.annotation}>121mm</Text>
                  </View>

                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>
                      This dieline is automatically generated based on product dimensions.
                      The blue dashed lines indicate automated crease lines for folding.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <FontAwesome name="file-image-o" size={48} color="#d1d5db" />
                  <Text style={styles.placeholderText}>
                    No dieline generated yet
                  </Text>
                  <Text style={styles.placeholderSubtext}>
                    Run the segmentation model to generate a dieline
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      {/* Inline saved notification banner */}
      {savedMessage && (
        <View style={styles.savedBanner} pointerEvents="none">
          <Text style={styles.savedBannerText}>{savedMessage}</Text>
        </View>
      )}
    </View>
  );
}

// All styles remain exactly the same as in your file
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#ffffff',
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '2px 0 8px rgba(0,0,0,0.25)' },
    }),
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  mainContent: {
    flex: 1,
  },
  nav: {
    height: 70,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
    }),
    zIndex: 100,
  },
  navContent: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  profileDropdownContainer: {
    position: 'relative',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 10,
  },
  profileNameContainer: {
    flexDirection: 'column',
  },
  profileNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    }),
    paddingVertical: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  panels: {
    flex: 1,
    flexDirection: width > 900 ? 'row' : 'column',
    padding: 24,
    gap: 24,
  },
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    }),
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  leftPanel: { flex: 1.2 },
  centerPanel: { flex: 1.1 },
  centerContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerElevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    }),
  },
  rightPanel: { flex: 1 },
  photoCard: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  photo: {
    width: '100%',
    aspectRatio: 2 / 3,
    resizeMode: 'contain',
    marginBottom: 12,
    flexShrink: 1,
    borderRadius: 8,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 12,
    gap: 12,
  },
  captureBtn: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  captureText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  smallBtn: {
    backgroundColor: '#1f2937',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runBtn: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  runText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  processingContainer: { alignItems: 'center' },
  processingText: {
    marginTop: 16,
    marginBottom: 12,
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
  progressBar: {
    width: 280,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  resultWrap: { width: '100%', alignItems: 'center' },
  segCanvas: {
    width: '100%',
    height: 280,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  segBox: {
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCrossV: {
    position: 'absolute',
    width: 2,
    height: '80%',
    backgroundColor: '#60a5fa',
  },
  centerCrossH: {
    position: 'absolute',
    height: 2,
    width: '80%',
    backgroundColor: '#60a5fa',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '700',
    flex: 1,
  },
  detailsToggle: { paddingHorizontal: 8, paddingVertical: 4 },
  detailsToggleText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  summaryText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
    marginTop: 4,
  },
  dimGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dimCol: {
    width: '47%',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dimLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dimValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  dielineWrap: { flex: 1, padding: 20, gap: 16 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  pillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#1f2937', borderColor: '#1f2937' },
  pillText: { color: '#1f2937', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  gridOuter: {
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 12,
    alignItems: 'center',
    borderRadius: 4,
  },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    width: 120,
    height: 100,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomFlapRow: { alignItems: 'center', marginTop: 8 },
  bottomFlap: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { color: '#6b7280', fontSize: 12 },
  creaseTop: { borderTopWidth: 2, borderTopColor: '#3b82f6', borderStyle: 'dashed' },
  cutTop: { borderTopWidth: 2, borderTopColor: '#1f2937' },
  creaseMid: { borderTopWidth: 2, borderTopColor: '#3b82f6', borderStyle: 'dashed' },
  cutMid: { borderTopWidth: 2, borderTopColor: '#1f2937' },
  annotation: { marginTop: 8, color: '#6b7280', fontSize: 11 },
  noteBox: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  noteText: { color: '#4b5563', fontSize: 12, lineHeight: 18 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderText: {
    color: '#4b5563',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  savedBanner: {
    position: 'fixed',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2000,
  },
  savedBannerText: {
    backgroundColor: '#111827',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '700',
  },
  capturePlaceholder: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  capturePlaceholderText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
