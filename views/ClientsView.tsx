import React, { useState, useMemo } from 'react';
import { IClient, IClientDetails } from '../types';
import { initialClients, initialClientDetails } from '../data/mockData';
import {
  Search,
  Plus,
  FileText,
  Download,
  DollarSign,
  CheckCircle,
  ShoppingCart,
} from '../components/Icons';

const ClientProfile: React.FC<{ client: IClient; onBack: () => void }> = ({
  client,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('Planes Comprados');
  const details: IClientDetails | undefined = initialClientDetails[client.id];
  const tabs = [
    'Planes Comprados',
    'Actividades',
    'Pagos',
    'Documentos Médicos',
  ];

  const renderContent = () => {
    if (!details)
      return (
        <p className="text-gray-500 italic mt-4">
          No hay detalles disponibles para este cliente.
        </p>
      );
    switch (activeTab) {
      case 'Planes Comprados':
        return (
          <div className="space-y-4 mt-4">
            {details.plans.map((plan) => (
              <div key={plan.id} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800">{plan.name}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2">
                  <p>
                    <strong className="text-gray-500">Precio:</strong>{' '}
                    {plan.price}
                  </p>
                  <p>
                    <strong className="text-gray-500">Inicio:</strong>{' '}
                    {plan.startDate}
                  </p>
                  <p>
                    <strong className="text-gray-500">Fin:</strong>{' '}
                    {plan.endDate}
                  </p>
                  <p>
                    <strong className="text-gray-500">Clases:</strong>{' '}
                    {plan.consumed}/{plan.total}
                  </p>
                </div>
                <span
                  className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${plan.status === 'Consumido' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                >
                  {plan.status}
                </span>
              </div>
            ))}
          </div>
        );
      case 'Actividades':
        return (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-left">
              <tbody>
                {details.activities.map((act) => (
                  <tr key={act.id} className="border-b">
                    <td className="p-2 font-medium">{act.date}</td>
                    <td className="p-2">{act.class}</td>
                    <td className="p-2 text-gray-500">{act.time}</td>
                    <td className="p-2">{act.instructor}</td>
                    <td className="p-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'Pagos':
        return (
          <div className="space-y-4 mt-4">
            {details.payments.map((pay) => (
              <div
                key={pay.id}
                className="bg-gray-50 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-green-500 mr-4" />
                  <div>
                    <p className="font-bold">{pay.amount}</p>
                    <p className="text-sm text-gray-500">
                      {pay.date} a las {pay.time}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {pay.method} / {pay.type}
                </span>
              </div>
            ))}
          </div>
        );
      case 'Documentos Médicos':
        return (
          <div className="space-y-3 mt-4">
            {details.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-purple-500 mr-3" />
                  <p className="font-medium text-gray-800">{doc.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Subido: {doc.uploadDate}
                  </p>
                  <button className="text-purple-600 hover:text-purple-800">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <button
        onClick={onBack}
        className="text-purple-600 font-semibold mb-4 hover:underline"
      >
        &larr; Volver al listado
      </button>
      <div className="flex flex-col md:flex-row items-center md:items-start border-b pb-6 mb-6">
        <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold mb-4 md:mb-0 flex-shrink-0">
          {client.avatar}
        </div>
        <div className="md:ml-6 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-800">
            {client.name} {client.lastName}
          </h2>
          <div className="text-gray-500 mt-1">{client.email}</div>
          <div className="text-gray-500">{client.phone}</div>
        </div>
        <div className="md:ml-auto mt-4 md:mt-0 border rounded-lg p-4 text-sm bg-gray-50 self-stretch">
          <h3 className="font-bold mb-2 text-gray-700">Datos del usuario</h3>
          <p>
            <strong>RUT:</strong> {client.rut}
          </p>
          <p>
            <strong>Género:</strong> {client.gender}
          </p>
          <div className="mt-2">
            <h4 className="font-bold text-gray-700">Sucursales asociadas</h4>
            <span className="inline-block bg-pink-200 text-pink-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {client.branch}
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

const ClientsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);

  const filteredClients = useMemo(
    () =>
      initialClients.filter(
        (client) =>
          `${client.name} ${client.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  if (selectedClient) {
    return (
      <ClientProfile
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center transition-colors">
            <Plus size={20} className="mr-2" />
            Crear Cliente
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">
                      {client.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name} {client.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{client.email}</td>
                <td className="p-4 text-sm text-gray-500">{client.phone}</td>
                <td className="p-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="text-purple-600 hover:text-purple-900 font-semibold"
                  >
                    Ver Perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsView;
