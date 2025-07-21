
import React, { useState, useEffect } from 'react';
import { ViewType, IClass, IStudent } from './types';
import { initialClassesData, initialStudents, initialWaitlist } from './data/mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CalendarView from './views/CalendarView';
import RatingsView from './views/RatingsView';
import BranchesView from './views/BranchesView';
import EmployeesView from './views/EmployeesView';
import ClientsView from './views/ClientsView';
import PaymentsView from './views/PaymentsView';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('Calendario');
    const [classes, setClasses] = useState<IClass[]>([]);
    const [students, setStudents] = useState<{ [key: number]: IStudent[] }>(initialStudents);
    const [waitlists, setWaitlists] = useState<{ [key: number]: IStudent[] }>(initialWaitlist);

    useEffect(() => {
        const processedClasses = initialClassesData.map(c => {
            const registeredCount = students[c.id]?.length || 0;
            const isFull = registeredCount >= c.capacity;
            const waitlistCount = isFull ? (waitlists[c.id]?.length || 0) : 0;
            return { ...c, registered: registeredCount, waitlist: waitlistCount };
        });
        setClasses(processedClasses);
    }, [students, waitlists]);

    const handleCancelAndPromote = (classId: number, studentId: number) => {
        setStudents(prevStudents => {
            const classStudents = prevStudents[classId] || [];
            const updatedClassStudents = classStudents.filter(s => s.id !== studentId);

            const classWaitlist = waitlists[classId] || [];
            if (classWaitlist.length > 0) {
                const studentToPromote = classWaitlist[0];
                updatedClassStudents.push(studentToPromote);
                
                setWaitlists(prevWaitlists => ({
                    ...prevWaitlists,
                    [classId]: prevWaitlists[classId].slice(1),
                }));
            }
            
            return {
                ...prevStudents,
                [classId]: updatedClassStudents,
            };
        });
    };

    const renderView = () => {
        switch (currentView) {
            case 'Calendario':
                return <CalendarView classes={classes} students={students} waitlists={waitlists} handleCancelAndPromote={handleCancelAndPromote} />;
            case 'Calificacion':
                return <RatingsView />;
            case 'Sucursales':
                return <BranchesView />;
            case 'Empleados':
                return <EmployeesView />;
            case 'Clientes':
                return <ClientsView />;
            case 'Pagos':
                return <PaymentsView />;
            default:
                return (
                    <div className="text-center p-10 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold">Módulo de {currentView}</h2>
                        <p className="text-gray-500 mt-2">Este módulo está en construcción.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

export default App;
