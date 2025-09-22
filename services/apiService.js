/**
 * Сервис для работы с API (API Service).
 * Централизованный модуль для всех HTTP-запросов к серверу.
 * 
 * Функциональность:
 * - Работа с MockAPI для разработки и тестирования
 * - Унифицированные методы для CRUD операций
 * - Обработка ошибок и стандартизация ответов
 * - Модульная структура для разных сущностей
 * 
 * API модули:
 * - userApi: операции с пользователями (регистрация, аутентификация, профиль)
 * - productApi: управление товарами
 * - cartApi: операции с корзиной
 * - orderApi: управление заказами
 * - categoryApi: работа с категориями
 * - loyaltyApi: программа лояльности
 * - locationsApi: сохраненные адреса
 * 
 * Все методы возвращают стандартизированные объекты ответа.
 */
const MOCK_API_BASE_URL = 'https://68c87dc55d8d9f514735822f.mockapi.io/api/v1';

const createApiResponse = (data, status = 'success') => ({
  status,
  data,
  message:
    status === 'success'
      ? 'Operation completed successfully'
      : 'Operation failed',
});

const createErrorResponse = (message, code = 'ERROR') => ({
  status: 'error',
  data: null,
  message,
  code,
});

const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = `${MOCK_API_BASE_URL}/${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 404) {
        return createApiResponse([]);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return createApiResponse(data);
  } catch (error) {

    if (error.message.includes('404') || error.message.includes('Network')) {
      return createApiResponse([]);
    }

    return createErrorResponse(error.message, 'NETWORK_ERROR');
  }
};

// ========== PRODUCTS API ==========

export const productApi = {
  // Get all products
  async getProducts(filters = {}) {
    try {
      let endpoint = 'products';
      const queryParams = new URLSearchParams();

      // Apply filters as query parameters
      if (filters.categoryId) {
        queryParams.append('categoryId', filters.categoryId);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.available !== undefined) {
        queryParams.append('isAvailable', filters.available);
      }

      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }

      return await makeRequest(endpoint);
    } catch (error) {
      return createErrorResponse('Failed to fetch products', 'FETCH_ERROR');
    }
  },

  // Get product by ID
  async getProductById(id) {
    try {
      return await makeRequest(`products/${id}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch product', 'FETCH_ERROR');
    }
  },

  // Create new product
  async createProduct(productData) {
    try {
      return await makeRequest('products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      return createErrorResponse('Failed to create product', 'CREATE_ERROR');
    }
  },

  // Update product
  async updateProduct(id, productData) {
    try {
      return await makeRequest(`products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      return createErrorResponse('Failed to update product', 'UPDATE_ERROR');
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      return await makeRequest(`products/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return createErrorResponse('Failed to delete product', 'DELETE_ERROR');
    }
  },

  // Get categories
  async getCategories() {
    try {
      return await makeRequest('categories');
    } catch (error) {
      return createErrorResponse('Failed to fetch categories', 'FETCH_ERROR');
    }
  },
};

// ========== CART API ==========

export const cartApi = {
  // Get cart items for a user
  async getCart(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`cart?userId=${encodeURIComponent(userId)}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch cart', 'FETCH_ERROR');
    }
  },

  // Add item to cart
  async addToCart(productData, quantity = 1, userId) {
    if (!userId) throw new Error('userId is required');
    if (!productData) throw new Error('productData is required');
    try {
      const cartItem = {
        productId: productData.id,
        quantity,
        userId,
        ...productData,
        addedAt: new Date().toISOString(),
      };
      // Flat-структура: POST на /cart
      return await makeRequest(`cart`, {
        method: 'POST',
        body: JSON.stringify(cartItem),
      });
    } catch (error) {
      return createErrorResponse('Failed to add item to cart', 'ADD_ERROR');
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    try {
      return await makeRequest(`cart/${cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      return createErrorResponse('Failed to update cart item', 'UPDATE_ERROR');
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId) {
    try {
      return await makeRequest(`cart/${cartItemId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return createErrorResponse(
        'Failed to remove item from cart',
        'REMOVE_ERROR'
      );
    }
  },

  // Clear entire cart for user
  async clearCart(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      // Получаем все элементы корзины пользователя и удаляем их
      const cartResponse = await this.getCart(userId);
      if (
        cartResponse.status === 'success' &&
        Array.isArray(cartResponse.data)
      ) {
        const deletePromises = cartResponse.data.map((item) =>
          this.removeFromCart(item.id, userId)
        );
        await Promise.all(deletePromises);
        return createApiResponse([]);
      }
      return cartResponse;
    } catch (error) {
      return createErrorResponse('Failed to clear cart', 'CLEAR_ERROR');
    }
  },
};

// ========== ORDERS API ==========

export const orderApi = {
  // Get all orders for a user
  async getOrders(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`orders?userId=${encodeURIComponent(userId)}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch orders', 'FETCH_ERROR');
    }
  },

  // Get order by ID
  async getOrderById(orderId, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(
        `users/${encodeURIComponent(userId)}/orders/${orderId}`
      );
    } catch (error) {
      return createErrorResponse('Failed to fetch order', 'FETCH_ERROR');
    }
  },

  // Create new order
  async createOrder(orderData, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      const order = {
        ...orderData,
        userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return await makeRequest(`users/${encodeURIComponent(userId)}/orders`, {
        method: 'POST',
        body: JSON.stringify(order),
      });
    } catch (error) {
      return createErrorResponse('Failed to create order', 'CREATE_ERROR');
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(
        `users/${encodeURIComponent(userId)}/orders/${orderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            status,
            updatedAt: new Date().toISOString(),
          }),
        }
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to update order status',
        'UPDATE_ERROR'
      );
    }
  },

  // Cancel order
  async cancelOrder(orderId, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await this.updateOrderStatus(orderId, 'cancelled', userId);
    } catch (error) {
      return createErrorResponse('Failed to cancel order', 'CANCEL_ERROR');
    }
  },
};

// ========== USER API ==========

export const userApi = {
  async login(userId, password) {
    try {
      const response = await makeRequest(
        `users?userId=${encodeURIComponent(userId)}`
      );

      if (response.status === 'success') {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Ищем пользователя с совпадающим паролем
          const user = response.data.find((u) => u.password === password);
          if (user) {
            return {
              status: 'success',
              data: [user],
              message: 'Login successful',
            };
          } else {
            return {
              status: 'error',
              data: [],
              message: 'Invalid credentials',
              code: 'INVALID_CREDENTIALS',
            };
          }
        } else {
          return {
            status: 'error',
            data: [],
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          };
        }
      } else {
        return {
          status: 'error',
          data: [],
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        };
      }
    } catch (error) {
      return createErrorResponse('Failed to login', 'LOGIN_ERROR');
    }
  },
  // Get user profile
  async getProfile(userId) {
    try {
      return await makeRequest(`users/${userId}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch profile', 'FETCH_ERROR');
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      return await makeRequest(`users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...profileData,
          updatedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      return createErrorResponse('Failed to update profile', 'UPDATE_ERROR');
    }
  },

  // Create user
  async createUser(userData) {
    try {
      return await makeRequest('users', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      return createErrorResponse('Failed to create user', 'CREATE_ERROR');
    }
  },
};

// ========== CATEGORIES API ==========

export const categoryApi = {
  // Get all categories
  async getCategories() {
    try {
      return await makeRequest('categories');
    } catch (error) {
      return createErrorResponse('Failed to fetch categories', 'FETCH_ERROR');
    }
  },

  // Get category by ID
  async getCategoryById(id) {
    try {
      return await makeRequest(`categories/${id}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch category', 'FETCH_ERROR');
    }
  },

  // Create category
  async createCategory(categoryData) {
    try {
      return await makeRequest('categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      return createErrorResponse('Failed to create category', 'CREATE_ERROR');
    }
  },

  // Update category
  async updateCategory(id, categoryData) {
    try {
      return await makeRequest(`categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });
    } catch (error) {
      return createErrorResponse('Failed to update category', 'UPDATE_ERROR');
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      return await makeRequest(`categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return createErrorResponse('Failed to delete category', 'DELETE_ERROR');
    }
  },
};

// ========== PAYMENT METHODS API ==========

export const paymentMethodsApi = {
  // Get payment methods for a user
  async getPaymentMethods(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(
        `payment_methods?userId=${encodeURIComponent(userId)}`
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch payment methods',
        'FETCH_ERROR'
      );
    }
  },

  // Create payment method
  async createPaymentMethod(paymentData, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`payment_methods`, {
        method: 'POST',
        body: JSON.stringify({ ...paymentData, userId }),
      });
    } catch (error) {
      return createErrorResponse(
        'Failed to create payment method',
        'CREATE_ERROR'
      );
    }
  },

  // Update payment method
  async updatePaymentMethod(id, paymentData, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`payment_methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...paymentData, userId }),
      });
    } catch (error) {
      return createErrorResponse(
        'Failed to update payment method',
        'UPDATE_ERROR'
      );
    }
  },

  // Delete payment method
  async deletePaymentMethod(id, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      const result = await makeRequest(`payment_methods/${id}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error) {
      return createErrorResponse(
        'Failed to delete payment method',
        'DELETE_ERROR'
      );
    }
  },
};

// ========== LOCATIONS API ==========

export const locationsApi = {
  // Get saved locations for a user
  async getSavedLocations(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(
        `locations?userId=${encodeURIComponent(userId)}`
      );
    } catch (error) {
      return createErrorResponse(
        'Failed to fetch saved locations',
        'FETCH_ERROR'
      );
    }
  },

  // Create location
  async createLocation(locationData, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`locations`, {
        method: 'POST',
        body: JSON.stringify({ ...locationData, userId }),
      });
    } catch (error) {
      return createErrorResponse('Failed to create location', 'CREATE_ERROR');
    }
  },

  // Update location
  async updateLocation(id, locationData, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      return await makeRequest(`locations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...locationData, userId }),
      });
    } catch (error) {
      return createErrorResponse('Failed to update location', 'UPDATE_ERROR');
    }
  },

  // Delete location
  async deleteLocation(id, userId) {
    if (!userId) throw new Error('userId is required');
    try {
      const result = await makeRequest(`locations/${id}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error) {
      return createErrorResponse('Failed to delete location', 'DELETE_ERROR');
    }
  },
};

