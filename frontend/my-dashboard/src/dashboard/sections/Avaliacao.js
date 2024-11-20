import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import Copyright from '../internals/components/Copyright';

export default function Avaliacao() {
  const [performanceGlobal, setPerformanceGlobal] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusValue, setFocusValue] = useState(null);
  const [stressValue, setStressValue] = useState(null);
  const [controlValue, setControlValue] = useState(null);

  useEffect(() => {
    // Função para buscar os dados da API
    const fetchData = async () => {
      try {
        // Fetch para PerformanceGlobal
        const performanceResponse = await fetch('http://127.0.0.1:5000/api/global-performance');
        const performanceData = await performanceResponse.json();

        if (performanceData.PerformanceGlobal) {
          setPerformanceGlobal(performanceData.PerformanceGlobal);
        } else {
          console.error('PerformanceGlobal não encontrada nos dados');
        }

        // Fetch para sessionQuestionary
        const sessionResponse = await fetch('http://127.0.0.1:5000/api/sessionQuestionary');
        const sessionData = await sessionResponse.json();

        console.log('Session API Response:', sessionData); // Depuração

        // Objeto para agrupar os valores por mês
        const monthlyData = {};

        // Iterar sobre os dados da sessão
        Object.values(sessionData).forEach((session) => {
          if (session.updated_at && session.form_answer) {
            const date = new Date(session.updated_at);
            const month = date.toLocaleString('default', { month: 'long' });

            // Inicializar arrays mensais, se necessário
            if (!monthlyData[month]) {
              monthlyData[month] = { stressValues: [], focusValues: [], controlValues: [] };
            }

            // Adicionar os valores para cálculo posterior
            monthlyData[month].stressValues.push(session.form_answer[0]);
            monthlyData[month].focusValues.push(session.form_answer[1]);
            monthlyData[month].controlValues.push(session.form_answer[2]);
          }
        });

        // Calcular as médias por mês
        const formattedData = Object.entries(monthlyData).map(([month, values]) => ({
          month,
          stressValue: values.stressValues.reduce((sum, val) => sum + val, 0) / values.stressValues.length,
          focusValue: values.focusValues.reduce((sum, val) => sum + val, 0) / values.focusValues.length,
          controlValue: values.controlValues.reduce((sum, val) => sum + val, 0) / values.controlValues.length,
        }));

        setChartData(formattedData);

// Fetch para Focus, Stress e Control
const [focusResponse, stressResponse, controlResponse] = await Promise.all([
  fetch('http://127.0.0.1:5000/api/focus-value'),
  fetch('http://127.0.0.1:5000/api/stress-value'),
  fetch('http://127.0.0.1:5000/api/control-value')
]);

const [focusData, stressData, controlData] = await Promise.all([
  focusResponse.json(),
  stressResponse.json(),
  controlResponse.json()
]);

// Calcular a média dos valores de Focus, Stress e Control
setFocusValue(focusData.focus_values.reduce((sum, val) => sum + val, 0) / focusData.focus_values.length);
setStressValue(stressData.stress_values.reduce((sum, val) => sum + val, 0) / stressData.stress_values.length);
setControlValue(controlData.control_values.reduce((sum, val) => sum + val, 0) / controlData.control_values.length);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preparar os dados para o gráfico
  const months = chartData.map((data) => data.month);
  const stressValues = chartData.map((data) => data.stressValue);
  const focusValues = chartData.map((data) => data.focusValue);
  const controlValues = chartData.map((data) => data.controlValue);

return (
  <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, textAlign: 'center' }}>
    {/* Exibir carregamento enquanto busca dados */}
    {loading ? (
      <Typography variant="h6">Carregando...</Typography>
    ) : (
      <>
        <Grid
          container
          spacing={1}
          columns={12}
          sx={{ mb: (theme) => theme.spacing(2), height: '100vh', display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}
        >
          <Grid container item xs={12} alignContent="space-between" sx={{ display: 'flex' }}>
            {/* Box para Performance Global */}
            <Box
              sx={{
                p: 2,
                boxShadow: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                width: '100%', maxWidth: { sm: '100%', md: '1700px' }
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Performance Global
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Desempenho geral baseado nos questionários de avaliação e testes de performance:
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {performanceGlobal}%
              </Typography>
            </Box>
          </Grid>     

        {/* Gráfico Avaliação por Mês */}
        <Grid container item xs={12} justifyContent="center" alignContent="space-between">
  <Box 
    sx={{
      p: 4,
      boxShadow: 2,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      width: '100%', maxWidth: { sm: '100%', md: '1700px' }
    }}
  >
    <Typography variant="h6" sx={{ mb: 1 }}>
      Avaliação por Mês
    </Typography>
    {chartData.length > 0 ? (
      <LineChart
        xAxis={[{ scaleType: 'band', data: months, label: 'Mês' }]}
        series={[
          { id: 'stress', label: 'Gerenc. de Estresse', data: stressValues, stack: 'total'},
          { id: 'focus', label: 'Foco', data: focusValues, stack: 'total'},
          { id: 'control', label: 'Control. de Impulsividade', data: controlValues, stack: 'total'},
        ]}
        width={600}
        height={400}
        grid={{ horizontal: true }}
        slotProps={{
          legend: {
            labelStyle: {
              fontSize: '0.8rem',
            },
          },
        }}
      />
    ) : (
      <Typography variant="body1">Nenhum dado disponível para o gráfico.</Typography>
    )}
  </Box>
</Grid>

        <Copyright sx={{ mt: 4 }} />

        {/* Boxes com as médias de Focus, Stress e Control */}
<Grid container item xs={12} justifyContent="center" spacing={2}>
  <Box 
  sx={{
    p: 2,
    boxShadow: 2,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
      Resumo de Habilidades
    </Typography>
    <Grid item>
                <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.default', width: '100%', mb: 2 }}>
                  <Typography variant="h7">Gerenciamento de Estresse</Typography>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {stressValue ? (stressValue.toFixed(2)) + "%" : "N/A"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.default', mb: 2, flexGrow: 1 }}>
                  <Typography variant="h7">Foco</Typography>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {focusValue ? (focusValue.toFixed(2)) + "%" : "N/A"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.default', width: '100%', mb: 2 }}>
                  <Typography variant="h7">Controle de Impulsividade</Typography>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {controlValue ? (controlValue.toFixed(2)) + "%" : "N/A"}
                  </Typography>
                </Box>
              </Grid>
              </Box>
            </Grid>

        </Grid>
      </>
    )}
  </Box>
);
}