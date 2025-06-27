import { Metrics, User } from './MetricsTypes';

export const calculateExpirationDate = (registrationDate: string, planDuration: string): Date | null => {
  if (!registrationDate) return null;
  try {
    const date = new Date(registrationDate);
    if (isNaN(date.getTime())) {
      console.error('Data de registro inválida:', registrationDate);
      return null;
    }
    if (planDuration === 'annual') {
      date.setMonth(date.getMonth() + 12);
    } else if (planDuration === 'semi_annual') {
      date.setMonth(date.getMonth() + 6);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  } catch (error) {
    console.error('Erro ao calcular data de expiração:', error);
    return null;
  }
};

export const getFilteredMetrics = (
  users: User[],
  dateFilter: string,
  planFilter: string
): Metrics | null => {
  let filteredUsers = users;
  
  // Aplicar filtros de data
  if (dateFilter !== 'all') {
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateFilter) {
      case 'last_30_days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case 'last_3_months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case 'last_year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filteredUsers = filteredUsers.filter(user => 
      user.registration_date && new Date(user.registration_date) >= filterDate
    );
  }
  
  // Aplicar filtros de plano
  if (planFilter !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.plan_duration === planFilter);
  }
  
  // Calcular métricas filtradas
  const planDistribution = filteredUsers.reduce((acc, user) => {
    acc[user.plan_duration] = (acc[user.plan_duration] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const activeUsers = filteredUsers.filter(user => {
    if (!user.registration_date) return false;
    const expDate = calculateExpirationDate(user.registration_date, user.plan_duration);
    return expDate && expDate > new Date();
  }).length;
  
  return {
    total_users: filteredUsers.length,
    active_users: activeUsers,
    expired_users: filteredUsers.length - activeUsers,
    plan_distribution: planDistribution
  };
};

