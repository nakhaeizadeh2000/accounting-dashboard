// import { Injectable, Inject } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Permission } from '../entities/permission.entity';
// import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
// import { CreatePermissionDto } from '../dto/create-permission.dto';
// import { UpdatePermissionDto } from '../dto/update-permission.dto';
// import { plainToInstance } from 'class-transformer';
// import { ResponsePermissionDto } from '../dto/response-permission.dto';

// @Injectable()
// export class PermissionService {
//   constructor(
//     @InjectRepository(Permission)
//     private permissionRepository: Repository<Permission>,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//   ) {}

//   async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
//     const permission = this.permissionRepository.create(createPermissionDto);
//     await this.permissionRepository.save(permission);
//     return permission;
//   }

//   async getAll(): Promise<Permission[]> {
//     const permissions = await this.permissionRepository.find();
//     return permissions;
//   }

//   async findOne(id: string): Promise<ResponsePermissionDto> {
//     const role = await this.permissionRepository.findOne({
//       where: { id },
//     });
//     return plainToInstance(ResponsePermissionDto, role, {
//       excludeExtraneousValues: true,
//     });
//   }

//   async update(
//     id: string,
//     updatePermissionDto: UpdatePermissionDto,
//   ): Promise<ResponsePermissionDto> {
//     await this.permissionRepository.update(id, updatePermissionDto);
//     const { roles, ...permission } = await this.permissionRepository.findOne({
//       where: { id },
//       relations: {
//         roles: { users: true },
//       },
//     });

//     roles.forEach(async (role) =>
//       role.users.forEach(async (user) => {
//         await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
//         const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
//         await this.cacheManager.del(refreshTokenCacheKey);
//       }),
//     );
//     const response = plainToInstance(ResponsePermissionDto, permission, {
//       excludeExtraneousValues: true,
//     });
//     return response;
//   }

//   async remove(id: string): Promise<void> {
//     await this.permissionRepository.delete(id);
//     const { roles, ...permission } = await this.permissionRepository.findOne({
//       where: { id },
//       relations: {
//         roles: { users: true },
//       },
//     });
//     roles.forEach(async (role) =>
//       role.users.forEach(async (user) => {
//         await this.cacheManager.del(`ability_rules_by_user_id_${user.id}`);
//         const refreshTokenCacheKey = `refresh_tokens_by_user_id_${user.id}`;
//         await this.cacheManager.del(refreshTokenCacheKey);
//       }),
//     );
//   }
// }
