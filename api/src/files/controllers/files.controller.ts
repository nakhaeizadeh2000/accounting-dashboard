import { Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import {
  filesControllerDecorators,
  filesFindOneEndpointDecorators,
} from './combined-decorators';

@filesControllerDecorators()
export class FilesController {
  // constructor(private readonly permissionService: PermissionService) { }

  // @permissionCreateEndpointDecorators()
  // create(@Body() createPermissionDto: CreatePermissionDto) {
  //   return this.permissionService.create(createPermissionDto);
  // }

  // @permissionFindAllEndpointDecorators()
  // getAll() {
  //   return this.permissionService.getAll();
  // }

  @filesFindOneEndpointDecorators()
  findOne(@Param('filename') filename: string, @Res({ passthrough: true }) response: FastifyReply) {
    console.log('filename: ', filename);

    response.header('X-Accel-Redirect', `/api/files/${filename}`);
    response.send();

    // Perform permission check here
    // if (await this.hasPermission(filename)) {
    //   // Set the X-Accel-Redirect header
    //   res.header('X-Accel-Redirect', `/protected-files/${filename}`);
    //   res.send();
    // } else {
    //   res.status(403).send('Access denied');
    // }
  }

  // @permissionUpdateEndpointDecorators()
  // update(
  //   @Param('id') id: number,
  //   @Body() updatePermissionDto: UpdatePermissionDto,
  // ) {
  //   return this.permissionService.update(id.toString(), updatePermissionDto);
  // }

  // @permissionDeleteEndpointDecorators()
  // remove(@Param('id') id: number) {
  //   return this.permissionService.remove(id.toString());
  // }
}
