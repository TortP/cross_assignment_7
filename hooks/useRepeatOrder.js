/**
 * Кастомный хук для повторения заказа (useRepeatOrder).
 * Предоставляет функциональность добавления всех товаров из заказа в корзину.
 * 
 * Функциональность:
 * - Получает товары из переданного заказа
 * - Загружает актуальную информацию о каждом товаре с сервера
 * - Добавляет товары в корзину с сохранением количества
 * - Обрабатывает ошибки и показывает уведомления
 * - Поддерживает локализацию сообщений
 * 
 * @returns {Function} onRepeatOrder - функция для повторения заказа
 * @param {Object} order - объект заказа с массивом items
 * 
 * Используется в компонентах LastOrder и OrderStatusScreen.
 */
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { productApi } from '../services/apiService';
import { selectT } from '../store/appSlice';

/**
 * Хук для повторения заказа (добавляет все товары заказа в корзину)
 * @returns {function} onRepeatOrder(order)
 */
export function useRepeatOrder() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userId.value);
  const t = useSelector(selectT);

  const onRepeatOrder = async (order) => {
    if (!order || !order.items) return;
    try {
      for (const item of order.items) {
        const resp = await productApi.getProductById(item.productId || item.id);
        if (resp.status !== 'success' || !resp.data) {
          throw new Error(
            t('error') + ': ' + (resp.message || 'Product not found')
          );
        }
        const realProduct = resp.data;

        for (let i = 0; i < (item.quantity || 1); i++) {
          await dispatch(
            require('../store/cartSlice').addToCart({
              productData: realProduct,
              userId,
            })
          );
        }
      }
      Alert.alert(t('success'), t('orderRepeated'));
    } catch (err) {
      Alert.alert(t('error'), err.message || String(err));
    }
  };

  return onRepeatOrder;
}
