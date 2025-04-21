import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className=" py-8 mt-12"> {/* Changed background to green */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Use grid for columns */}
        {/* Column 1: Contact Info */}
        <div className="text-left">
          <h4 className="text-md font-semibold mb-3">Contacto</h4>
          <p className="mb-1 text-sm">Dirección: Calle Falsa 123, Springfield</p>
          <p className="mb-1 text-sm">Teléfono: (011) 5555-1234</p>
          <p className="text-sm">Email: contacto@ex.com</p>
        </div>

        {/* Column 2: Brand and Copyright */}
        <div className="text-left md:text-right">
          <h3 className="text-lg font-semibold mb-4">Tienda San Luis</h3>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Pagína Ejemplo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
