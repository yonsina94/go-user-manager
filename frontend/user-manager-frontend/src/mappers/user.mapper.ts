import type { User, UserDTO } from "../types/user";

export const mapUserDtoToUser = (dto: UserDTO): User => {
    return {
        id: dto.id,
        name: dto.name,
        lastname: dto.lastName,
        username: dto.username,
        email: dto.email,
        role: dto.role,
        active: dto.active,
        createAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    };
};

export const mapUserDtosToUsers = (dtos: UserDTO[]): User[] => {
    return dtos.map(mapUserDtoToUser);
};

export const mapUserToUserDto = (user: User): UserDTO => {
    return {
        id: user.id,
        name: user.name,
        lastName: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createAt.toISOString(),
    };
};

export const mapUsersToDtos = (users: User[]): UserDTO[] => {
    return users.map(mapUserToUserDto);
};