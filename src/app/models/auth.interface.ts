export interface Rol {
    id: number;
    rol: string;
}

export interface Usuario {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    cargo: string;
    unidad: string;
    roles: Rol[];
}
export interface Login{
    username: string,
    password: string
}
export interface LoginResponse{
    access: string,
    refresh: string
}
