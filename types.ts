
export type ViewType = 'Calendario' | 'Sucursales' | 'Empleados' | 'Clientes' | 'Calificacion' | 'Pagos';

export interface IClient {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'Activo' | 'Inactivo';
    gender: 'Femenino' | 'Masculino' | 'Otro';
    rut: string;
    branch: string;
    avatar: string;
}

export interface IEmployee {
    id: number;
    name: string;
    code: string;
    address: string;
    status: 'Habilitado' | 'Deshabilitado';
    lastName1: string;
    lastName2: string;
    rut: string;
    birthDate: string;
    gender: 'Femenino' | 'Masculino' | 'Otro';
    phone: string;
    email: string;
    company: string;
    role: string;
    profile: string;
    branches: string[];
}

export interface IBranch {
    id: number;
    name: string;
    code: string;
    address: string;
    status: 'Habilitado' | 'Deshabilitado';
}

export interface IPaymentMethod {
    id: number;
    name: string;
    description: string;
    status: 'Habilitado' | 'Deshabilitado';
}

export interface IRating {
    id: number;
    service: string;
    rating: number;
    branch: string;
    monitor: string;
    date: string;
    client: string;
    comment: string;
}

export interface IClass {
    id: number;
    day: string;
    time: string;
    service: string;
    instructor: string;
    capacity: number;
    branch: string;
    registered: number;
    waitlist: number;
}

export interface IStudent {
    id: number;
    name: string;
}

export interface IWaitlistItem {
    id: number;
    name: string;
}

export interface IClientPlan {
    id: number;
    name: string;
    price: string;
    purchaseDate: string;
    startDate: string;
    endDate: string;
    consumed: number;
    total: number;
    status: string;
}

export interface IClientActivity {
    id: number;
    date: string;
    month: string;
    class: string;
    time: string;
    status: string;
    instructor: string;
    planId: number;
    planName: string;
}

export interface IClientPayment {
    id: number;
    date: string;
    time: string;
    amount: string;
    method: string;
    type: string;
}

export interface IClientDocument {
    id: number;
    name: string;
    uploadDate: string;
}

export interface IClientDetails {
    plans: IClientPlan[];
    activities: IClientActivity[];
    payments: IClientPayment[];
    documents: IClientDocument[];
}
