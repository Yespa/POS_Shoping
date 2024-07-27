import React from 'react';
import CodigoBarras from './CodigoBarras';

const FacturaImpresion = ({ datosFactura }) => {

  const fechaVenta = new Date(datosFactura.fechaVenta);

  // Formatear la fecha en un formato más legible
  const fechaFormateada = fechaVenta.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const tituloTexto = {
    fontWeight: 'bold',
  };

  // Estilos en línea para el div principal
  const facturaEstilos = {
    width: '80mm', 
    maxWidth: '80mm', 
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    textAlign: 'center',
    margin: '0 auto'
  };

  // Estilos en línea para la imagen
  const imagenEstilos = {
    maxWidth: '45mm',
    height: 'auto',
    marginTop: '5px',
    marginBottom: '5px',
  };

  // Estilos en línea para la imagen QR
  const imagenEstilosQR = {
    maxWidth: '35mm',
    height: 'auto',
    marginTop: '5px',
    marginBottom: '5px',
  };

  // Estilos en línea para la tabla
  const tablaEstilos = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px' // Asegurándose de que la tabla también use el mismo tamaño de fuente
  };

  // Estilos en línea para celdas de la tabla
  const celdaEstilos = {
    padding: '8px',
    textAlign: 'left',
  };

  // Estilos en línea para uniformar el tamaño de la letra
  const estilosTextoBloque1 = {
    fontSize: '13px',
    margin: '0',  // Eliminar el margen
    padding: '0', // Eliminar el padding
    lineHeight: '1.4', // Altura de línea compacta
    textAlign: 'center' // Alineación centrada
  };

  const estilosTexto = {
    fontSize: '13px',
    margin: '0',  // Eliminar el margen
    padding: '0', // Eliminar el padding
    lineHeight: '1.3', // Altura de línea compacta
    textAlign: 'left' // Alineación centrada
  };

  const estilosTextoGarantia = {
    fontSize: '13px',
    margin: '0',  // Eliminar el margen
    padding: '0', // Eliminar el padding
    lineHeight: '1.6', // Altura de línea compacta
    textAlign: 'left' // Alineación centrada
  };

  // Estilos para la sección de detalles de pago
  const estilosDetallesPago = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: '10px'
  };

  const codigoBarrasEstilos = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px'
  };

  return (
    <div style={facturaEstilos}>
      <img 
        src="../../assets/logo-black-peq.png" 
        alt="Logo" 
        style={imagenEstilos}
      />
      <p style={estilosTextoBloque1}><span style={tituloTexto}>NIT:</span> 1001553520-6</p>
      <p style={estilosTextoBloque1}><span style={tituloTexto}>Tel:</span> 3206603872 </p>
      <p style={estilosTextoBloque1}>CRA 20 #22-08</p>
      <p style={estilosTextoBloque1}>Doradal - Antioquia</p>
      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>
      <div style={estilosTexto}>
        <p style={estilosTexto}><span style={tituloTexto}>Fecha:</span> {fechaFormateada}</p>
        <p style={estilosTexto}><span style={tituloTexto}>Cliente:</span> {datosFactura.cliente.nombre}</p>
        <p style={estilosTexto}><span style={tituloTexto}>CC/NIT:</span> {datosFactura.cliente.docIdentidad}</p>
        <p style={estilosTexto}><span style={tituloTexto}>Tel:</span> {datosFactura.cliente.telefono}</p>
        <p style={estilosTexto}><span style={tituloTexto}>Vendedor:</span> {datosFactura.vendedor}</p>
      </div>
      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>

      <table style={tablaEstilos}>
        <thead>
          <tr>
            <th style={celdaEstilos}>Nombre</th>
            <th style={celdaEstilos}>Cant.</th>
            <th style={celdaEstilos}>Vr Total</th>
          </tr>
        </thead>
        <tbody>
          {datosFactura.productosVendidos.map((producto) => (
            <tr key={producto._id}>
              <td style={celdaEstilos}>{producto.nombre}</td>
              <td style={celdaEstilos}>{producto.cantidad}</td>
              <td style={celdaEstilos}>{producto.precio_total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>

      <div>
          <p style={{fontSize: '15px', margin: '5px 0', textAlign: 'right'}}><span style={tituloTexto}>T. Factura:</span> {datosFactura.totalFactura.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
      </div>

      <div style={estilosDetallesPago}>
        <div style={{textAlign: 'left', width: '50%'}}>
          <p style={estilosTexto}>
            <span style={tituloTexto}>Metodo Pago:</span> {datosFactura.metodoPago}
          </p>
        </div>
        <div style={{textAlign: 'right', width: '50%'}}>          
          {datosFactura.metodoPago === 'efectivo' && (
            <p style={{fontSize: '12px', margin: '5px 0', textAlign: 'right'}}><span style={tituloTexto}>Pago:</span> {datosFactura.pagoEfectivo.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          )}
          {datosFactura.metodoPago === 'transferencia' && (
            <p style={{fontSize: '12px', margin: '5px 0', textAlign: 'right'}}><span style={tituloTexto}>Pago:</span> {datosFactura.pagoTransferencia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          )}
          {datosFactura.metodoPago === 'mixto' && (
            <>
              <p style={{fontSize: '12px', margin: '5px 0', textAlign: 'right'}}><span style={tituloTexto}>P. Efectivo:</span> {datosFactura.pagoEfectivo.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p style={{fontSize: '12px', margin: '5px 0', textAlign: 'right'}}><span style={tituloTexto}>P. Transferencia:</span> {datosFactura.pagoTransferencia.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </>
          )}
        </div>
      </div>
      
      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>

      <p style={{fontSize: '13px', margin: '0', padding: '0', lineHeight: '1.5', fontWeight: 'bold'}}>*** GRACIAS POR SU COMPRA ***</p>
      <p style={{fontSize: '12px', margin: '0', padding: '0', lineHeight: '1.2'}}> Abrimos todos los días de 9:00 a.m. a 12:00 p.m y 2:00pm a 8:00pm, nos dedicamos a ofrecerle un servicio excepcional y atención personalizada.</p>
      <img 
        src="../../assets/instagram_qr.png" 
        alt="qr" 
        style={imagenEstilosQR}
      />
      <p style={{fontSize: '12px', margin: '0', padding: '0', lineHeight: '1.2'}}>!Escaneame!</p>

      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>
      <div style={{ ...estilosTexto, textAlign: 'left' }}>
        <p style={estilosTextoGarantia}><span style={tituloTexto}>Garantía:</span> _________________________________________</p>
        <p style={estilosTextoGarantia}> _________________________________________</p>
      </div>
      <p style={{fontSize: "11px", margin: '5px', padding: '0', lineHeight: '1.2'}}>✱ Nuestras garantías no cubren: Humedad, Golpes, Rayones, Equipos apagados, Reporte por no registro ✱</p>

      <div style={codigoBarrasEstilos}>
        <CodigoBarras id={datosFactura._id} />
      </div>

      <p style={{fontStyle: "italic", fontSize: "8px"}}>Create by BitMoth Labs</p>
      <div style={{ borderTop: '1px dotted #000', margin: '5px 0' }}></div>
    </div>
  );
};

export default FacturaImpresion;
