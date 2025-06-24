import React from 'react';
import '../../styles/StockLevelBar.css'; // Crearemos este archivo de estilos a continuación

const StockLevelBar = ({ stock, umbral }) => {
  // Calculamos el porcentaje. Consideramos que el 100% "saludable" es el doble del umbral.
  // Esto hace que la barra se vea en amarillo cuando te acercas al umbral.
  const maxVisual = umbral * 2;
  let percentage = (stock / maxVisual) * 100;
  if (percentage > 100) percentage = 100;

  let barClass = 'high';
  if (percentage <= 50) barClass = 'medium'; // Por debajo del umbral
  if (percentage <= 25) barClass = 'low';    // Crítico

  return (
    <div className="stock-bar-container" title={`Stock: ${stock} / Umbral: ${umbral}`}>
      <div className={`stock-bar-fill ${barClass}`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default StockLevelBar;