import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PapalialaPizzeriaApp = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [deliveryTimer, setDeliveryTimer] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sample pizza data with custom images
  const pizzas = [
    {
      id: 1,
      name: "Margherita Classic",
      description: "Fresh tomatoes, mozzarella, basil",
      price: 12.99,
      image: "🍕",
      rating: 4.8,
      popular: true
    },
    {
      id: 2,
      name: "Pepperoni Supreme",
      description: "Pepperoni, cheese, Italian herbs",
      price: 15.99,
      image: "🍕",
      rating: 4.9,
      popular: true
    },
    {
      id: 3,
      name: "Hawaiian Paradise",
      description: "Ham, pineapple, cheese",
      price: 14.99,
      image: "🍕",
      rating: 4.3
    },
    {
      id: 4,
      name: "Meat Lovers",
      description: "Pepperoni, sausage, bacon, ham",
      price: 18.99,
      image: "🍕",
      rating: 4.7
    },
    {
      id: 5,
      name: "Veggie Deluxe",
      description: "Bell peppers, mushrooms, olives, onions",
      price: 13.99,
      image: "🥗",
      rating: 4.5
    },
    {
      id: 6,
      name: "BBQ Chicken",
      description: "Grilled chicken, BBQ sauce, red onions",
      price: 16.99,
      image: "🍕",
      rating: 4.6
    }
  ];

  // Available coupons
  const coupons = {
    'WELCOME10': { discount: 10, type: 'percentage', description: '10% off your first order' },
    'SAVE5': { discount: 5, type: 'fixed', description: '$5 off orders over $20' },
    'STUDENT15': { discount: 15, type: 'percentage', description: '15% off with student ID' },
    'FAMILY20': { discount: 20, type: 'percentage', description: '20% off orders over $40' }
  };

  // Delivery timer effect
  useEffect(() => {
    if (deliveryTimer && deliveryTimer > 0) {
      const interval = setInterval(() => {
        setDeliveryTimer(prev => {
          if (prev <= 1) {
            Alert.alert('🎉 Free Pizza!', 'Your pizza is FREE! Delivery took longer than 30 minutes.');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [deliveryTimer]);

  // Format timer display
  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Authentication functions
  const handleLogin = (email, password) => {
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setCurrentView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setActiveOrder(null);
    setDeliveryTimer(null);
    setCurrentView('home');
  };

  // Cart functions
  const addToCart = (pizza) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === pizza.id);
      if (existing) {
        return prev.map(item => 
          item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...pizza, quantity: 1 }];
    });
    Alert.alert('Added to Cart', `${pizza.name} added successfully!`);
  };

  const updateQuantity = (id, change) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ).filter(item => item.quantity > 0));
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = subtotal * (appliedCoupon.discount / 100);
      } else {
        discount = appliedCoupon.discount;
      }
    }
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: (subtotal - discount).toFixed(2)
    };
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupon = coupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponCode('');
      Alert.alert('Coupon Applied!', coupon.description);
    } else {
      Alert.alert('Invalid Coupon', 'Please check your coupon code and try again.');
    }
  };

  // Place order
  const placeOrder = () => {
    if (cart.length === 0) return;
    
    const order = {
      id: Date.now(),
      items: [...cart],
      total: calculateTotal().total,
      status: 'preparing',
      address: '123 Main St, Your City'
    };
    
    setActiveOrder(order);
    setCart([]);
    setDeliveryTimer(1800); // 30 minutes
    setCurrentView('tracking');
  };

  // Mock GPS tracking
  const TrackingView = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      <ScrollView style={styles.trackingContainer}>
        <View style={styles.trackingHeader}>
          <Text style={styles.trackingTitle}>Order Tracking</Text>
          <View style={styles.gpsIndicator}>
            <Ionicons name="location" size={20} color="#DC2626" />
            <Text style={styles.gpsText}>Real-time GPS Tracking</Text>
          </View>
        </View>

        {deliveryTimer && (
          <View style={styles.timerContainer}>
            <View style={styles.timerHeader}>
              <Ionicons name="time" size={24} color="#DC2626" />
              <Text style={styles.timerLabel}>Delivery Timer</Text>
            </View>
            <Text style={styles.timerDisplay}>
              {formatTimer(deliveryTimer)}
            </Text>
            <Text style={styles.timerSubtext}>
              {deliveryTimer > 0 ? 'Free pizza if not delivered on time!' : 'Your pizza is FREE! 🎉'}
            </Text>
          </View>
        )}

        {/* Mock Google Maps */}
        <View style={styles.mapContainer}>
          <View style={styles.mapContent}>
            <Ionicons name="map" size={48} color="#059669" />
            <Text style={styles.mapTitle}>Google Maps Integration</Text>
            <Text style={styles.mapSubtitle}>Live driver location</Text>
          </View>
          <View style={styles.driverLocation}>
            <Text style={styles.driverText}>📍 Driver: 2.3 km away</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusTextCompleted}>Order confirmed</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusTextCompleted}>Pizza in preparation</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusTextActive}>Out for delivery</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#D1D5DB' }]} />
            <Text style={styles.statusTextPending}>Delivered</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('home')}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // Login/Register View
  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <View style={styles.loginContainer}>
          <View style={styles.loginContent}>
            <View style={styles.loginHeader}>
              <Text style={styles.loginTitle}>🍕 Papaliala's</Text>
              <Text style={styles.loginSubtitle}>Login to order delicious pizza</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => handleLogin(email, password)}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.demoText}>
              Demo: Use any email and password to login
            </Text>
            
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={() => setCurrentView('home')}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  // Cart View
  const CartView = () => {
    const totals = calculateTotal();

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <ScrollView style={styles.cartContainer}>
          <Text style={styles.cartTitle}>Your Cart</Text>
          
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="bag-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <View style={styles.cartItems}>
                {cart.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <Text style={styles.itemEmoji}>{item.image}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>${item.price}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Coupon Section */}
              <View style={styles.couponSection}>
                <View style={styles.couponHeader}>
                  <Ionicons name="pricetag" size={20} color="#D97706" />
                  <Text style={styles.couponTitle}>Apply Coupon</Text>
                </View>
                <View style={styles.couponInput}>
                  <TextInput
                    style={styles.couponTextInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#9CA3AF"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity 
                    style={styles.couponButton}
                    onPress={applyCoupon}
                  >
                    <Text style={styles.couponButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                {appliedCoupon && (
                  <Text style={styles.couponSuccess}>✓ {appliedCoupon.description}</Text>
                )}
                <Text style={styles.couponHint}>
                  Try: WELCOME10, SAVE5, STUDENT15, FAMILY20
                </Text>
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>${totals.subtotal}</Text>
                </View>
                {appliedCoupon && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelDiscount}>Discount:</Text>
                    <Text style={styles.summaryValueDiscount}>-${totals.discount}</Text>
                  </View>
                )}
                <View style={styles.summaryRowTotal}>
                  <Text style={styles.summaryLabelTotal}>Total:</Text>
                  <Text style={styles.summaryValueTotal}>${totals.total}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.placeOrderButton}
                onPress={placeOrder}
              >
                <Text style={styles.placeOrderText}>Place Order - ${totals.total}</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={styles.backToMenuButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.backToMenuText}>Back to Menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Main Home View
  const HomeView = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🍕 Papaliala's</Text>
            <Text style={styles.headerSubtitle}>Authentic Italian Pizza</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setCurrentView('cart')}
            >
              <Ionicons name="bag" size={20} color="white" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={user ? handleLogout : () => setCurrentView('login')}
            >
              <Ionicons name="person" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {user && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome back, <Text style={styles.userName}>{user.name}</Text>! 👋
            </Text>
          </View>
        )}

        {/* Delivery Promise */}
        <View style={styles.deliveryPromise}>
          <Ionicons name="time" size={32} color="#059669" />
          <Text style={styles.promiseTitle}>30 Minutes or FREE!</Text>
          <Text style={styles.promiseSubtitle}>With live GPS tracking</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Ionicons name="call" size={20} color="#DC2626" />
            <Text style={styles.contactText}>Call us: (555) 123-PIZZA</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="home" size={20} color="#DC2626" />
            <Text style={styles.contactSubText}>Free delivery in 5km radius</Text>
          </View>
        </View>

        {/* Pizza Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Our Pizzas</Text>
          {pizzas.map(pizza => (
            <View key={pizza.id} style={styles.pizzaCard}>
              <View style={styles.pizzaContent}>
                <Text style={styles.pizzaEmoji}>{pizza.image}</Text>
                <View style={styles.pizzaInfo}>
                  <View style={styles.pizzaHeader}>
                    <Text style={styles.pizzaName}>{pizza.name}</Text>
                    {pizza.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.pizzaDescription}>{pizza.description}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.rating}>{pizza.rating}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${pizza.price}</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addToCart(pizza)}
                    >
                      <Text style={styles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Main app render
  if (currentView === 'login') return <LoginView />;
  if (currentView === 'cart') return <CartView />;
  if (currentView === 'tracking') return <TrackingView />;
  return <HomeView />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  header: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: width - 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    color: '#FCA5A5',
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#B91C1C',
    borderRadius: 20,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FDE047',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    color: '#374151',
    fontSize: 16,
  },
  userName: {
    fontWeight: '600',
    color: '#DC2626',
  },
  deliveryPromise: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  promiseTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#065F46',
    marginTop: 8,
  },
  promiseSubtitle: {
    color: '#059669',
    fontSize: 14,
  },
  contactInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  contactText: {
    fontWeight: '600',
    fontSize: 16,
  },
  contactSubText: {
    color: '#6B7280',
    fontSize: 14,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 16,
  },
  pizzaCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pizzaContent: {
    flexDirection: 'row',
    gap: 16,
  },
  pizzaEmoji: {
    fontSize: 40,
  },
  pizzaInfo: {
    flex: 1,
  },
  pizzaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pizzaName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  popularText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
  pizzaDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  addButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Login styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  loginSubtitle: {
    color: '#6B7280',
    fontSize: 16,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  guestButton: {
    alignItems: 'center',
    padding: 12,
  },
  guestButtonText: {
    color: '#DC2626',
    fontSize: 16,
  },
  // Cart styles
  cartContainer: {
    flex: 1,
    padding: 16,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 24,
  },
  emptyCart: {
    alignItems: 'center',
    padding: 32,
  },
  emptyCartText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
  },
  cartItems: {
    gap: 16,
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    color: '#6B7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    width: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  couponSection: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  couponTitle: {
    fontWeight: '600',
    color: '#92400E',
  },
  couponInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  couponTextInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    fontSize: 14,
  },
  couponButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#D97706',
    borderRadius: 6,
    justifyContent: 'center',
  },
  couponButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  couponSuccess: {
    color: '#059669',
    fontSize: 12,
    marginBottom: 8,
  },
  couponHint: {
    fontSize: 10,
    color: '#6B7280',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    gap: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    color: '#374151',
  },
  summaryLabelDiscount: {
    fontSize: 16,
    color: '#059669',
  },
  summaryValueDiscount: {
    fontSize: 16,
    color: '#059669',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeOrderButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToMenuButton: {
    alignItems: 'center',
    padding: 12,
  },
  backToMenuText: {
    color: '#DC2626',
    fontSize: 16,
  },
  // Tracking styles
  trackingContainer: {
    flex: 1,
    padding: 16,
  },
  trackingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trackingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsText: {
    color: '#DC2626',
    fontSize: 16,
  },
  timerContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timerLabel: {
    fontWeight: '600',
    color: '#B91C1C',
  },
  timerDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7F1D1D',
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  mapContainer: {
    backgroundColor: '#D1FAE5',
    height: 192,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mapContent: {
    alignItems: 'center',
  },
  mapTitle: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  mapSubtitle: {
    color: '#059669',
    fontSize: 14,
  },
  driverLocation: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  driverText: {
    fontSize: 10,
    color: '#374151',
  },
  statusContainer: {
    gap: 12,
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusTextCompleted: {
    color: '#065F46',
    fontSize: 16,
  },
  statusTextActive: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#6B7280',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PapalialaPizzeriaApp;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// const pizzas = [
//   {
//     id: 1,
//     name: "Margherita Classic",
//     description: "Fresh tomatoes, mozzarella, basil",
//     price: 12.99,
//     emoji: "🍕",
//     rating: 4.8,
//     popular: true
//   },
//   // ... add more pizzas
// ];
//
// export default function HomeScreen() {
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const router = useRouter();
//
//   useEffect(() => {
//     checkAuthStatus();
//     loadCart();
//   }, []);
//
//   const checkAuthStatus = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         setUser(JSON.parse(userData));
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };
//
//   const loadCart = async () => {
//     try {
//       const cartData = await AsyncStorage.getItem('cart');
//       if (cartData) {
//         setCart(JSON.parse(cartData));
//       }
//     } catch (error) {
//       console.error('Error loading cart:', error);
//     }
//   };
//
//   const addToCart = async (pizza) => {
//     try {
//       const existingItem = cart.find(item => item.id === pizza.id);
//       let newCart;
//
//       if (existingItem) {
//         newCart = cart.map(item =>
//           item.id === pizza.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       } else {
//         newCart = [...cart, { ...pizza, quantity: 1 }];
//       }
//
//       setCart(newCart);
//       await AsyncStorage.setItem('cart', JSON.stringify(newCart));
//       Alert.alert('Added to Cart', `${pizza.name} added successfully!`);
//     } catch (error) {
//       console.error('Error adding to cart:', error);
//     }
//   };
//
//   const PizzaCard = ({ pizza }) => (
//     <View style={styles.pizzaCard}>
//       <View style={styles.pizzaInfo}>
//         <Text style={styles.pizzaEmoji}>{pizza.emoji}</Text>
//         <View style={styles.pizzaDetails}>
//           <View style={styles.pizzaHeader}>
//             <Text style={styles.pizzaName}>{pizza.name}</Text>
//             {pizza.popular && (
//               <View style={styles.popularBadge}>
//                 <Text style={styles.popularText}>Popular</Text>
//               </View>
//             )}
//           </View>
//           <Text style={styles.pizzaDescription}>{pizza.description}</Text>
//           <View style={styles.ratingContainer}>
//             <Ionicons name="star" size={16} color="#FCD34D" />
//             <Text style={styles.rating}>{pizza.rating}</Text>
//           </View>
//           <View style={styles.priceContainer}>
//             <Text style={styles.price}>${pizza.price}</Text>
//             <TouchableOpacity
//               style={styles.addButton}
//               onPress={() => addToCart(pizza)}
//             >
//               <Text style={styles.addButtonText}>Add to Cart</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
//
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.headerTitle}>🍕 Papaliala's</Text>
//           <Text style={styles.headerSubtitle}>Authentic Italian Pizza</Text>
//         </View>
//         <TouchableOpacity
//           style={styles.profileButton}
//           onPress={() => user ? router.push('/profile') : router.push('/login')}
//         >
//           <Ionicons name="person" size={24} color="white" />
//         </TouchableOpacity>
//       </View>
//
//       {user && (
//         <View style={styles.welcomeContainer}>
//           <Text style={styles.welcomeText}>
//             Welcome back, <Text style={styles.userName}>{user.name}</Text>! 👋
//           </Text>
//         </View>
//       )}
//
//       {/* Delivery Promise */}
//       <View style={styles.deliveryPromise}>
//         <Ionicons name="time" size={32} color="#059669" />
//         <Text style={styles.promiseTitle}>30 Minutes or FREE!</Text>
//         <Text style={styles.promiseSubtitle}>With live GPS tracking</Text>
//       </View>
//
//       {/* Pizza Menu */}
//       <ScrollView style={styles.menuContainer}>
//         <Text style={styles.menuTitle}>Our Pizzas</Text>
//         {pizzas.map(pizza => (
//           <PizzaCard key={pizza.id} pizza={pizza} />
//         ))}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF2F2',
//   },
//   header: {
//     backgroundColor: '#DC2626',
//     padding: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   headerSubtitle: {
//     color: '#FCA5A5',
//     fontSize: 14,
//   },
//   profileButton: {
//     padding: 8,
//     backgroundColor: '#B91C1C',
//     borderRadius: 20,
//   },
//   welcomeContainer: {
//     backgroundColor: 'white',
//     margin: 16,
//     padding: 16,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   welcomeText: {
//     color: '#374151',
//   },
//   userName: {
//     fontWeight: '600',
//     color: '#DC2626',
//   },
//   deliveryPromise: {
//     backgroundColor: '#D1FAE5',
//     margin: 16,
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   promiseTitle: {
//     fontWeight: 'bold',
//     fontSize: 18,
//     color: '#065F46',
//     marginTop: 8,
//   },
//   promiseSubtitle: {
//     color: '#059669',
//     fontSize: 14,
//   },
//   menuContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//   },
//   menuTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#B91C1C',
//     marginBottom: 16,
//   },
//   pizzaCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   pizzaInfo: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   pizzaEmoji: {
//     fontSize: 40,
//   },
//   pizzaDetails: {
//     flex: 1,
//   },
//   pizzaHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   pizzaName: {
//     fontSize: 18,
//     fontWeight: '600',
//     flex: 1,
//   },
//   popularBadge: {
//     backgroundColor: '#FEF2F2',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   popularText: {
//     color: '#DC2626',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   pizzaDescription: {
//     color: '#6B7280',
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   rating: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   price: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#DC2626',
//   },
//   addButton: {
//     backgroundColor: '#DC2626',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   addButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
// }); 
