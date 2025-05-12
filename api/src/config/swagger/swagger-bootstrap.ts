import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export async function swaggerBootstrap(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('nest api')
    .setDescription('nest api documentation')
    .setVersion('1.0')
    .addTag('nest api')
    .addBearerAuth()
    // .addOAuth2()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const options: SwaggerCustomOptions = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    swaggerOptions: {
      withCredentials: true,
    },
  };

  SwaggerModule.setup('api/swagger', app, document, options);
}
