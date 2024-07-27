import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { tokens } from '../theme';
import { useTheme } from '@mui/material';

const PieChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getColor = ({ data }) => data.color;

  // Genera una leyenda personalizada fuera del gráfico
  const CustomLegend = () => (
    <div style={{ marginLeft: 20 }}>
      {data.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 5 }}>
          <svg width={18} height={18}>
            <circle cx={9} cy={9} r={9} fill={item.color} />
          </svg>
          <span style={{ marginLeft: 10, color: colors.grey[100] }}>{`${item.label}: ${Number(item.value).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          })}`}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ width: '80%', height: 850 }}>
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 120, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={colors.grey[100]}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          enableArcLabels={true}
          valueFormat={value => `${Number(value).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          })}`}
          arcLabelsRadiusOffset={0.4}
          arcLabelsSkipAngle={7}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          colors={getColor}
          theme={{
            axis: {
              ticks: {
                text: { fill: colors.grey[100] }
              }
            },
            legends: {
              text: { fill: colors.grey[100] }
            }
          }}
          // No necesitas definir legends aquí ya que lo estás manejando de forma personalizada
        />
      </div>
      <CustomLegend />
    </div>
  );
};

export default PieChart;



