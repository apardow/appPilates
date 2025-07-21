
import React from 'react';
import { Bell } from './Icons';

const Header: React.FC = () => (
    <header className="bg-white shadow-sm p-4 flex justify-end items-center flex-shrink-0 z-0">
        <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <Bell />
            </button>
            <div className="ml-4 text-right">
                <span className="font-semibold block text-gray-800">Hola, Administrador!</span>
                <a href="#" className="text-xs text-gray-500 hover:underline">Cerrar Sesión</a>
            </div>
            <div className="w-10 h-10 bg-purple-600 rounded-full ml-4 flex items-center justify-center text-white font-bold text-lg">
                A
            </div>
        </div>
    </header>
);

export default Header;