// ========== LOYALTY API ==========

export const loyaltyApi = {
  // Get loyalty info for a user
  async getLoyaltyInfo(userId) {
    if (!userId) throw new Error('userId is required');
    try {
      // Фильтрация по userId для совместимости с flat-структурой
      return await makeRequest(`loyalty?userId=${encodeURIComponent(userId)}`);
    } catch (error) {
      return createErrorResponse('Failed to fetch loyalty info', 'FETCH_ERROR');
    }
  },

  // Update loyalty points
  async updateLoyaltyPoints(userId, points) {
    if (!userId) throw new Error('userId is required');
    try {
      // Получаем текущую запись лояльности
      const currentResponse = await this.getLoyaltyInfo(userId);
      if (
        currentResponse.status === 'success' &&
        Array.isArray(currentResponse.data) &&
        currentResponse.data.length > 0
      ) {
        // Обновляем существующую запись
        const loyaltyRecord = currentResponse.data[0];
        return await makeRequest(`loyalty/${loyaltyRecord.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...loyaltyRecord,
            currentPoints: points,
            userId,
          }),
        });
      } else {
        // Создаем новую запись лояльности (POST на loyalty, flat-структура)
        return await makeRequest(`loyalty`, {
          method: 'POST',
          body: JSON.stringify({
            currentPoints: points,
            maxPoints: 10,
            userId,
            createdAt: new Date().toISOString(),
          }),
        });
      }
    } catch (error) {
      return createErrorResponse(
        'Failed to update loyalty points',
        'UPDATE_ERROR'
      );
    }
  },
};

// ========== INITIALIZATION HELPERS ==========


// Export main API object for backward compatibility
export default {
  products: productApi,
  cart: cartApi,
  orders: orderApi,
  users: userApi,
  categories: categoryApi,
  paymentMethods: paymentMethodsApi,
  locations: locationsApi,
  loyalty: loyaltyApi,
  getPaymentMethods: paymentMethodsApi.getPaymentMethods,
  getSavedLocations: locationsApi.getSavedLocations,
};

// Export individual APIs
export {
  productApi as products,
  cartApi as cart,
  orderApi as orders,
  userApi as users,
  categoryApi as categories,
  paymentMethodsApi as paymentMethods,
  locationsApi as locations,
  loyaltyApi as loyalty,
};
