import api from "@/api/axios";


const API_BASE_URL = "/admin/subscriptions"; 

export const fetchSubscriptions = async () => {
  const response = await api.get(API_BASE_URL);
  return response.data;
};

export const createSubscription = async (subscriptionData: any) => {
  const response = await api.post(API_BASE_URL, subscriptionData);
  return response.data;
};


export const updateSubscription = async (id: string, subscriptionData: any) => {
  const response = await api.put(`${API_BASE_URL}/${id}`, subscriptionData);
  return response.data;
};

export const deleteSubscription = async (id: string) => {
  const response = await api.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
