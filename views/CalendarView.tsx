
import React, { useState, useMemo } from 'react';
import { IClass, IStudent, IBranch } from '../types';
import { Users, UserCheck, Bell, X, ChevronLeft, ChevronRight } from '../components/Icons';
import { initialBranches } from '../data/mockData';

// Helper components defined outside the main component
const ClassCard: React.FC<{ classInfo: IClass; onSelect: (id: number) => void }> = ({ classInfo, onSelect }) => {
    const { service, instructor, time, registered, capacity, waitlist } = classInfo;
    const isFull = registered >= capacity;
    const available = isFull ? 0 : capacity - registered;
    const borderColor = isFull ? 'border-red-500' : 'border-purple-500';

    return (
        <div onClick={() => onSelect(classInfo.id)} className={`bg-white p-3 rounded-lg shadow-sm mb-2 cursor-pointer border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${borderColor}`}>
            <div className="font-bold text-sm text-gray-800">{service}</div>
            <div className="text-xs text-gray-500">{instructor}</div>
            <div className="text-xs text-gray-500">{time}</div>
            <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex items-center text-blue-600" title="Agendados"><Users className="w-4 h-4 mr-1" /><span>{registered}</span></div>
                <div className="flex items-center text-green-600" title="Disponibles"><UserCheck className="w-4 h-4 mr-1" /><span>{available}</span></div>
                <div className="flex items-center text-orange-500" title="En espera"><Bell className="w-4 h-4 mr-1" /><span>{waitlist}</span></div>
            </div>
        </div>
    );
};

const ClassDetailModal: React.FC<{
    classInfo: IClass;
    students: IStudent[];
    waitlist: IStudent[];
    onClose: () => void;
    onCancelAndPromote: (classId: number, studentId: number) => void;
}> = ({ classInfo, students, waitlist, onClose, onCancelAndPromote }) => {
    if (!classInfo) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{classInfo.service} - {classInfo.instructor}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-lg mb-3 text-gray-700">Agendados ({students.length}/{classInfo.capacity})</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {students.length > 0 ? (
                                    students.map(s => (
                                        <div key={s.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <span className="text-sm text-gray-800">{s.name}</span>
                                            <button onClick={() => onCancelAndPromote(classInfo.id, s.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase">CANCELAR</button>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-gray-500 italic">No hay alumnos agendados.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-3 text-gray-700">Lista de Espera ({waitlist.length})</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {waitlist.length > 0 ? (
                                    waitlist.map((s, i) => (
                                        <div key={s.id} className="flex justify-between items-center bg-yellow-100 p-2 rounded-md">
                                            <span className="text-sm text-yellow-900">{i + 1}. {s.name}</span>
                                            <button className="text-green-600 hover:text-green-800 text-xs font-semibold uppercase">PROMOVER</button>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-gray-500 italic">Lista de espera vacía.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                        <UserCheck className="mr-2" size={18} />Control de Asistencia
                    </button>
                </div>
            </div>
        </div>
    );
};


interface CalendarViewProps {
    classes: IClass[];
    students: { [key: number]: IStudent[] };
    waitlists: { [key: number]: IStudent[] };
    handleCancelAndPromote: (classId: number, studentId: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ classes, students, waitlists, handleCancelAndPromote }) => {
    const [filters, setFilters] = useState({ branch: 'all', service: 'all' });
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

    const filteredClasses = useMemo(() =>
        classes.filter(c =>
            (filters.branch === 'all' || c.branch === filters.branch) &&
            (filters.service === 'all' || c.service === filters.service)
        ), [filters, classes]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;
    const selectedClassStudents = selectedClassId ? students[selectedClassId] || [] : [];
    const selectedClassWaitlist = selectedClassId ? waitlists[selectedClassId] || [] : [];
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Calendario de Clases</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <select name="branch" onChange={handleFilterChange} className="w-full sm:w-48 p-2 border rounded-md bg-white shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Todas las Sucursales</option>
                        {initialBranches.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <select name="service" onChange={handleFilterChange} className="w-full sm:w-48 p-2 border rounded-md bg-white shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        <option value="all">Todos los Servicios</option>
                        <option>Pilates Reformer</option>
                        <option>Pilates Mat</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-700 text-sm sm:text-base">14/7/2025 - 20/7/2025</span>
                    <div className="flex items-center bg-white rounded-md border shadow-sm">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-l-md transition-colors"><ChevronLeft size={18} /></button>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 border-l rounded-r-md transition-colors"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {daysOfWeek.map((day) => (
                    <div key={day} className="bg-gray-50 p-2 rounded-lg">
                        <h3 className="font-bold text-center text-sm text-gray-600 mb-3 uppercase tracking-wider">{day}</h3>
                        <div className="space-y-2">
                            {filteredClasses.filter(c => c.day === day).sort((a, b) => a.time.localeCompare(b.time)).map(classInfo => (
                                <ClassCard key={classInfo.id} classInfo={classInfo} onSelect={setSelectedClassId} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {selectedClass && (
                <ClassDetailModal
                    classInfo={selectedClass}
                    students={selectedClassStudents}
                    waitlist={selectedClassWaitlist}
                    onClose={() => setSelectedClassId(null)}
                    onCancelAndPromote={handleCancelAndPromote}
                />
            )}
        </div>
    );
};

export default CalendarView;
