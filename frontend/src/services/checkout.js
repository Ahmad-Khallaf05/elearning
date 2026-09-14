import axios from './axios';

export async function createCheckout(courseId, discountAmount = 0) {
  const { data } = await axios.post('/api/v1/orders/checkout', { course_id: courseId, discount_amount: discountAmount });
  if (data.redirect_url) window.location.href = data.redirect_url;
  return data;
}

