import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Metrics, User } from './MetricsTypes';
import { getFilteredMetrics } from './MetricsUtils';
import styles from '../styles/metrics.module.css';
import { PlanDurationOptions } from './FormConstants';

interface MetricsViewProps {
  metrics: Metrics | null;
  users: User[];
}

const MetricsView: React.FC<MetricsViewProps> = ({ metrics, users }) => {
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  const filteredMetrics = getFilteredMetrics(users, dateFilter, planFilter);

  const chartData = {
    labels: ['Mensal', 'Semestral', 'Anual', 'Desconhecido'],
    datasets: [
      {
        label: 'Distribuição de Planos',
        data: [
          filteredMetrics?.plan_distribution?.monthly || 0,
          filteredMetrics?.plan_distribution?.semi_annual || 0,
          filteredMetrics?.plan_distribution?.annual || 0,
          filteredMetrics?.plan_distribution?.unknown || 0,
        ],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        borderColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Usuários Ativos', 'Usuários Expirados'],
    datasets: [
      {
        data: [
          filteredMetrics?.active_users || 0,
          filteredMetrics?.expired_users || 0,
        ],
        backgroundColor: ['#4BC0C0', '#FF6384'],
        borderColor: ['#4BC0C0', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Distribuição de Planos por Tipo' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Número de Usuários' } },
      x: { title: { display: true, text: 'Tipo de Plano' } },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Status dos Usuários' },
    },
  };

  const downloadMetrics = () => {
    if (!filteredMetrics) return;
    
    const data = {
      data_geracao: new Date().toLocaleString('pt-BR'),
      filtros_aplicados: {
        periodo: dateFilter === 'all' ? 'Todos os períodos' : dateFilter,
        plano: planFilter === 'all' ? 'Todos os planos' : planFilter,
      },
      metricas: {
        total_usuarios: filteredMetrics.total_users,
        usuarios_ativos: filteredMetrics.active_users,
        usuarios_expirados: filteredMetrics.expired_users,
        distribuicao_planos: filteredMetrics.plan_distribution,
      }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `metricas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSV = () => {
    if (!filteredMetrics) return;
    
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Usuários', filteredMetrics.total_users],
      ['Usuários Ativos', filteredMetrics.active_users],
      ['Usuários Expirados', filteredMetrics.expired_users],
      ['', ''],
      ['Distribuição de Planos', ''],
      ['Mensal', filteredMetrics.plan_distribution?.monthly || 0],
      ['Semestral', filteredMetrics.plan_distribution?.semi_annual || 0],
      ['Anual', filteredMetrics.plan_distribution?.annual || 0],
      ['Desconhecido', filteredMetrics.plan_distribution?.unknown || 0],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `metricas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <Pie data={pieChartData} options={pieChartOptions} />;
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  const getPlanLabel = (value: string) => {
    const option = PlanDurationOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className={styles.metricsView}>
      <header className={styles.header}>
        <h3 className={styles.subtitle}>Métricas e Relatórios</h3>
        <div className={styles.metricsActions}>
          <button className={styles.downloadButton} onClick={downloadMetrics}>
            <i className="fas fa-download" /> JSON
          </button>
          <button className={styles.downloadButton} onClick={downloadCSV}>
            <i className="fas fa-file-csv" /> CSV
          </button>
        </div>
      </header>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="dateFilter">Período:</label>
          <select 
            id="dateFilter"
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos os períodos</option>
            <option value="last_30_days">Últimos 30 dias</option>
            <option value="last_3_months">Últimos 3 meses</option>
            <option value="last_6_months">Últimos 6 meses</option>
            <option value="last_year">Último ano</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="planFilter">Plano:</label>
          <select 
            id="planFilter"
            value={planFilter} 
            onChange={(e) => setPlanFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos os planos</option>
            {PlanDurationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="chartType">Tipo de Gráfico:</label>
          <select 
            id="chartType"
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as 'bar' | 'pie' | 'line')}
            className={styles.filterSelect}
          >
            <option value="bar">Barras</option>
            <option value="pie">Pizza</option>
            <option value="line">Linha</option>
          </select>
        </div>
      </div>

      {filteredMetrics && (
        <>
          <div className={styles.kpiContainer}>
            <div className={styles.kpiCard}>
              <h4>Total de Usuários</h4>
              <p>{filteredMetrics.total_users}</p>
            </div>
            <div className={styles.kpiCard}>
              <h4>Usuários Ativos</h4>
              <p>{filteredMetrics.active_users}</p>
            </div>
            <div className={styles.kpiCard}>
              <h4>Planos Expirados</h4>
              <p>{filteredMetrics.expired_users}</p>
            </div>
          </div>

          <div className={styles.chartContainer}>
            {renderChart()}
          </div>

          <div className={styles.metricsDetails}>
            <h4>Detalhes da Distribuição de Planos</h4>
            <div className={styles.planDetails}>
              {Object.entries(filteredMetrics.plan_distribution).map(([plan, count]) => (
                <div key={plan} className={styles.planDetail}>
                  <span className={styles.planName}>{getPlanLabel(plan)}:</span>
                  <span className={styles.planCount}>{count} usuários</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MetricsView;