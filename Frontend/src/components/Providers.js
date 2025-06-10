import ProveedorForm from './proveedores/ProveedorForm';
import CompraForm from './proveedores/CompraForm';
import HistorialCompras from './proveedores/HistorialCompras';


function Proveedores() {
  return (
    <div className="container mt-4">
      <h2>Gestión de Proveedores</h2>
      <ProveedorForm />
      <hr />
      <CompraForm />
      <hr />
      <HistorialCompras />
      <hr />
    </div>
  );
}

export default Proveedores;