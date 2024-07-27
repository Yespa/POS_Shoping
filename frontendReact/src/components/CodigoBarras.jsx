import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const CodigoBarras = ({ id }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, id, {
        format: "CODE128",
        lineColor: "#000",
        width: 1,   // Reducir el ancho de las barras
        height: 45,  // Reducir la altura del código de barras
        displayValue: true,
        fontSize: 10,  // Reducir el tamaño de la fuente
        margin: 0
      });
    }
  }, [id]);

  return (
    <svg ref={barcodeRef}></svg>
  );
};

export default CodigoBarras;
